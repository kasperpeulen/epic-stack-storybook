import { setupWorker } from 'msw/browser'
import { handlers as githubHandlers } from './github.ts'
import { handlers as resendHandlers } from './resend.ts'
import { http } from 'msw'

const miscHandlers = [
	http.get('/resources/user-images/:imageId', ({ request, params }) =>
		import('#app/routes/resources+/user-images.$imageId.tsx').then(
			({ loader }) => loader({ request, params }),
		),
	),
	http.get('/resources/note-images/:imageId', ({ request, params }) =>
		import('#app/routes/resources+/note-images.$imageId.tsx').then(
			({ loader }) => loader({ request, params }),
		),
	),

	http.get('/resources/download-user-data', ({ request, params }) =>
		import('#app/routes/resources+/download-user-data.tsx').then(
			({ loader }) => loader({ request, params }),
		),
	),
]

export const server = setupWorker(
	...miscHandlers,
	...resendHandlers,
	...githubHandlers,
)

server.start({ onUnhandledRequest: 'bypass' })

console.log(server)
console.info('🔶 Mock server installed')
