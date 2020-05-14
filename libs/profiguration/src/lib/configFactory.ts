import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as convict from 'convict';
const parent = require('parent-module');

export type Schema<T> = convict.Schema<T>;

export type CommonNodeEnv = 'production' | 'staging' | 'development' | 'test';

export interface EnvConfig {
  dotEnvPaths?: string | string[];
  jsonPaths?: string | string[];
}

export type NodeEnvConfigMap<T extends string> = Partial<Record<T, EnvConfig>>;

type LoadFrom = 'cwd' | 'parent-module';

export interface ConfigLoadOptions<T extends string = CommonNodeEnv> {
  environmentConfigFiles?: NodeEnvConfigMap<T>;
  strict?: boolean;
  verbose?: boolean;
  loadFrom?: LoadFrom;
}

const defaultConfigLoadOptions: ConfigLoadOptions = {
  strict: true,
  verbose: false,
  loadFrom: 'cwd'
};

const makeConditionalLogger = (enabled: boolean) => (message: string) => {
  if (enabled) {
    console.log(`@golevelup/profiguration: ${message}`);
  }
};

const resolveFilePath = (basePath: string, loadFrom: LoadFrom, parent: any) =>
  path.isAbsolute(basePath)
    ? basePath
    : loadFrom === 'cwd'
    ? path.resolve(process.cwd(), basePath)
    : path.join(path.dirname(parent), basePath);

export const createConfig = <K, T extends string = CommonNodeEnv>(
  schema: convict.Schema<K>,
  configLoadOptions?: ConfigLoadOptions<T>
): convict.Config<K> => {
  const { verbose, strict, loadFrom, environmentConfigFiles } = {
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
    const dotEnvPath = resolveFilePath(x, loadFrom, caller);
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
    const jsonPath = resolveFilePath(x, loadFrom, caller);
    log(`Attempting to load JSON config file at: '${x}'`);
    config.loadFile(jsonPath);
  });

  const validated = config.validate({
    strict: true
  });

  return validated;
};
