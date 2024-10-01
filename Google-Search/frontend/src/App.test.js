import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Use MemoryRouter for testing routes
import App from './App';

test('renders Google Drive Search header', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  
  // Check for the main heading
  const headerElement = screen.getByText(/Google Drive Search/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders search button', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  
  // Check for the presence of the search button
  const buttonElement = screen.getByText(/Search/i);
  expect(buttonElement).toBeInTheDocument();
});
