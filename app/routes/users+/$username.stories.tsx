import { Meta } from '@storybook/react'
import { faker } from '@faker-js/faker'
import { seed } from '#prisma/seed.ts'
import ProfileRoute from '#app/routes/users+/$username.tsx'
import { createUser } from '#tests/db-utils.ts'
import { prisma } from '#app/utils/db.server.ts'
import {
	getPasswordHash,
	getSessionExpirationDate,
	sessionKey,
} from '#app/utils/auth.server.ts'
import { authSessionStorage } from '#app/utils/session.server.ts'
import { cookieMiddleware } from '#tests/storybook-utils.ts'
import { useEffect, useRef } from 'react'
import { action } from '@storybook/addon-actions'
import { parse, serialize } from 'cookie'
import { createRemixStub } from '#tests/create-remix-stub.tsx'
import { Router } from '@remix-run/router'
import { createRouteManifest } from '#tests/route-manifest.js'

const idToSeed = (id: string) =>
	id
		.split('')
		.map(it => it.charCodeAt(0))
		.reduce((a, b) => a + b, 0)

export default {
	component: ProfileRoute,
	loaders: [
		async context => {
			faker.seed(idToSeed(context.id))
			await seed()

			const userData = createUser()
			const user = await prisma.user.create({
				select: { id: true, email: true, username: true, name: true },
				data: {
					...userData,
					roles: { connect: { name: 'user' } },
					password: {
						create: { hash: await getPasswordHash(userData.username) },
					},
				},
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

			// reset all cookies
			Object.keys(parse(document.cookie))
				.map(key => serialize(key, '', { maxAge: -1 }))
				.forEach(cookie => {
					document.cookie = cookie
				})

			document.cookie = (
				await authSessionStorage.commitSession(authSession)
			).replaceAll('HttpOnly; ', '')
			console.log(prisma.$getInternalState())
			return {}
		},
	],
	render: () => {
		const RemixStub = createRemixStub(
			createRouteManifest({ middleware: cookieMiddleware }),
		)

		const routerRef = useRef<Router>()

		useEffect(() => {
			console.log(routerRef)
			const unsubscribe = routerRef.current?.subscribe(routerState => {
				const { location, navigation } = routerState

				if (navigation.state === 'idle') {
					action(`Navigation to ${location.pathname}`)({
						location,
						db: { ...prisma.$getInternalState() },
						cookie: parse(document.cookie),
					})
				}
			})

			return unsubscribe
		}, [routerRef.current])

		return <RemixStub initialEntries={['/users/kody']} routerRef={routerRef} />
	},
} satisfies Meta

export const Default = {
	args: {},
}
