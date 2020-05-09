import { createConfig } from '../lib/configFactory';
import * as convict from 'convict';

interface TestConfig {
  name: string;
  age: number;
  nested: {
    value: string;
  };
}

const schema: convict.Schema<TestConfig> = {
  name: {
    default: 'Jesse',
    env: 'NX_THIS_IS_NAME_ENV'
  },
  age: 30,
  nested: {
    value: 'awesome'
  }
};

describe('ts-config', () => {
  it('throws errors for missing .env files in strict mode', () => {
    expect(() =>
      createConfig<TestConfig>(schema, {
        environmentConfigFiles: {
          test: {
            dotEnvPaths: ['asdfasdf']
          }
        },
        verbose: true,
        strict: true
      })
    ).toThrow();
  });

  it.only('loads and uses env files', () => {
    const config = createConfig<TestConfig>(schema, {
      verbose: true,
      strict: true,
      environmentConfigFiles: {
        test: {
          dotEnvPaths: ['./test.env']
        }
      }
    });

    expect(config.get('name')).toBe('WonderPanda');
  });

  it.skip('loads json files', () => {
    expect(42).toBe(41);
  });

  it.skip('respects json -> .env -> env vars precedence', () => {
    expect(42).toBe(41);
  });
});
