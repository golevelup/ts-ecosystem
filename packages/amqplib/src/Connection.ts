import * as amqplib from 'amqplib';
import { Subject, BehaviorSubject } from 'rxjs';
import { tap, filter, delay } from 'rxjs/operators';
import { RabbitMQConfig, MessageHandlerErrorBehavior } from './types';

const connected = () =>
  ({
    type: 'CONNECTED'
  } as const);

const closed = () =>
  ({
    type: 'CLOSED'
  } as const);

type Events = ReturnType<typeof closed | typeof connected>;

type EventLabels = Events['type'];

const defaultConfig = {
  prefetchCount: 10,
  defaultExchangeType: 'topic',
  defaultRpcErrorBehavior: MessageHandlerErrorBehavior.REQUEUE,
  defaultSubscribeErrorBehavior: MessageHandlerErrorBehavior.REQUEUE,
  exchanges: [],
  defaultRpcTimeout: 10000,
  connectionInitOptions: {
    wait: true,
    timeout: 5000,
    reject: true
  },
  connectionManagerOptions: {}
};

export class AmqpConnection {
  private readonly lifecycle = new BehaviorSubject<{}>({});
  private readonly config: Required<RabbitMQConfig>;
  private readonly eventSubject = new Subject<Events>();
  private readonly events = this.eventSubject.asObservable();

  constructor(config: RabbitMQConfig) {
    this.config = { ...defaultConfig, ...config };
    
    const reconnectSub = this.attachReconnectBehavior().subscribe(x => {});

    const logSub = this.events
      .pipe(tap(x => console.log(JSON.stringify(x))))
      .subscribe(x => {});
  }

  async connect() {
    const tempUris = Array.isArray(this.config.uri)
      ? this.config.uri
      : [this.config.uri];

    const tempUri = tempUris[0];
    const connection = await amqplib.connect(tempUri);

    this.eventSubject.next(connected());

    console.log('CONNECTED');

    connection.on('error', e => {
      console.log(`ERROR: ${e}`);
    });

    connection.on('close', e => {
      console.log(`CLOSED: ${e}`);

      // if(require('amqplib/lib/connection').isFatalError(e)) {
      //   console.log('FATAL ERROR');
      // }

      this.eventSubject.next(closed());
    });
  }

  private attachConnectBehavior() {}

  private attachReconnectBehavior() {
    return this.events.pipe(
      filter(x => x.type === 'CLOSED'),
      tap(() => console.log('ATTEMPTING RECONNECT')),
      delay(10000),
      tap(async () => {
        try {
          await this.connect();
        } catch (e) {
          console.log('ERROR IN RECONNECT BEHAVIOR');
        }
      })
    );
  }
}
