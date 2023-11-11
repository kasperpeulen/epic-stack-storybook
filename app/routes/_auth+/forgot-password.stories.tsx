import { Meta, StoryObj } from '@storybook/react'
import { RouteStory, seedLoader } from '#tests/storybook-utils.tsx'

const meta = {
	loaders: [seedLoader],
	component: RouteStory,
	title: 'app/routes/_auth+/forgot-password',
	args: {
		url: '/forgot-password',
		role: 'none',
	},
} satisfies Meta<typeof RouteStory>
export default meta

type Story = StoryObj<typeof meta>

export const Anonymous: Story = {}
