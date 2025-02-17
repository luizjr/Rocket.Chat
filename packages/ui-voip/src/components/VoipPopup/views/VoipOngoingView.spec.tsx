import { mockAppRoot } from '@rocket.chat/mock-providers';
import { render, screen, within } from '@testing-library/react';

import { createMockFreeSwitchExtensionDetails, createMockVoipOngoingSession } from '../../../tests/mocks';
import VoipOngoingView from './VoipOngoingView';

const wrapper = mockAppRoot().withEndpoint('GET', '/v1/voip-freeswitch.extension.getDetails', () => createMockFreeSwitchExtensionDetails());

const ongoingSession = createMockVoipOngoingSession();

it('should properly render ongoing view', async () => {
	render(<VoipOngoingView session={ongoingSession} />, { wrapper: wrapper.build(), legacyRoot: true });

	expect(screen.getByText('00:00')).toBeInTheDocument();
	expect(screen.getByRole('button', { name: /Device_settings/ })).toBeInTheDocument();
	expect(await screen.findByText('Administrator')).toBeInTheDocument();
	expect(screen.queryByText('On_Hold')).not.toBeInTheDocument();
	expect(screen.queryByText('Muted')).not.toBeInTheDocument();
});

it('should display on hold and muted', () => {
	ongoingSession.isMuted = true;
	ongoingSession.isHeld = true;

	render(<VoipOngoingView session={ongoingSession} />, { wrapper: wrapper.build(), legacyRoot: true });

	expect(screen.getByText('On_Hold')).toBeInTheDocument();
	expect(screen.getByText('Muted')).toBeInTheDocument();

	ongoingSession.isMuted = false;
	ongoingSession.isHeld = false;
});

it('should only enable ongoing call actions', () => {
	render(<VoipOngoingView session={ongoingSession} />, { wrapper: wrapper.build(), legacyRoot: true });

	expect(within(screen.getByTestId('vc-popup-footer')).queryAllByRole('button')).toHaveLength(5);
	expect(screen.getByRole('button', { name: 'Turn_off_microphone' })).toBeEnabled();
	expect(screen.getByRole('button', { name: 'Hold' })).toBeEnabled();
	expect(screen.getByRole('button', { name: 'Open_Dialpad' })).toBeEnabled();
	expect(screen.getByRole('button', { name: 'Transfer_call' })).toBeEnabled();
	expect(screen.getByRole('button', { name: 'End_call' })).toBeEnabled();
});

it('should properly interact with the voice call session', () => {
	render(<VoipOngoingView session={ongoingSession} />, { wrapper: wrapper.build(), legacyRoot: true });

	screen.getByRole('button', { name: 'Turn_off_microphone' }).click();
	expect(ongoingSession.mute).toHaveBeenCalled();

	screen.getByRole('button', { name: 'Hold' }).click();
	expect(ongoingSession.hold).toHaveBeenCalled();

	screen.getByRole('button', { name: 'Open_Dialpad' }).click();
	screen.getByTestId('dial-pad-button-1').click();
	expect(screen.getByRole('textbox', { name: 'Phone_number' })).toHaveValue('1');
	expect(ongoingSession.dtmf).toHaveBeenCalledWith('1');

	expect(screen.getByRole('button', { name: 'End_call' })).toBeEnabled();
	screen.getByRole('button', { name: 'End_call' }).click();
	expect(ongoingSession.end).toHaveBeenCalled();
});
