import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import dotenv from 'dotenv'

const config: StorybookConfig = {
	stories: ['../**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	addons: [
		// "@storybook/addon-links",
		"@storybook/addon-essentials",
		// "@storybook/addon-onboarding",
		'@storybook/addon-interactions',
	],
	typescript: {
		reactDocgen: false,
	},
	framework: {
		name: '@storybook/react-vite',
		options: {},
	},
	docs: {
		autodocs: 'tag',
	},
	staticDirs: ['../public', '../tests/fixtures'],
	async viteFinal(config, { configType }) {
		return mergeConfig(config, {
			define: {
				'process.env': {
					...dotenv.config({ path: '.env.example' }).parsed,
					NODE_ENV: configType?.toLowerCase(),
				},
			},
			plugins: [
				tsconfigPaths(),
				nodePolyfills({
					exclude: ['fs'],
					// Whether to polyfill specific globals.
					globals: {
						Buffer: true, // can also be 'build', 'dev', or false
						global: true,
						process: true,
					},
					// Override the default polyfills for specific modules.
					overrides: {
						// Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
						fs: 'memfs',
						// "fs/promises": "memfs",
						// "node:fs/promises": "memfs"
					},
					// Whether to polyfill `node:` protocol imports.
					protocolImports: true,
				}),
			],
			resolve: {
				alias: [
					{ find: '@remix-run/react', replacement: 'react-router-dom' },
					{ find: 'graceful-fs', replacement: 'memfs' },
					{
						find: /^(.*)(db|cache|litefs)\.server(.*)$/,
						replacement: '$1$2.mock$3',
					},
				],
			},
		})
	},
}
export default config
