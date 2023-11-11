import { Meta } from '@storybook/react'
import { RouteStory, seedLoader } from '#tests/storybook-utils.tsx'

export default {
	loaders: [seedLoader],
	component: RouteStory,
	args: {
		url: '/users',
	},
} satisfies Meta

export const Default = {
	args: {},
}
