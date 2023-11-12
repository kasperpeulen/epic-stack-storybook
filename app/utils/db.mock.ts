import { type Prisma, type PrismaClient } from '@prisma/client'
import { fn, type MaybeMockedDeep } from '@storybook/test'
import createPrismaMock, { type PrismaMockData } from 'prisma-mock'
import json from '#prisma/dmmf.json'

// @ts-ignore
globalThis.jest = { fn }

// See https://github.com/demonsters/prisma-mock/issues/51
export const prisma = (
	createPrismaMock as unknown as typeof createPrismaMock.default<
		MaybeMockedDeep<PrismaClient> & {
			$getInternalState: () => Required<PrismaMockData<PrismaClient>>
		}
	>
)({}, json.datamodel as Prisma.DMMF.Datamodel)
