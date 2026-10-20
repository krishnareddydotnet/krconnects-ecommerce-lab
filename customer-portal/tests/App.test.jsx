import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App.jsx';

describe('App', () => {
  it('renders the KRConnects Customer Portal welcome message', () => {
    render(<App />);

    expect(
      screen.getByText('Welcome to KRConnects Customer Portal')
    ).toBeInTheDocument();
  });

  it('renders the account and order management description', () => {
    render(<App />);

    expect(
      screen.getByText('Your account and order management hub.')
    ).toBeInTheDocument();
  });
});
