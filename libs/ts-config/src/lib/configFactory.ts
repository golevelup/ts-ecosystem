import * as path from 'path';
import * as dotenv from 'dotenv';
import * as convict from 'convict';

export type CommonNodeEnv = 'production' | 'development' | 'test';

export interface EnvConfig {
  dotEnvPaths: string | string[];
  jsonPaths: string | string[];
}

export type NodeEnvConfigMap<T extends string> = Partial<Record<T, EnvConfig>>;

export const makeConfig = <K, T extends string = CommonNodeEnv>(
  configMap: NodeEnvConfigMap<T>,
  schema: convict.Schema<K>
): convict.Config<K> => {
  const nodeEnv = (process.env.NODE_ENV || 'development') as T;

  const envConfigMap = configMap[nodeEnv];
  const parsedDotEnvPaths = envConfigMap?.dotEnvPaths || [];
  const parsedJsonPaths = envConfigMap?.jsonPaths || [];

  const dotEnvPaths = Array.isArray(parsedDotEnvPaths)
    ? parsedDotEnvPaths
    : [parsedDotEnvPaths];

  const jsonPaths = Array.isArray(parsedJsonPaths)
    ? parsedJsonPaths
    : [parsedJsonPaths];

  dotEnvPaths.forEach(x => {
    const dotEnvPath = path.isAbsolute(x) ? x : path.join(__dirname, x);
    dotenv.config({ path: dotEnvPath });
  });

  const config = convict<K>(schema);

  jsonPaths.forEach(x => {
    const jsonPath = path.isAbsolute(x) ? x : path.join(__dirname, x);
    config.loadFile(jsonPath);
  });

  const validated = config.validate({
    strict: true
  });

  return validated;
};
