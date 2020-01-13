import * as amqplib from 'amqplib';
// import * as amqpConnectionManager from 'amqp-connection-manager';

export interface RabbitMQExchangeConfig {
  name: string;
  type?: string;
  options?: amqplib.Options.AssertExchange;
}

export interface MessageOptions {
  exchange: string;
  routingKey: string;
}

export interface RequestOptions {
  exchange: string;
  routingKey: string;
  timeout?: number;
  payload?: any;
}

export interface QueueOptions {
  durable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  arguments?: any;
  messageTtl?: number;
  expires?: number;
  deadLetterExchange?: string;
  deadLetterRoutingKey?: string;
  maxLength?: number;
  maxPriority?: number;
}

export enum MessageHandlerErrorBehavior {
  ACK,
  NACK,
  REQUEUE
}

export interface MessageHandlerOptions {
  exchange: string;
  routingKey: string | string[];
  queue?: string;
  queueOptions?: QueueOptions;
  errorBehavior?: MessageHandlerErrorBehavior;
}

export interface ConnectionInitOptions {
  wait?: boolean;
  timeout?: number;
  reject?: boolean;
}

export interface RabbitMQConfig {
  uri: string | string[];
  prefetchCount?: number;
  exchanges?: RabbitMQExchangeConfig[];
  defaultRpcTimeout?: number;
  defaultExchangeType?: string;
  defaultRpcErrorBehavior?: MessageHandlerErrorBehavior;
  defaultSubscribeErrorBehavior?: MessageHandlerErrorBehavior;
  // connectionInitOptions?: ConnectionInitOptions;
  // connectionManagerOptions?: amqpConnectionManager.AmqpConnectionManagerOptions;
}

export type RabbitHandlerType = 'rpc' | 'subscribe';

export interface RabbitHandlerConfig extends MessageHandlerOptions {
  type: RabbitHandlerType;
}

export interface CorrelationMessage {
  correlationId: string;
  message: {};
}