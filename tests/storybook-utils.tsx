import type {
	ActionFunction,
	ActionFunctionArgs,
	LoaderFunction,
	LoaderFunctionArgs,
} from '@remix-run/router'
import { Router } from '@remix-run/router'
import { RouteObject } from 'react-router-dom'
import * as setCookieParser from 'set-cookie-parser'
import crypto from 'crypto'
import { action } from '@storybook/addon-actions'
import {
	createRemixStub,
	type StubRouteObject,
} from '#tests/create-remix-stub.tsx'
import routeManifest from '#route-manifest.json'
import { useEffect, useRef } from 'react'
import { prisma } from '#app/utils/db.mock.ts'
import { parse, serialize } from 'cookie'
import { diff } from '@vitest/utils/dist/diff.js'
import { Loader } from '@storybook/react'
import { faker } from '@faker-js/faker'
import { seed } from '#prisma/seed.ts'
import { createUser } from '#tests/db-utils.ts'
import {
	getPasswordHash,
	getSessionExpirationDate,
	sessionKey,
} from '#app/utils/auth.server.ts'
import { authSessionStorage } from '#app/utils/session.server.ts'

type DataFunction = LoaderFunction | ActionFunction
type DataFunctionArgs = LoaderFunctionArgs | ActionFunctionArgs

export type Middleware = (
	fn: DataFunction,
) => (args: DataFunctionArgs) => ReturnType<DataFunction>

export const lazy = (
	url: () => Promise<{ default: RouteObject['Component'] } & RouteObject>,
	middleware?: Middleware,
) => {
	return () =>
		url().then(mod => ({
			...mod,
			loader: mod.loader && middleware ? middleware(mod.loader) : mod.loader,
			action: mod.action && middleware ? middleware(mod.action) : mod.action,
			Component: mod.default,
		}))
}

/**
 * This a little hack to make sure that cookie and set-cookie can be set and get in the browser.
 * This is not possible normally, because of security concerns.
 */
export function installUnsecureHeaderPolyfill() {
	const originalGet = globalThis.Headers.prototype.get
	globalThis.Headers.prototype.get = function (name) {
		if (name.toLowerCase() === 'cookie')
			return (
				(
					originalGet.call(this, 'cookie') ?? originalGet.call(this, '$cookie')
				)?.replaceAll('HttpOnly; ', '') ?? null
			)
		if (name.toLowerCase() === 'set-cookie')
			return (
				(
					originalGet.call(this, 'set-cookie') ??
					originalGet.call(this, 'set-$cookie')
				)?.replaceAll('HttpOnly; ', '') ?? null
			)
		return originalGet.call(this, name)
	}
	const originalSet = globalThis.Headers.prototype.set
	globalThis.Headers.prototype.set = function (name, value) {
		if (name.toLowerCase() === 'cookie')
			return originalSet.call(this, '$cookie', value)
		if (name.toLowerCase() === 'set-cookie') {
			return originalSet.call(this, 'set-$cookie', value)
		}
		return originalSet.call(this, name, value)
	}
	const originalAppend = globalThis.Headers.prototype.append
	globalThis.Headers.prototype.append = function (name, value) {
		if (name.toLowerCase() === 'cookie')
			return originalAppend.call(this, '$cookie', value)
		if (name.toLowerCase() === 'set-cookie') {
			return originalAppend.call(this, 'set-$cookie', value)
		}
		return originalAppend.call(this, name, value)
	}

	globalThis.Headers.prototype.getSetCookie = function () {
		return setCookieParser.splitCookiesString(this.get(`set-$cookie`) ?? '')
	}

	window.Headers = class Bla extends Headers {
		constructor(init?: HeadersInit) {
			super(init)
			const setCookie = this.get('set-cookie')
			if (setCookie) this.set('set-$cookie', setCookie)
			const cookie = this.get('cookie')
			if (cookie) this.set('$cookie', cookie)
		}
	}
}

export function installCryptoPolyfill() {
	crypto.timingSafeEqual = (a: any, b: any): boolean => {
		if (a.byteLength !== b.byteLength) return false
		let len = a.length,
			different = false
		while (len-- > 0) {
			// must check all items until complete
			if (a[len] !== b[len]) different = true
		}
		return !different
	}
}

