import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock react-redux Provider and hooks to avoid importing actual store which relies on ESM packages
jest.mock('react-redux', () => ({
  Provider: ({ children }) => children,
  useSelector: jest.fn().mockReturnValue({}),
  useDispatch: () => jest.fn()
}));
// Mock the RouteIndex component to avoid importing many heavy modules during test
jest.mock('./route/RouteIndex.js', () => () => <div data-testid="mock-routeindex">RouteIndex</div>);

test('renders App without crashing and contains App wrapper', () => {
  render(<App />);
  const appElement = document.querySelector('.App');
  expect(appElement).toBeInTheDocument();
});
