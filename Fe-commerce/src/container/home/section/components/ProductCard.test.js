import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductCard from './ProductCard';

// Mock useNavigate from react-router to avoid actual navigation
jest.mock('react-router', () => ({
	useNavigate: () => jest.fn(),
}));

describe('ProductCard', () => {
	test('renders product name and calculates discounted price', () => {
		const props = {
			id: 1,
			name: 'Cool T-Shirt',
			mainImage: 'img',
			imageArr: [],
			colorArr: ['#ff0000'],
			price: 100,
			discount: 10,
			isInList: false
		};

		render(<ProductCard {...props} />);

		const nameEl = screen.getByText(/Cool T-Shirt/i);
		expect(nameEl).toBeInTheDocument();

		const priceText = screen.getByText(/90.000\$/i); // 100 - 10% = 90, toFixed(3) -> 90.000$
		expect(priceText).toBeInTheDocument();
	});
});
