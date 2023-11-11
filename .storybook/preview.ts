import type { Preview } from '@storybook/react'
import '#app/styles/tailwind.css'
import { prisma } from '#app/utils/db.server.ts'
import { type Mock } from '@storybook/test'
import {
	installCryptoPolyfill,
	installUnsecureHeaderPolyfill,
} from '#tests/storybook-utils.tsx'
import fs from 'node:fs'

installUnsecureHeaderPolyfill()
installCryptoPolyfill()

// instead of reading the files from fs, serve those static files over http
const original = fs.promises.readFile
// @ts-ignore
fs.promises.readFile = async (filename, ...args) => {
	if (
		typeof filename === 'string' &&
		(filename.endsWith('.png') || filename.endsWith('.jpg'))
	) {
		return await (await fetch(filename)).arrayBuffer()
	}
	return original(filename, ...args)
}

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
		layout: 'fullscreen',
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
