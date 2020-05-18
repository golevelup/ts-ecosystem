import { createProfiguration } from '@golevelup/profiguration';
import { Logger } from '@nestjs/common';

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
    configureEnv: env => {
      const baseEnv = 'development.env';

      return {
        logger:
          env === 'test' ? undefined : (message: string) => Logger.log(message),
        files: env === 'test' ? `../${baseEnv}` : baseEnv
      };
    }
  }
);
