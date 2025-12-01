const React = require('react');
module.exports = {
  Swiper: ({ children }) => React.createElement('div', { 'data-testid': 'mock-swiper' }, children),
  SwiperSlide: ({ children }) => React.createElement('div', { 'data-testid': 'mock-swiperslide' }, children),
};
