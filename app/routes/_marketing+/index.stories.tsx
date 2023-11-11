import { type Meta, type StoryObj } from '@storybook/react'
import { RouteStory, seedLoader } from '#tests/storybook-utils.tsx'

const meta = {
	loaders: [seedLoader],
	component: RouteStory,
	args: {
		url: '/',
	},
} satisfies Meta<typeof RouteStory>
export default meta

type Story = StoryObj<typeof meta>

export const User: Story = {
	args: {
		role: 'user',
	},
}
export const Admin: Story = {
	args: {
		role: 'admin',
	},
}

export const Anonymous: Story = {
	args: {
		role: 'none',
	},
}
