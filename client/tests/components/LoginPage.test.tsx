import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../src/pages/Login';

describe('Login Page', () => {
  test('renders inputs and submit disabled until filled', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/password/i);
    const btn = screen.getByRole('button', { name: /login/i });
    expect(email).toBeInTheDocument();
    expect(password).toBeInTheDocument();
    fireEvent.change(email, { target: { value: 'a@test.com' } });
    fireEvent.change(password, { target: { value: 'Password123!' } });
    expect(btn).toBeEnabled();
  });
});
