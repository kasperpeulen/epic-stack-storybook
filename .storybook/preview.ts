import type { Preview } from '@storybook/react'
import '#app/styles/tailwind.css'
import { prisma } from '#app/utils/db.server.ts'
import { type Mock } from '@storybook/test'
import {
	installCryptoPolyfill,
	installUnsecureHeaderPolyfill,
} from '#tests/storybook-utils.tsx'
import fs from 'node:fs'
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { allModes } from '#.storybook/modes.js'

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
	globalTypes: {
		theme: {
			description: 'Theme',
			defaultValue: 'light',
			toolbar: {
				title: 'Theme',
				icon: 'paintbrush',
				items: ['light', 'dark'],
				dynamicTitle: true,
			},
		},
	},
	parameters: {
		chromatic: {
			//🔶 Test each story for ArticleCard in two modes
			modes: {
				'light mobile': allModes['light mobile'],
				'light tablet': allModes['light tablet'],
				'dark mobile': allModes['dark mobile'],
				'dark tablet': allModes['dark tablet'],
			},
		},
		layout: 'fullscreen',
		viewport: {
			viewports: INITIAL_VIEWPORTS,
		},
		backgrounds: { disable: true, grid: { disable: true } },
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
