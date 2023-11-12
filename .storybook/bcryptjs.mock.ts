// Use a fake fast hash for seeding in storybook.
export const hashSync = (password: string) =>
	`fake-hash-${password.length}-${password.charCodeAt(0)}`

export const hash = async (password: string) =>
	`fake-hash-${password.length}-${password.charCodeAt(0)}`

export const compare = async (password: string, hash: string) =>
	hashSync(password) === hash

export default {
	hashSync,
	hash,
	compare,
}
