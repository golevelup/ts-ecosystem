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
    default: '',
    env: 'NAME'
  },
  age: {
    default: 0,
    format: 'int',
    env: 'AGE'
  },
  nested: {
    value: 'awesome'
  }
};

describe('ts-config', () => {
  it('throws errors for missing .env files in strict mode', () => {
    expect(() =>
      createConfig<TestConfig>(schema, {
        strict: true,
        environmentConfigFiles: {
          test: {
            dotEnvPaths: ['asdfasdf']
          }
        }
      })
    ).toThrow();
  });

  it('throws errors for missing json files', () => {
    expect(() =>
      createConfig<TestConfig>(schema, {
        strict: true,
        environmentConfigFiles: {
          test: {
            jsonPaths: ['asdfasdf']
          }
        }
      })
    ).toThrow();
  });

  it('loads and uses env files', () => {
    const config = createConfig<TestConfig>(schema, {
      strict: true,
      environmentConfigFiles: {
        test: {
          dotEnvPaths: ['./test.env']
        }
      }
    });

    expect(config.get('name')).toBe('WonderPanda');
    expect(config.get('age')).toBe(30);
    expect(config.get('nested').value).toBe('awesome');
    expect(config.get('nested.value')).toBe('awesome');

    const something = config.get('nested.value');
  });

  it('loads json files', () => {
    const jsonSchema: convict.Schema<TestConfig> = {
      name: {
        default: '',
        env: 'JSON_NAME'
      },
      age: {
        default: 0,
        format: 'int',
        env: 'JSON_AGE'
      },
      nested: {
        value: 'awesome'
      }
    };

    const config = createConfig<TestConfig>(jsonSchema, {
      strict: true,
      environmentConfigFiles: {
        test: {
          jsonPaths: ['./test.json']
        }
      }
    });

    expect(config.get('name')).toBe('Jesse Carter');
  });

  it('respects json -> .env -> env vars precedence', () => {
    const config = createConfig<TestConfig>(schema, {
      strict: true,
      environmentConfigFiles: {
        test: {
          dotEnvPaths: ['./test.env'],
          jsonPaths: ['./test.json']
        }
      }
    });

    expect(config.get('name')).toBe('WonderPanda');
    expect(config.get('age')).toBe(30);
    expect(config.get('nested').value).toBe('code');
  });
});
