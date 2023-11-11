import { type Meta, type StoryObj } from '@storybook/react'
import { RouteStory, seedLoader } from '#tests/storybook-utils.tsx'

const meta = {
	loaders: [seedLoader],
	component: RouteStory,
	title: 'app/routes/settings+/profile.change-email',
	args: {
		url: '/settings/profile/change-email',
		role: 'user',
	},
} satisfies Meta<typeof RouteStory>
export default meta

type Story = StoryObj<typeof meta>

export const User: Story = {}
