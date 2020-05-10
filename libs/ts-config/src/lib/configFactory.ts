import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as convict from 'convict';
const parent = require('parent-module');

export type CommonNodeEnv = 'production' | 'staging' | 'development' | 'test';

export interface EnvConfig {
  dotEnvPaths?: string | string[];
  jsonPaths?: string | string[];
}

export type NodeEnvConfigMap<T extends string> = Partial<Record<T, EnvConfig>>;

export interface ConfigLoadOptions<T extends string = CommonNodeEnv> {
  environmentConfigFiles?: NodeEnvConfigMap<T>;
  strict?: boolean;
  verbose?: boolean;
}

const defaultConfigLoadOptions: ConfigLoadOptions = {
  strict: true,
  verbose: false
};

const makeConditionalLogger = (enabled: boolean) => (message: string) => {
  if (enabled) {
    console.log(`@golevelup/ts-config: ${message}`);
  }
};

export const createConfig = <K, T extends string = CommonNodeEnv>(
  schema: convict.Schema<K>,
  configLoadOptions?: ConfigLoadOptions<T>
): convict.Config<K> => {
  const { verbose, strict, environmentConfigFiles } = {
    ...defaultConfigLoadOptions,
    ...(configLoadOptions || {})
  };
  const log = makeConditionalLogger(verbose);

  const nodeEnv = (process.env.NODE_ENV || 'development') as T;

  log(`Loading config in Node Env '${nodeEnv}'`);

  const envConfigMap = (environmentConfigFiles || {})[nodeEnv];

  const parsedDotEnvPaths = envConfigMap?.dotEnvPaths || [];
  const parsedJsonPaths = envConfigMap?.jsonPaths || [];

  const dotEnvPaths = Array.isArray(parsedDotEnvPaths)
    ? parsedDotEnvPaths
    : [parsedDotEnvPaths];

  const jsonPaths = Array.isArray(parsedJsonPaths)
    ? parsedJsonPaths
    : [parsedJsonPaths];

  const caller = parent();

  dotEnvPaths.forEach(x => {
    const dotEnvPath = path.isAbsolute(x)
      ? x
      : path.join(path.dirname(caller), x);
    const exists = fs.existsSync(dotEnvPath);
    if (!exists && strict) {
      throw new Error(`Could not find file ${dotEnvPath}`);
    }

    log(
      `Attempting to load .env file at: '${dotEnvPath}'. ${
        exists ? `Found file` : `File not found. Skipping`
      }`
    );

    if (exists) {
      const result = dotenv.config({ path: dotEnvPath });
      if (result.error) {
        throw new Error(result.error);
      }
      log(JSON.stringify(result));
    }
  });

  const config = convict<K>(schema);

  jsonPaths.forEach(x => {
    const jsonPath = path.isAbsolute(x)
      ? x
      : path.join(path.dirname(caller), x);
    log(`Attempting to load JSON config file at: '${x}'`);
    config.loadFile(jsonPath);
  });

  const validated = config.validate({
    strict: true
  });

  return validated;
};
