import { BaseTest } from '../test';

type CreateUnitParams = {
	name: string;
	visibility: 'public' | 'private';
	monitorId: string;
	monitorUsername: string;
	departmentId: string;
};

export const createUnit = async (api: BaseTest['api'], { name, visibility, monitorId, monitorUsername, departmentId }: CreateUnitParams) =>
	api.post('/livechat/units', {
		unitData: { name, visibility },
		unitMonitors: [{ monitorId, username: monitorUsername }],
		unitDepartments: [{ departmentId }],
	});

export const deleteUnit = async (api: BaseTest['api'], unitId: string) => api.delete(`/livechat/units/${unitId}`);
