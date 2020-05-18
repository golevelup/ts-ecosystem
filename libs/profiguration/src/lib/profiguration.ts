import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { partition } from 'lodash';
import * as convict from 'convict';
const parent = require('parent-module');

export type Schema<T> = convict.Schema<T>;

type LoadRelativeTo = 'cwd' | 'parent-module';

export interface ConfigLoadOptions {
  /**
   * Determines whether or not errors will be thrown if specified files are missing
   */
  strict?: boolean;

  /**
   * Display verbose input during configuration loading
   */
  verbose?: boolean;

  /**
   * Override the logger when verbose mode is turned on. The default implementation uses console.log
   */
  logger?: (...args: any[]) => void;

  /**
   * Where to load files from. Specify either `cwd` for the current working directory or `parent-module` to load
   * files relative to the location that imported and created the config using `createProfiguration`
   */
  loadRelativeTo?: LoadRelativeTo;

  /**
   * Configure behavior and source files on a per node environment basis. Will be invoked using the current node environment
   */
  configureEnv?: (
    nodeEnv: string
  ) => Omit<ConfigLoadOptions, 'configureEnv'> & { files?: string | string[] };
}

const defaultConfigLoadOptions: Required<ConfigLoadOptions> = {
  strict: false,
  verbose: false,
  loadRelativeTo: 'cwd',
  logger: console.log,
  configureEnv: env => ({})
};

const makeConditionalLogger = (
  enabled: boolean,
  logger: (...args: any[]) => void
) => (message: string) => {
  if (enabled) {
    logger(`@golevelup/profiguration: ${message}`);
  }
};

const resolveFilePath = (
  basePath: string,
  loadRelativeTo: LoadRelativeTo,
  parent: any
) =>
  path.isAbsolute(basePath)
    ? basePath
    : loadRelativeTo === 'cwd'
    ? path.resolve(process.cwd(), basePath)
    : path.join(path.dirname(parent), basePath);

/**
 * Creates a profiguration instance using the provided schema and config options
 * @param schema
 * @param configLoadOptions
 */
export const createProfiguration = <K>(
  schema: convict.Schema<K>,
  configLoadOptions?: ConfigLoadOptions
): convict.Config<K> => {
  const nodeEnv = process.env.NODE_ENV || 'development';

  const { configureEnv } = {
    ...defaultConfigLoadOptions,
    ...(configLoadOptions || {})
  };

  const { verbose, strict, loadRelativeTo, logger, files } = {
    ...defaultConfigLoadOptions,
    ...(configLoadOptions || {}),
    ...configureEnv(nodeEnv)
  };

  const log = makeConditionalLogger(verbose, logger);

  log(`Loading config in Node Env '${nodeEnv}'`);
  const caller = parent();

  const defaultFiles = files || [];
  const normalizedFiles = Array.isArray(defaultFiles)
    ? defaultFiles
    : [defaultFiles];

  const [willProcess, wontProcess] = partition(
    normalizedFiles,
    x => x.endsWith('.env') || x.endsWith('.json')
  );

  if (wontProcess.length) {
    log(
      `Ignoring the following files which are not .env or .json: ${wontProcess}`
    );
  }

  const [exists, missing] = partition(
    willProcess.map(x => {
      const filePath = resolveFilePath(x, loadRelativeTo, caller);
      const exists = fs.existsSync(filePath);
      return {
        filePath,
        exists
      };
    }),
    x => x.exists
  );

  if (missing.length) {
    const message = `Missing specified file(s): ${missing.map(
      x => x.filePath
    )}`;
    if (strict) {
      throw new Error(message);
    }
    log(message);
  }

  const [dotEnvPaths, jsonPaths] = partition(exists, x =>
    x.filePath.endsWith('.env')
  );

  dotEnvPaths.forEach(x => {
    log(`Loading .env file at: '${x.filePath}'`);

    const result = dotenv.config({ path: x.filePath });
    if (result.error) {
      throw result.error;
    }
  });

  const config = convict<K>(schema);

  jsonPaths.forEach(x => {
    log(`Loading .json file at: '${x.filePath}'`);

    config.loadFile(x.filePath);
  });

  const validated = config.validate({
    strict: true
  });

  return validated;
};
