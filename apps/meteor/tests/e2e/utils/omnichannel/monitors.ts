import { BaseTest } from '../test';

export const createMonitor = async (api: BaseTest['api'], username: string) =>
	api.post('/method.call/livechat:addMonitor', {
		message: JSON.stringify({
			msg: 'method',
			id: '25',
			method: 'livechat:addMonitor',
			params: [username],
		}),
	});

export const deleteMonitor = async (api: BaseTest['api'], username: string) =>
	api.post('/method.call/livechat:removeMonitor', {
		message: JSON.stringify({
			msg: 'method',
			id: '29',
			method: 'livechat:removeMonitor',
			params: [username],
		}),
	});
