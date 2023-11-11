import json from '#prisma/dmmf.json'
import createPrismaMock, { PrismaMockData } from 'prisma-mock'
import { fn } from '@storybook/test'
import { type Prisma, type PrismaClient } from '@prisma/client'

// @ts-ignore
globalThis.jest = { fn }

// See https://github.com/demonsters/prisma-mock/issues/51
export const prisma = (
	createPrismaMock as unknown as typeof createPrismaMock.default<
		PrismaClient & {
			$getInternalState: () => Required<PrismaMockData<PrismaClient>>
		}
	>
)({}, json.datamodel as Prisma.DMMF.Datamodel)
