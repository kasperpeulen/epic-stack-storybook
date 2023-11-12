import crypto from 'crypto'
import { faker } from '@faker-js/faker'
import {
	type ActionFunction,
	type ActionFunctionArgs,
	type LoaderFunction,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { type Router } from '@remix-run/router'
import { action } from '@storybook/addon-actions'
import { type Loader } from '@storybook/react'
import { diff } from '@vitest/utils/dist/diff.js'
import { parse, serialize } from 'cookie'
import * as memfs from 'memfs'
import { useEffect, useRef } from 'react'
import * as setCookieParser from 'set-cookie-parser'
import { useTheme } from '#app/root.js'
import { getSessionExpirationDate, sessionKey } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.mock.ts'
import { authSessionStorage } from '#app/utils/session.server.ts'
import { routeManifest } from '#route-manifest.ts'
import {
	createRemixStub,
	type StubRouteObject,
} from '#tests/create-remix-stub.tsx'
import { seed } from '#tests/db-utils.ts'

type DataFunction = LoaderFunction | ActionFunction
type DataFunctionArgs = LoaderFunctionArgs | ActionFunctionArgs

export type Middleware = (
	fn: DataFunction,
) => (args: DataFunctionArgs) => ReturnType<DataFunction>

export const lazy = (
	url: () => Promise<{
		loader?: DataFunction
		action?: DataFunction
		default: unknown
	}>,
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

	let response
	try {
		response = await fn(args)
	} catch (e) {
		if (e instanceof Response) {
			e.headers.getSetCookie().forEach(cookie => (document.cookie = cookie))
		}
		throw e
	}

	if (response instanceof Response) {
		response.headers
			.getSetCookie()
			.forEach(cookie => (document.cookie = cookie))
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
		const file = route.file().then(mod => ({
			...mod,
			default: function App() {
				const theme = useTheme()
				return (
					<div
						className={`${theme} h-full overflow-x-hidden bg-background text-foreground`}
					>
						<mod.App />
					</div>
				)
			},
		}))
		return {
			...route,
			lazy: lazy(route.id === 'root' ? () => file : route.file, middleware),
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
	const latestAction = useRef<any>()

	const devTools = useRef(
		'__REDUX_DEVTOOLS_EXTENSION__' in window
			? window.__REDUX_DEVTOOLS_EXTENSION__?.connect({})
			: undefined,
	)

	useEffect(() => {
		return routerRef.current?.subscribe(routerState => {
			const { location, navigation } = routerState
			const fetchers = [...routerState.fetchers]

			if (routerState.navigation.state === 'submitting') {
				const type = `${navigation.formMethod?.toUpperCase()} ${
					navigation.formAction
				}`
				const payload = {
					formData: navigation.formData ? [...navigation.formData] : undefined,
					json: navigation.json,
				}
				action(`Action ${type}`, { allowUndefined: false })(payload)
				latestAction.current = { type, ...payload }
			}

			if (fetchers.some(([, value]) => value.state === 'submitting')) {
				const navigation = fetchers.find(
					([, value]) => value.state === 'submitting',
				)![1]

				const type = `${navigation.formMethod?.toUpperCase()} ${
					navigation.formAction
				}`
				const payload = {
					formData: navigation.formData ? [...navigation.formData] : undefined,
					json: navigation.json,
					fetchers: fetchers,
				}
				action(`Action ${type}`, { allowUndefined: false })({
					formData: navigation.formData ? [...navigation.formData] : undefined,
					json: navigation.json,
					fetchers: fetchers,
				})
				latestAction.current = { type, ...payload }
			}

			if (
				navigation.state === 'loading' &&
				!navigation.formAction &&
				!navigation.location?.state?._isRedirect
			) {
				const url = `${navigation.location.pathname}${navigation.location.search}${navigation.location.hash}`
				const type = `GET ${url}`
				const payload = {
					location: navigation.location,
					fetchers: routerState.fetchers.size > 0 ? fetchers : undefined,
				}
				action(`Action GET ${url}`, { allowUndefined: false })(payload)
				latestAction.current = { type, ...payload }
			}

			if (
				navigation.state === 'idle' &&
				fetchers.every(([, value]) => value.state === 'idle')
			) {
				const state = {
					url: `${location.pathname}${location.search}${location.hash}`,
					db: { ...prisma.$getInternalState() },
					cookie: parse(document.cookie),
					fs: Object.fromEntries(
						Object.entries(memfs.vol.toJSON()).map(([key, value]) => {
							try {
								// @ts-ignore
								value = JSON.parse(value)
							} catch (e) {}
							return [key, value]
						}),
					),
				}

				if (oldState.current) {
					const options = { omitAnnotationLines: true, expand: false }
					const dbDiff = diff(oldState.current.db, state.db, options)
					const cookieDiff = diff(
						oldState.current.cookie,
						state.cookie,
						options,
					)
					const diffObject = Object.fromEntries(
						Object.entries({
							db:
								dbDiff === 'Compared values have no visual difference.'
									? undefined
									: dbDiff,
							cookie:
								cookieDiff === 'Compared values have no visual difference.'
									? undefined
									: cookieDiff,
						}).filter(([, value]) => value != null),
					)
					if (
						Object.keys(diffObject).length > 0 ||
						oldState.current.url !== state.url
					) {
						action(`State`, { allowUndefined: false })({
							...state,
							diff: diffObject,
						})
						devTools.current?.send(latestAction.current, state)
						oldState.current = state
					}
				} else {
					action(`State`, { allowUndefined: false })(state)
					devTools.current?.send({ type: '@@INIT' }, state)
					oldState.current = state
				}
			}
		})
	}, [])

	return <RemixStub initialEntries={[url]} routerRef={routerRef} />
}
export const idToSeed = (id: string) =>
	id
		.split('')
		.map(it => it.charCodeAt(0))
		.reduce((a, b) => a + b, 0)

export const seedLoader: Loader<RouteArgs> = async context => {
	faker.seed(idToSeed(context.id))

	await seed()

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
			data: { expirationDate: getSessionExpirationDate(), userId: user.id },
		})

		const authSession = await authSessionStorage.getSession()
		authSession.set(sessionKey, session.id)

		document.cookie = (
			await authSessionStorage.commitSession(authSession)
		).replaceAll('HttpOnly; ', '')
	}

	return { user }
}
