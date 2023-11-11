import { Meta, StoryObj } from '@storybook/react'
import { RouteStory, seedLoader } from '#tests/storybook-utils.tsx'
import { prisma } from '#app/utils/db.mock.ts'

const meta = {
	loaders: [seedLoader],
	component: RouteStory,
	title: 'app/routes/settings+/profile.password',
	args: {
		url: '/settings/profile/password',
		role: 'user',
	},
} satisfies Meta<typeof RouteStory>
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
