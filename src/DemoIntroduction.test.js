import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DemoIntroduction from './DemoIntroduction';

test('runs the selected preset and gives a visible pending state', () => {
    const run = jest.fn();
    const view = render(<DemoIntroduction onRun={run} pending={false} />);
    fireEvent.change(screen.getByLabelText(/Tone offset/), {target:{value:'high'}});
    fireEvent.click(screen.getByRole('button', {name:'Run on real radios'}));
    expect(run).toHaveBeenCalledWith('high');
    view.rerender(<DemoIntroduction onRun={run} pending={true} />);
    expect(screen.getByRole('button', {name:/Starting measurement/})).toBeDisabled();
});

test('shows recoverable connection failure', () => {
    render(<DemoIntroduction onRun={() => {}} pending={false} error="Connection lost. Please try again." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Connection lost');
});
