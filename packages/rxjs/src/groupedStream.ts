import { Observable } from 'rxjs';
import { endWith, filter, map, pairwise, scan } from 'rxjs/operators';

interface KeyedGroup<T> {
  key: string;
  items: T[];
}

const defaultValue = { key: '', items: [] };

/**
 * Applies grouping logic to a stream such that consecutive items with the same key will be grouped. The stream
 * emits only completed groups
 *
 * @template T
 * @param {Observable<T>} input - The Observable stream over which the grouping should occur
 * @param {(item: T) => string} keySelector - A function that should be used to select the grouping key for the item
 * @returns {Observable<T[]>} The new Observable of grouped consecutive items
 */
export const groupedStream = <T>(
  input: Observable<T>,
  keySelector: (item: T) => string
): Observable<T[]> => {
  return input.pipe(
    scan<T, KeyedGroup<T>>((acc, curr) => {
      const key = keySelector(curr);
      return !acc.key || key !== acc.key
        ? {
            key,
            items: [curr]
          }
        : {
            ...acc,
            items: [...acc.items, curr]
          };
    }, defaultValue),
    endWith(defaultValue),
    pairwise(),
    filter(([prev, current]) => prev.key != current.key),
    map(([prev, _]) => prev.items)
  );
};
