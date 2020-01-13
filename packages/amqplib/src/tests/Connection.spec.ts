import { AmqpConnection } from '../Connection';

const uri = `amqp://rabbitmq:rabbitmq@localhost:5672`;

describe('AmqpConnection', () => {
  it('connects', async (done) => {
    const connection = new AmqpConnection({
      uri
    });

    await connection.connect();
    setTimeout(done, 45000);
  }, 45000)
})