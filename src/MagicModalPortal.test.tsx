import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { MagicModalPortal } from './MagicModalPortal';
import { magicModal } from './utils/magicModalHandler';

describe('MagicModal', () => {
  it('renders correctly', async () => {
    const component = render(<MagicModalPortal />);

    expect(component).toMatchSnapshot();
  });

  it('renders children conditionally', () => {
    const component = render(<MagicModalPortal />);

    const testId = 'children-magic-modal';

    expect(component.queryByTestId(testId)).toBeFalsy();

    act(() => {
      magicModal.show(() => <Text testID={testId}>Taveira</Text>);
    });

    expect(component.queryByTestId(testId)).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it('should redirect hide params as show promise result', async () => {
    render(<MagicModalPortal />);

    await act(async () => {
      const modalResultPromise = magicModal.show(() => <Text>Taveira</Text>);

      magicModal.hide('some-result-2');

      const modalResult = await modalResultPromise;
      expect(modalResult).toBe('some-result-2');
    });
  });

  it('should override old modal on show', async () => {
    const component = render(<MagicModalPortal />);

    act(() => {
      magicModal.show(() => <Text testID="old-modal">Taveira</Text>);
    });

    await waitFor(() => {
      expect(component.queryByTestId('old-modal')).toBeTruthy();
      expect(component.queryByTestId('new-modal')).toBeFalsy();
    });

    act(() => {
      magicModal.show(() => <Text testID="new-modal">Taveira</Text>);
    });

    await waitFor(() => {
      expect(component.queryByTestId('new-modal')).toBeTruthy();
      expect(component.queryByTestId('old-modal')).toBeFalsy();
    });
  });
});
