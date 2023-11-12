import { type Meta, type StoryObj } from '@storybook/react'
import { RouteStory, seedLoader } from '#tests/storybook-utils.tsx'

const meta = {
	loaders: [seedLoader],
	component: RouteStory,
	title: 'app/routes/settings+/profile.two-factor.index',
	args: {
		url: '/settings/profile/two-factor',
		role: 'user',
	},
} satisfies Meta<typeof RouteStory>
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}