import json from '#prisma/dmmf.json'
import createPrisma from 'prisma-mock'
import { fn } from '@storybook/test'
import { type PrismaClient } from '@prisma/client'
import chalk from "#node_modules/chalk/source/index.js";

globalThis.jest = { fn }
export const prisma = createPrisma({}, json.datamodel) as PrismaClient
