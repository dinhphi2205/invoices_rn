import { loginSchema } from '../src/validation/loginSchema';

describe('loginSchema', () => {
  it('accepts valid credentials', async () => {
    await expect(
      loginSchema.validate({
        username: 'username',
        password: 'password',
      }),
    ).resolves.toEqual({
      username: 'username',
      password: 'password',
    });
  });

  it('rejects empty username', async () => {
    await expect(
      loginSchema.validate({
        username: '',
        password: 'password',
      }),
    ).rejects.toThrow('Username is required');
  });

  it('rejects short password', async () => {
    await expect(
      loginSchema.validate({
        username: 'username',
        password: '123',
      }),
    ).rejects.toThrow('Password must be at least 6 characters');
  });
});
