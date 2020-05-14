import { createConfig } from '@golevelup/profiguration';

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

export const config = createConfig<Config>(
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
    environmentConfigFiles: {
      development: {
        dotEnvPaths: 'development.env'
      }
    }
  }
);
