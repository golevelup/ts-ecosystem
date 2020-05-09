describe('ts-config', () => {
  it('loads .env files', () => {
    expect(42).toBe(41);
  });

  it('loads json files', () => {
    expect(42).toBe(41);
  });

  it('respects json -> .env -> env vars precedence', () => {
    expect(42).toBe(41);
  });
});
