import { createProfiguration } from '../lib/profiguration';
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

describe('profiguration', () => {
  it('throws errors for missing .env files in strict mode', () => {
    expect(() =>
      createProfiguration<TestConfig>(schema, {
        strict: true,
        loadRelativeTo: 'parent-module',
        configureEnv: (env: string) => ({
          files: 'asdfasdf.env'
        })
      })
    ).toThrow();
  });

  it('allows missing .env files when not in strict mode', () => {
    expect(() =>
      createProfiguration<TestConfig>(schema, {
        loadRelativeTo: 'parent-module',
        configureEnv: (env: string) => ({
          files: 'asdfasdf.env'
        })
      })
    ).not.toThrow();
  });

  it('throws errors for missing .json files in strict mode', () => {
    expect(() =>
      createProfiguration<TestConfig>(schema, {
        strict: true,
        loadRelativeTo: 'parent-module',
        configureEnv: (env: string) => ({
          files: 'asdfasdf.json'
        })
      })
    ).toThrow();
  });

  it('allows missing .json files in strict mode', () => {
    expect(() =>
      createProfiguration<TestConfig>(schema, {
        loadRelativeTo: 'parent-module',
        configureEnv: (env: string) => ({
          files: 'asdfasdf.json'
        })
      })
    ).not.toThrow();
  });

  it('loads and uses env files', () => {
    const config = createProfiguration<TestConfig>(schema, {
      strict: true,
      loadRelativeTo: 'parent-module',
      configureEnv: (env: string) => ({
        files: ['test.env']
      })
    });

    expect(config.get('name')).toBe('WonderPanda');
    expect(config.get('age')).toBe(30);
    expect(config.get('nested').value).toBe('awesome');
    expect(config.get('nested.value')).toBe('awesome');
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

    const config = createProfiguration<TestConfig>(jsonSchema, {
      loadRelativeTo: 'parent-module',
      configureEnv: (env: string) => ({
        files: ['test.json']
      })
    });

    expect(config.get('name')).toBe('Jesse Carter');
  });

  it('respects json -> .env -> env vars precedence', () => {
    const config = createProfiguration<TestConfig>(schema, {
      loadRelativeTo: 'parent-module',
      configureEnv: (env: string) => ({
        files: ['test.env', 'test.json']
      })
    });

    expect(config.get('name')).toBe('WonderPanda');
    expect(config.get('age')).toBe(30);
    expect(config.get('nested').value).toBe('code');
  });

  it('overrides env specific setup for loadRelativeTo', () => {
    const config = createProfiguration<TestConfig>(schema, {
      verbose: true,
      loadRelativeTo: 'cwd',
      configureEnv: (env: string) => ({
        loadRelativeTo: env === 'test' ? 'parent-module' : undefined,
        files: ['test.env', 'test.json', 'wrong.env']
      })
    });

    expect(config.get('name')).toBe('WonderPanda');
    expect(config.get('age')).toBe(30);
    expect(config.get('nested').value).toBe('code');
  });
});
