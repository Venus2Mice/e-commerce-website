module.exports = {
  Swiper: ({ children }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'mock-swiper' }, children);
  },
  SwiperSlide: ({ children }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'mock-swiperslide' }, children);
  }
};
