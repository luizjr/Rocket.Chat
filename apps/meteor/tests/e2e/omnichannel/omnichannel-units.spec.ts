import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';
import { ILivechatDepartment, ILivechatMonitor, IUser } from '@rocket.chat/core-typings';

import { IS_EE } from '../config/constants';
import { Users } from '../fixtures/userStates';
import { OmnichannelUnits } from '../page-objects';
import { createDepartment, deleteDepartment } from '../utils/omnichannel/departments';
import { createMonitor, deleteMonitor } from '../utils/omnichannel/monitors';
import { createUnit, deleteUnit } from '../utils/omnichannel/units';
import { test, expect } from '../utils/test';

test.use({ storageState: Users.admin.state });

test.describe('OC - Manage Units', () => {
	// test.skip(!IS_EE, 'Enterprise Edition Only');

	let poOmnichannelUnits: OmnichannelUnits;

	let department: ILivechatDepartment;

	test.beforeAll(async ({ api }) => {
		const res = await createDepartment(api);
		await expect(res.status()).toBe(200);
		department = (await res.json()).department as ILivechatDepartment;
	});

	test.beforeAll(async ({ api }) => {
		const res = await api.post('/livechat/users/agent', { username: 'user2' });
		await expect(res.status()).toBe(200);
	});

	test.beforeAll(async ({ api }) => {
		const res = await createMonitor(api, 'user2');
		await expect(res.status()).toBe(200);
	});

	test.afterAll(async ({ api }) => {
		await deleteDepartment(api, { id: department._id });
		await deleteMonitor(api, 'user2');
		await api.delete('/livechat/users/agent/user2');
	});

	test.beforeEach(async ({ page }: { page: Page }) => {
		poOmnichannelUnits = new OmnichannelUnits(page);

		await page.goto('/omnichannel');
		await poOmnichannelUnits.sidenav.linkUnits.click();
	});

	test.skip('OC - Manage Units - Create Unit', async () => {
		const unitName = faker.string.uuid();

		await test.step('expect correct form default state', async () => {
			await poOmnichannelUnits.btnCreateUnit.click();
			await expect(poOmnichannelUnits.contextualBar).toBeVisible();
			await expect(poOmnichannelUnits.btnSave).toBeDisabled();
			await expect(poOmnichannelUnits.btnCancel).toBeEnabled();
			await poOmnichannelUnits.btnCancel.click();
			await expect(poOmnichannelUnits.contextualBar).not.toBeVisible();
		});

		await test.step('expect to create new unit', async () => {
			await poOmnichannelUnits.btnCreateUnit.click();
			await poOmnichannelUnits.inputName.fill(unitName);
			await poOmnichannelUnits.selectVisibility('public');
			await poOmnichannelUnits.selectDepartment(department);
			await poOmnichannelUnits.selectMonitor('user2');
			await poOmnichannelUnits.btnSave.click();

			await test.step('expect unit to have been created', async () => {
				await poOmnichannelUnits.search(unitName);
				await expect(poOmnichannelUnits.findRowByName(unitName)).toBeVisible();
			});
		});

		await test.step('expect to delete unit', async () => {
			await test.step('expect confirm delete unit', async () => {
				await test.step('expect to be able to cancel delete', async () => {
					await poOmnichannelUnits.btnDeleteByName(unitName).click();
					await expect(poOmnichannelUnits.confirmDeleteModal).toBeVisible();
					await poOmnichannelUnits.btnCancelDeleteModal.click();
					await expect(poOmnichannelUnits.confirmDeleteModal).not.toBeVisible();
				});

				await test.step('expect to confirm delete', async () => {
					await poOmnichannelUnits.btnDeleteByName(unitName).click();
					await expect(poOmnichannelUnits.confirmDeleteModal).toBeVisible();
					await poOmnichannelUnits.btnConfirmDeleteModal.click();
					await expect(poOmnichannelUnits.confirmDeleteModal).not.toBeVisible();
				});
			});

			await test.step('expect to have been deleted', async () => {
				await poOmnichannelUnits.search(unitName);
				await expect(poOmnichannelUnits.findRowByName(unitName)).not.toBeVisible();
			});
		});
	});

	test('OC - Manage Units - Edit unit', async ({ api }) => {
		const edittedUnitName = faker.string.uuid();

		const unit = await test.step('expect to create new unit', async () => {
			const res = await createUnit(api, {
				name: faker.string.uuid(),
				visibility: 'public',
				monitorId: 'user2',
				monitorUsername: 'user2',
				departmentId: department._id,
			});

			await expect(res.status()).toBe(200);
			const unit = await res.json();

			return unit;
		});

		await test.step('expect to edit unit', async () => {
			await poOmnichannelUnits.search(unit.name);
			await poOmnichannelUnits.findRowByName(unit.name).click();
			await expect(poOmnichannelUnits.contextualBar).toBeVisible();
			await poOmnichannelUnits.inputName.fill(edittedUnitName);
			await poOmnichannelUnits.btnSave.click();
		});

		await test.step('expect unit to have been edited', async () => {
			await poOmnichannelUnits.sidenav.linkPriorities.click();
			await poOmnichannelUnits.sidenav.linkUnits.click(); // refresh the page
			await poOmnichannelUnits.search(edittedUnitName);
			await expect(poOmnichannelUnits.findRowByName(edittedUnitName)).toBeVisible();
		});

		await test.step('expect to delete unit', async () => {
			await poOmnichannelUnits.findRowByName(edittedUnitName).click();
			await expect(poOmnichannelUnits.contextualBar).toBeVisible();

			await test.step('expect confirm delete unit', async () => {
				await test.step('expect to be able to cancel delete', async () => {
					await poOmnichannelUnits.btnDelete.click();
					await expect(poOmnichannelUnits.confirmDeleteModal).toBeVisible();
					await poOmnichannelUnits.btnCancelDeleteModal.click();
					await expect(poOmnichannelUnits.confirmDeleteModal).not.toBeVisible();
				});

				await test.step('expect to confirm delete', async () => {
					await poOmnichannelUnits.btnDelete.click();
					await expect(poOmnichannelUnits.confirmDeleteModal).toBeVisible();
					await poOmnichannelUnits.btnConfirmDeleteModal.click();
					await expect(poOmnichannelUnits.confirmDeleteModal).not.toBeVisible();
				});

				await expect(poOmnichannelUnits.contextualBar).not.toBeVisible();
			});

			await test.step('expect to have been deleted', async () => {
				await poOmnichannelUnits.sidenav.linkPriorities.click();
				await poOmnichannelUnits.sidenav.linkUnits.click(); // refresh the page
				await poOmnichannelUnits.search(edittedUnitName);
				await expect(poOmnichannelUnits.findRowByName(edittedUnitName)).not.toBeVisible();
			});
		});
	});
});
