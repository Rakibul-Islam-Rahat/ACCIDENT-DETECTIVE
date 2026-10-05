import { getDirectionFromAngle } from '../src/utils/direction';

describe('getDirectionFromAngle', () => {
  it('returns LEFT below 80', () => {
    expect(getDirectionFromAngle(45)).toBe('LEFT');
    expect(getDirectionFromAngle(79)).toBe('LEFT');
  });

  it('returns RIGHT above 100', () => {
    expect(getDirectionFromAngle(101)).toBe('RIGHT');
    expect(getDirectionFromAngle(150)).toBe('RIGHT');
  });

  it('returns CENTER between 80 and 100 inclusive', () => {
    expect(getDirectionFromAngle(80)).toBe('CENTER');
    expect(getDirectionFromAngle(90)).toBe('CENTER');
    expect(getDirectionFromAngle(100)).toBe('CENTER');
  });

  it('returns CENTER for null/NaN', () => {
    expect(getDirectionFromAngle(null)).toBe('CENTER');
    expect(getDirectionFromAngle(NaN)).toBe('CENTER');
  });
});
