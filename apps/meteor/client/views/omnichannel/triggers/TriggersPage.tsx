import { Button } from '@rocket.chat/fuselage';
import { useRouteParameter, useRouter, useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';

import Page from '../../../components/Page';
import EditTrigger from './EditTrigger';
import EditTriggerWithData from './EditTriggerWithData';
import TriggersTable from './TriggersTable';

const TriggersPage = () => {
	const t = useTranslation();
	const id = useRouteParameter('id');
	const context = useRouteParameter('context');
	const router = useRouter();

	return (
		<Page flexDirection='row'>
			<Page>
				<Page.Header title={t('Livechat_Triggers')}>
					<Button onClick={() => router.navigate('/omnichannel/triggers/new')}>{t('Create_trigger')}</Button>
				</Page.Header>
				<Page.Content>
					<TriggersTable />
				</Page.Content>
			</Page>
			{context === 'edit' && id && <EditTriggerWithData triggerId={id} />}
			{context === 'new' && <EditTrigger />}
		</Page>
	);
};

export default TriggersPage;
