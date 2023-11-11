import { Meta, StoryObj } from '@storybook/react'
import { RouteStory, seedLoader } from '#tests/storybook-utils.tsx'

const meta = {
	loaders: [seedLoader],
	component: RouteStory,
	title: 'app/routes/users+/$username_+/notes.$noteId_.edit',
	args: {
		url: '/users/kody/notes/d27a197e/edit',
		role: 'admin',
	},
} satisfies Meta<typeof RouteStory>
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