export const cookieMiddleware: Middleware = fn => async args => {
	const request = args.request
	request.headers.set('cookie', document.cookie)
	const url = `${request.method} ${
		request.url.split(new URL(request.url).host)[1]
	}`
	const formData =
		request.method === 'POST'
			? [...(await request.clone().formData())]
			: undefined
	action(`Request`)({
		url: url,
		headers: Object.fromEntries(request.headers),
		formData,
	})

	let response
	try {
		response = await fn(args)
	} catch (e) {
		if (!(e instanceof Response)) throw e
		response = e
	}

	if (response instanceof Response) {
		const newCookies = response.headers.getSetCookie()
		if (newCookies) {
			newCookies.forEach(cookie => (document.cookie = cookie))
		}

		const cloned = response.clone()

		let body
		// try {
		// 	body = await cloned.json()
		// } catch (e) {
		// 	body = await cloned.text()
		// }

		action(`Response`)({
			url,
			status: cloned.status,
			statusText: cloned.statusText,
			body,
			headers: Object.fromEntries(cloned.headers),
		})
		if (!response.ok) {
			throw response
		}
	}

	return response
}

export const createRouteManifest = ({
	manifest,
	middleware,
}: {
	manifest: typeof routeManifest
	middleware: Middleware
}): StubRouteObject[] => {
	return manifest.map(route => {
		return {
			...route,
			lazy: lazy(() => import('../../app/' + route.file), middleware),
			children: route.children
				? createRouteManifest({
						manifest: route.children as typeof routeManifest,
						middleware,
				  })
				: undefined,
		}
	}) as StubRouteObject[]
}

type RouteArgs = { url: string; role: 'admin' | 'user' | 'none' }

const RemixStub = createRemixStub(
	createRouteManifest({
		manifest: routeManifest,
		middleware: cookieMiddleware,
	}),
)
export const RouteStory = ({ url }: RouteArgs) => {
	const routerRef = useRef<Router>()
	const oldState = useRef<any>()

	useEffect(() => {
		const unsubscribe = routerRef.current?.subscribe(routerState => {
			const { location, navigation } = routerState

			if (navigation.state === 'submitting') {
				action(`POST ${navigation.formAction}`)({
					...navigation,
					formData: navigation.formData ? [...navigation.formData] : undefined,
				})
			}

			if (
				navigation.state === 'loading' &&
				!navigation.location?.state?._isRedirect
			) {
				const url = `${navigation.location.pathname}${navigation.location.search}${navigation.location.hash}`

				action(`GET ${url}`)({
					navigation,
				})
			}

			if (navigation.state === 'idle') {
				const state = {
					url: `${location.pathname}${location.search}${location.hash}`,
					db: { ...prisma.$getInternalState() },
					cookie: parse(document.cookie),
				}
				let diffObject = undefined
				if (oldState.current) {
					const options = {
						omitAnnotationLines: true,
						expand: false,
					}
					diffObject = {
						url: diff(oldState.current.url, state.url, {
							...options,
						}),
						db: diff(oldState.current.db, state.db, {
							...options,
						}),
						cookie: diff(oldState.current.cookie, state.cookie, {
							...options,
						}),
					}
				}
				oldState.current = state
				action(`Navigation`)({
					...state,
					diff: diffObject,
				})
			}
		})

		return unsubscribe
	}, [routerRef.current])

	return <RemixStub initialEntries={[url]} routerRef={routerRef} />
}
export const idToSeed = (id: string) =>
	id
		.split('')
		.map(it => it.charCodeAt(0))
		.reduce((a, b) => a + b, 0)

let seedCache: Record<string, unknown> = {}

export const seedLoader: Loader<RouteArgs> = async context => {
	faker.seed(idToSeed(context.id))

	if (seedCache[context.id]) {
		const data = prisma.$getInternalState()
		for (var member in data) {
			// @ts-ignore
			data[member] = seedCache[context.id][member]
		}
	} else {
		await seed()
		seedCache[context.id] = prisma.$getInternalState()
	}

	// const userData = createUser()
	// const user = await prisma.user.create({
	// 	select: { id: true, email: true, username: true, name: true },
	// 	data: {
	// 		...userData,
	// 		roles: { connect: { name: 'user' } },
	// 		password: {
	// 			create: { hash: await getPasswordHash(userData.username) },
	// 		},
	// 	},
	// })

	// reset all cookies
	Object.keys(parse(document.cookie))
		.map(key => serialize(key, '', { maxAge: -1 }))
		.forEach(cookie => {
			document.cookie = cookie.replaceAll('HttpOnly; ', '')
		})

	let user
	if (context.args.role !== 'none') {
		user = await prisma.user.findFirstOrThrow({
			where: { roles: { some: { name: context.args.role } } },
		})
		const session = await prisma.session.create({
			data: {
				expirationDate: getSessionExpirationDate(),
				userId: user.id,
			},
			select: { id: true },
		})

		const authSession = await authSessionStorage.getSession()
		authSession.set(sessionKey, session.id)

		document.cookie = (
			await authSessionStorage.commitSession(authSession)
		).replaceAll('HttpOnly; ', '')
	}

	console.log(prisma.$getInternalState())

	return {
		user,
	}
}
