import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AuthApiStatus from '../src/components/AuthApiStatus.jsx';

describe('AuthApiStatus', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('displays the loading state initially', () => {
    global.fetch.mockReturnValue(new Promise(() => {})); // never resolves

    render(<AuthApiStatus />);

    expect(screen.getByText('Loading Auth API status...')).toBeInTheDocument();
  });

  it('displays the Auth API message and timestamp after a successful call', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'This is the KRConnects Auth API — responsible for authentication and identity management.',
        service: 'krconnects-auth-api',
        timestamp: '2026-08-18T10:32:45.000Z'
      })
    });

    render(<AuthApiStatus />);

    await waitFor(() => {
      expect(screen.getByText(/krconnects-auth-api/)).toBeInTheDocument();
    });

    expect(screen.getByText(/2026-08-18T10:32:45.000Z/)).toBeInTheDocument();
  });

  it('displays an error message when the Auth API call fails', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 503
    });

    render(<AuthApiStatus />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
