import { remember } from '@epic-web/remember'
import {
	type Cache as CachifiedCache,
	type CacheEntry,
	cachified as baseCachified,
	type CachifiedOptions,
	lruCacheAdapter,
	mergeReporters,
	verboseReporter,
} from 'cachified'
import { LRUCache } from 'lru-cache'
import { cachifiedTimingReporter, type Timings } from './timing.server.ts'

const lru = remember(
	'lru-cache',
	() => new LRUCache<string, CacheEntry<unknown>>({ max: 5000 }),
)

export const lruCache = lruCacheAdapter(lru)

const data: Record<string, CacheEntry<unknown>> = {}

export const cache: CachifiedCache = {
	name: 'SQLite cache',
	get(key) {
		return data[key]
	},
	async set(key, entry) {
		data[key] = entry
	},
	async delete(key) {
		delete data[key]
	},
}

export async function getAllCacheKeys(limit: number) {
	return {
		sqlite: Object.keys(data),
		lru: [...lru.keys()],
	}
}

export async function searchCacheKeys(search: string, limit: number) {
	return {
		sqlite: Object.keys(data).filter(key => key.includes(search)),
		lru: [...lru.keys()].filter(key => key.includes(search)),
	}
}

export async function cachified<Value>({
	timings,
	reporter = verboseReporter(),
	...options
}: CachifiedOptions<Value> & {
	timings?: Timings
}): Promise<Value> {
	return baseCachified({
		...options,
		reporter: mergeReporters(cachifiedTimingReporter(timings), reporter),
	})
}
