import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { CycleSelector } from '@/components/ui/cycle-selector';

describe('CycleSelector Component', () => {
  it('should render 4, 5 and 6 cycle options and trigger onSelectCycles', async () => {
    const onSelect = jest.fn();
    await render(<CycleSelector selectedCycles={5} onSelectCycles={onSelect} />);

    expect(screen.getByText('5 Ciclos')).toBeTruthy();
    expect(screen.getByText('7h30')).toBeTruthy();
    expect(screen.getByText('4 Ciclos')).toBeTruthy();
    expect(screen.getByText('6 Ciclos')).toBeTruthy();

    fireEvent.press(screen.getByText('6 Ciclos'));
    expect(onSelect).toHaveBeenCalledWith(6);
  });
});
