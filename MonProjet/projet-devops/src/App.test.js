import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders Statistiques Étudiants text', () => {
  render(<App />);
  const linkElement = screen.getByText(/Statistiques Étudiants/i);
  expect(linkElement).toBeInTheDocument(); // Vérifie que l'élément est bien dans le document
});