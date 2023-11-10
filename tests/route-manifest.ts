import { lazy, Middleware } from '#tests/storybook-utils.ts'

export const createRouteManifest = ({
	middleware,
}: {
	middleware: Middleware
}) => {
	return [
		{
			id: 'root',
			path: '',
			lazy: lazy(
				() =>
					import('#app/root.tsx').then(it => ({
						...it,
						default: it.AppWithProviders,
					})),
				middleware,
			),
			children: [
				{
					id: 'routes/$',
					path: '*',
					lazy: lazy(() => import('#app/routes/$.tsx'), middleware),
				},
				{
					id: 'routes/_auth+/auth.$provider',
					path: 'auth/:provider',
					lazy: lazy(
						() => import('#app/routes/_auth+/auth.$provider.ts'),
						middleware,
					),
					children: [
						{
							id: 'routes/_auth+/auth.$provider.callback',
							path: 'callback',
							lazy: lazy(
								() => import('#app/routes/_auth+/auth.$provider.callback.ts'),
								middleware,
							),
						},
					],
				},
				{
					id: 'routes/_auth+/forgot-password',
					path: 'forgot-password',
					lazy: lazy(
						() => import('#app/routes/_auth+/forgot-password.tsx'),
						middleware,
					),
				},
				{
					id: 'routes/_auth+/login',
					path: 'login',
					lazy: lazy(() => import('#app/routes/_auth+/login.tsx'), middleware),
				},
				{
					id: 'routes/_auth+/logout',
					path: 'logout',
					lazy: lazy(() => import('#app/routes/_auth+/logout.tsx'), middleware),
				},
				{
					id: 'routes/_auth+/onboarding',
					path: 'onboarding',
					lazy: lazy(
						() => import('#app/routes/_auth+/onboarding.tsx'),
						middleware,
					),
				},
				{
					id: 'routes/_auth+/onboarding_.$provider',
					path: 'onboarding/:provider',
					lazy: lazy(
						() => import('#app/routes/_auth+/onboarding_.$provider.tsx'),
						middleware,
					),
				},
				{
					id: 'routes/_auth+/reset-password',
					path: 'reset-password',
					lazy: lazy(
						() => import('#app/routes/_auth+/reset-password.tsx'),
						middleware,
					),
				},
				{
					id: 'routes/_auth+/signup',
					path: 'signup',
					lazy: lazy(() => import('#app/routes/_auth+/signup.tsx'), middleware),
				},
				{
					id: 'routes/_auth+/verify',
					path: 'verify',
					lazy: lazy(() => import('#app/routes/_auth+/verify.tsx'), middleware),
				},
				{
					id: 'routes/_marketing+/about',
					path: 'about',
					lazy: lazy(
						() => import('#app/routes/_marketing+/about.tsx'),
						middleware,
					),
				},
				{
					id: 'routes/_marketing+/index',
					index: true,
					lazy: lazy(
						() => import('#app/routes/_marketing+/index.tsx'),
						middleware,
					),
				},
				{
					id: 'routes/_marketing+/privacy',
					path: 'privacy',
					lazy: lazy(
						() => import('#app/routes/_marketing+/privacy.tsx'),
						middleware,
					),
				},
				{
					id: 'routes/_marketing+/support',
					path: 'support',
					lazy: lazy(
						() => import('#app/routes/_marketing+/support.tsx'),
						middleware,
					),
				},
				{
					id: 'routes/_marketing+/tos',
					path: 'tos',
					lazy: lazy(
						() => import('#app/routes/_marketing+/tos.tsx'),
						middleware,
					),
				},
				{
					id: 'routes/_seo+/robots[.]txt',
					path: 'robots.txt',
					lazy: lazy(
						() => import('#app/routes/_seo+/robots[.]txt.ts'),
						middleware,
					),
				},
				{
					id: 'routes/_seo+/sitemap[.]xml',
					path: 'sitemap.xml',
					lazy: lazy(
						() => import('#app/routes/_seo+/sitemap[.]xml.ts'),
						middleware,
					),
				},
				{
					id: 'routes/me',
					path: 'me',
					lazy: lazy(() => import('#app/routes/me.tsx'), middleware),
				},
				{
					id: 'routes/resources+/healthcheck',
					path: 'resources/healthcheck',
					lazy: lazy(
						() => import('#app/routes/resources+/healthcheck.tsx'),
						middleware,
					),
				},
				{
					id: 'routes/resources+/note-images.$imageId',
					path: 'resources/note-images/:imageId',
					lazy: lazy(
						() => import('#app/routes/resources+/note-images.$imageId.tsx'),
						middleware,
					),
				},
				{
					id: 'routes/resources+/user-images.$imageId',
					path: 'resources/user-images/:imageId',
					lazy: lazy(
						() => import('#app/routes/resources+/user-images.$imageId.tsx'),
						middleware,
					),
				},
				{
					id: 'routes/settings+/profile',
					path: 'settings/profile',
					lazy: lazy(
						() => import('#app/routes/settings+/profile.tsx'),
						middleware,
					),
					children: [
						{
							id: 'routes/settings+/profile.change-email',
							path: 'change-email',
							lazy: lazy(
								() => import('#app/routes/settings+/profile.change-email.tsx'),
								middleware,
							),
						},
						{
							id: 'routes/settings+/profile.connections',
							path: 'connections',
							lazy: lazy(
								() => import('#app/routes/settings+/profile.connections.tsx'),
								middleware,
							),
						},
						{
							id: 'routes/settings+/profile.index',
							index: true,
							lazy: lazy(
								() => import('#app/routes/settings+/profile.index.tsx'),
								middleware,
							),
						},
						{
							id: 'routes/settings+/profile.password',
							path: 'password',
							lazy: lazy(
								() => import('#app/routes/settings+/profile.password.tsx'),
								middleware,
							),
						},
						{
							id: 'routes/settings+/profile.password_.create',
							path: 'password/create',
							lazy: lazy(
								() =>
									import('#app/routes/settings+/profile.password_.create.tsx'),
								middleware,
							),
						},
						{
							id: 'routes/settings+/profile.photo',
							path: 'photo',
							lazy: lazy(
								() => import('#app/routes/settings+/profile.photo.tsx'),
								middleware,
							),
						},
						{
							id: 'routes/settings+/profile.two-factor',
							path: 'two-factor',
							lazy: lazy(
								() => import('#app/routes/settings+/profile.two-factor.tsx'),
								middleware,
							),
							children: [
								{
									id: 'routes/settings+/profile.two-factor.disable',
									path: 'disable',
									lazy: lazy(
										() =>
											import(
												'#app/routes/settings+/profile.two-factor.disable.tsx'
											),
										middleware,
									),
								},
								{
									id: 'routes/settings+/profile.two-factor.index',
									index: true,
									lazy: lazy(
										() =>
											import(
												'#app/routes/settings+/profile.two-factor.index.tsx'
											),
										middleware,
									),
								},
								{
									id: 'routes/settings+/profile.two-factor.verify',
									path: 'verify',
									lazy: lazy(
										() =>
											import(
												'#app/routes/settings+/profile.two-factor.verify.tsx'
											),
										middleware,
									),
								},
							],
						},
					],
				},
				{
					id: 'routes/users+/$username',
					path: 'users/:username',
					lazy: lazy(
						() => import('#app/routes/users+/$username.tsx'),
						middleware,
					),
				},
				{
					id: 'routes/users+/$username_+/notes',
					path: 'users/:username/notes',
					lazy: lazy(
						() => import('#app/routes/users+/$username_+/notes.tsx'),
						middleware,
					),
					children: [
						{
							id: 'routes/users+/$username_+/notes.$noteId',
							path: ':noteId',
							lazy: lazy(
								() =>
									import('#app/routes/users+/$username_+/notes.$noteId.tsx'),
								middleware,
							),
						},
						{
							id: 'routes/users+/$username_+/notes.$noteId_.edit',
							path: ':noteId/edit',
							lazy: lazy(
								() =>
									import(
										'#app/routes/users+/$username_+/notes.$noteId_.edit.tsx'
									),
								middleware,
							),
						},
						{
							id: 'routes/users+/$username_+/notes.index',
							index: true,
							lazy: lazy(
								() => import('#app/routes/users+/$username_+/notes.index.tsx'),
								middleware,
							),
						},
						{
							id: 'routes/users+/$username_+/notes.new',
							path: 'new',
							lazy: lazy(
								() => import('#app/routes/users+/$username_+/notes.new.tsx'),
								middleware,
							),
						},
					],
				},
				{
					id: 'routes/users+/index',
					index: true,
					path: 'users/',
					lazy: lazy(() => import('#app/routes/users+/index.tsx'), middleware),
				},
			],
		},
	]
}
