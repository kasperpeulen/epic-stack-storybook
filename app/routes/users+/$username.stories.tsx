import { type Meta, type StoryObj } from '@storybook/react'
import { RouteStory, seedLoader } from '#tests/storybook-utils.tsx'

const meta = {
	loaders: [seedLoader],
	component: RouteStory,
	args: {
		url: '/users/kody',
	},
} satisfies Meta<typeof RouteStory>
export default meta

type Story = StoryObj<typeof meta>

export const Admin: Story = {
	args: {
		url: '/users/kody',
		role: 'admin',
	},
}

export const User: Story = {
	args: {
		url: '/users/xj_aleen32',
		role: 'user',
	},
}

export const Anonymous: Story = {
	args: {
		url: '/users/kody',
		role: 'none',
	},
}
