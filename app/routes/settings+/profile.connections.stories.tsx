import { Meta, StoryObj } from '@storybook/react'
import { RouteStory, seedLoader } from '#tests/storybook-utils.tsx'

const meta = {
	loaders: [seedLoader],
	component: RouteStory,
	title: 'app/routes/settings+/profile.connections',
	args: {
		url: '/settings/profile/connections',
		role: 'user',
	},
} satisfies Meta<typeof RouteStory>
export default meta

type Story = StoryObj<typeof meta>

export const User: Story = {}
