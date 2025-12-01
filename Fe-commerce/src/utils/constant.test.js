import { TYPE, GROUPID } from './constant';

describe('constants', () => {
  test('TYPE should have MEN and WOMEN', () => {
    expect(TYPE.MEN).toBe('MEN');
    expect(TYPE.WOMEN).toBe('WOMEN');
  });

  test('GROUPID should include ADMIN and USER', () => {
    expect(GROUPID.ADMIN).toBe(1);
    expect(GROUPID.USER).toBe(3);
  });
});
