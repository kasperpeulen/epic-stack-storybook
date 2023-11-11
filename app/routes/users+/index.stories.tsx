import { Meta, StoryObj } from '@storybook/react'
import { RouteStory, seedLoader } from '#tests/storybook-utils.tsx'
import { prisma } from '#app/utils/db.mock.ts'

const meta = {
	loaders: [
		seedLoader,
		async () => {
			// mock the raw query
			// @ts-ignore
			prisma.$queryRaw.mockImplementation(async () => {
				const users = await prisma.user.findMany({
					include: { image: true },
				})
				return users.map(it => ({ ...it, imageId: it.image?.id }))
			})
			return {}
		},
	],
	component: RouteStory,
	args: {
		url: '/users',
		role: 'none',
	},
} satisfies Meta<typeof RouteStory>
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
