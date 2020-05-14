import { Config } from 'convict';
import { mocked } from 'ts-jest/utils';
import { get } from 'lodash';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

export const createMockConfig = <T extends {}>(
  config: Config<T>,
  values: DeepPartial<T>
) => {
  const mockedConfig = mocked(config, true);
  mockedConfig.get.mockImplementation(x => {
    const mockedValue = get(values, x);
    if (!mockedValue) {
      throw new Error(`No mock value provided for config key ${x}`);
    }
    return mockedValue;
  });
};
