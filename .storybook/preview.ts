import type { Preview } from '@storybook/react'
import '#app/styles/tailwind.css'
import { prisma } from '#app/utils/db.server.ts'
import { type Mock } from '@storybook/test'
import {
	installCryptoPolyfill,
	installUnsecureHeaderPolyfill,
} from '#tests/storybook-utils.ts'

installUnsecureHeaderPolyfill()
installCryptoPolyfill()

const preview: Preview = {
	loaders: [
		async () => {
			// give a default empty mock implementation, can be overridden in the play function
			;(prisma.$queryRaw as Mock).mockImplementation(async () => [])
			;(prisma.$queryRawUnsafe as Mock).mockImplementation(async () => [])
			return {}
		},
	],
	parameters: {
		actions: { argTypesRegex: '^on[A-Z].*' },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
}

export default preview

import('#tests/mocks/index.browser.ts')
