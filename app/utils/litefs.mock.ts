export const ensurePrimary = async () => {}
export const ensureInstance = async () => {}
export const getAllInstances = async () => {
	return { 'some-instance': 'local' }
}
export const getInstanceInfo = async () => {
	return {
		primaryInstance: 'some-instance',
		currentInstance: 'some-instance',
		currentIsPrimary: true,
	}
}
