import { prisma } from '#app/utils/db.server.ts'
import { seed } from '#tests/db-utils.ts'

seed()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
