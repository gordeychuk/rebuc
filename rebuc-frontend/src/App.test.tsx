import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders main menu', () => {
  const { getByText } = render(<App />);
  const releasesLink = getByText(/Releases/i);
  const buildsLink = getByText(/Builds/i);
  const restapiLink = getByText(/REST API/i);
  expect(releasesLink).toBeInTheDocument();
  expect(buildsLink).toBeInTheDocument();
  expect(restapiLink).toBeInTheDocument();
});
