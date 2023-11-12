// import {fileURLToPath as } from "node:url";
export * from '#node_modules/node-stdlib-browser/esm/proxy/url.js'
import * as actual from '#node_modules/node-stdlib-browser/esm/proxy/url.js'

// pretend that we actually have file urls
export const fileURLToPath = (url: string) => {
	return actual.fileURLToPath('file:' + new URL(url).pathname)
}
