import { faker } from '@faker-js/faker'
import { action } from '@storybook/addon-actions'
import { http, type HttpHandler, HttpResponse } from 'msw'
import { requireHeader, writeEmail } from './utils.ts'

const { json } = HttpResponse

export const handlers: Array<HttpHandler> = [
	http.post(`https://api.resend.com/emails`, async ({ request }) => {
		requireHeader(request.headers, 'Authorization')
		const body = await request.json()
		console.info('🔶 mocked email contents:', body)
		action('Email')(body)

		const email = await writeEmail(body)

		return json({
			id: faker.string.uuid(),
			from: email.from,
			to: email.to,
			created_at: new Date().toISOString(),
		})
	}),
]
