import { signAccessToken, verifyAccessToken } from '../../src/utils/jwt.utils';

describe('jwt utils', () => {
  it('signs and verifies access token', () => {
    const token = signAccessToken('user123');
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe('user123');
  });
});
