# @golevelup/profiguration

## About

Profiguration is currently built on top of the rock solid [Convict configuration library from Mozilla](https://github.com/mozilla/node-convict). It helps you acheive [12Factor compliant](https://12factor.net/config) application configuration by putting a focus on leveraging environment variables in a type safe way while enabling you to load configuration from .env and .json files for convenience during development.

## Features

- Load configuration from .env files or json files automatically with hierarchical overriding
- Easily control which configuration files get loaded based on your Node Environment
- Built in support for validation of different types
- Intellisense and Type Safety
- Simple testing utilties for when you want to mock your configuration

## Usage

### Install

`npm install ---save @golevelup/profiguration`

or

`yarn add @golevelup/profiguration`

### Define an interface to represent your Profiguration

The interface should represent the object stucture for you you would like to access the configuration for your app. It can be a complex object with nested values and different types

For example:

```typescript
interface Config {
  db: {
    password: string;
    host: {
      url: string;
      port: number;
    };
  };
  appPort: number;
  globalPrefix: string;
  controllerPrefix: string;
  showWelcomeMessage: boolean;
}
```

### Create a Profiguration instance

The `createProfiguration` factory method takes a schema that indicates how the various properties of your configuration interface should be loaded from the process environment. See the [convict documentation](https://github.com/mozilla/node-convict/tree/master/packages/convict) for additional options and documentation.

The second argument configures profiguration with options for logging, validation and relative file loading paths as well as a user provided function `configureEnv` which allows for per environment overriding of the profiguration options as well as files that should be loaded which contain configuration values.

```typescript
import { createProfiguration } from '@golevelup/profiguration';

export const config = createProfiguration<Config>(
  {
    appPort: {
      default: 3333,
      env: 'APP_PORT'
    },
    db: {
      password: {
        default: null,
        format: String,
        env: 'DB_PASSWORD'
      },
      host: {
        url: {
          default: '',
          env: 'DB_HOST_URL'
        },
        port: {
          default: -1,
          format: 'port',
          env: 'DB_HOST_PORT'
        }
      }
    },
    globalPrefix: {
      default: 'api',
      env: 'GLOBAL_PREFIX'
    },
    controllerPrefix: {
      default: '',
      env: 'CONTROLLER_PREFIX'
    },
    showWelcomeMessage: {
      default: true,
      env: 'WELCOME_MESSAGE'
    }
  },
  {
    strict: true,
    verbose: true,
    loadRelativeTo: 'parent-module',
    configureEnv: env => ({
      files: `${env}.env`
    })
  }
);
```
