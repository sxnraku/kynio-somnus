import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DotMatrixClock } from '@/components/ui/dot-matrix-clock';

describe('DotMatrixClock Component', () => {
  it('renders dot matrix clock with steppers and triggers adjustments', async () => {
    const onAdjustHours = jest.fn();
    const onAdjustMinutes = jest.fn();

    const { getByLabelText } = await render(
      <DotMatrixClock
        hours={7}
        minutes={30}
        onAdjustHours={onAdjustHours}
        onAdjustMinutes={onAdjustMinutes}
      />
    );

    const incHourBtn = getByLabelText('Aumentar hora');
    const incMinBtn = getByLabelText('Aumentar minutos');

    fireEvent.press(incHourBtn);
    expect(onAdjustHours).toHaveBeenCalledWith(1);

    fireEvent.press(incMinBtn);
    expect(onAdjustMinutes).toHaveBeenCalledWith(15);
  });
});
