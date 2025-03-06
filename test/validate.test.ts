/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { validateParams } from '@/lib';
import { Weekday, Frequency, type Params } from '@/types';

describe('validateParams', () => {
  const params: Params = {
    wkst: Weekday.MO,
    byYearDay: [1, 2, 3],
    byMonth: [1],
    bySetPos: [1],
    byMonthDay: [1],
    byDay: [Weekday.MO],
    byHour: [1],
    byMinute: [1],
    bySecond: [1],
    dtStart: new Date('September 3, 1998 03:24:00'),
    freq: Frequency.YEARLY,
    interval: 1,
    until: new Date('February 25, 2022 03:24:00'),
    count: 3,
    tzid: 'UTC',
  };

  it('does not throw anything for valid params', () => {
    expect(() => validateParams(params)).not.toThrow();
  });

  describe('dtStart', () => {
    it('throws an error when dtStart is missing', () => {
      expect(() =>
        // @ts-expect-error Expect invalid type
        validateParams({ ...params, dtStart: null })
      ).toThrowErrorMatchingInlineSnapshot(`"dtStart is required"`);
    });

    it('throws an error when dtStart is not a valid date', () => {
      expect(() =>
        validateParams({ ...params, dtStart: new Date('invalid') })
      ).toThrowErrorMatchingInlineSnapshot(`"dtStart is an invalid date"`);
    });
  });

  describe('tzid', () => {
    it('throws an error when tzid is missing', () => {
      expect(() =>
        // @ts-expect-error Expect invalid type
        validateParams({ ...params, tzid: null })
      ).toThrowErrorMatchingInlineSnapshot(`"tzid is required"`);
    });

    it('throws an error when tzid is invalid', () => {
      expect(() =>
        validateParams({ ...params, tzid: 'invalid' })
      ).toThrowErrorMatchingInlineSnapshot(`"tzid is an invalid timezone"`);
    });
  });

  describe('interval', () => {
    it('throws an error when count is not a number', () => {
      expect(() =>
        // @ts-expect-error Expect invalid type
        validateParams({ ...params, interval: 'invalid' })
      ).toThrowErrorMatchingInlineSnapshot(`"interval must be an integer greater than 0"`);
    });

    it('throws an error when interval is not an integer', () => {
      expect(() => validateParams({ ...params, interval: 1.5 })).toThrowErrorMatchingInlineSnapshot(
        `"interval must be an integer greater than 0"`
      );
    });

    it('throws an error when interval is <= 0', () => {
      expect(() => validateParams({ ...params, interval: 0 })).toThrowErrorMatchingInlineSnapshot(
        `"interval must be an integer greater than 0"`
      );
    });
  });

  describe('until', () => {
    it('throws an error when until field is an invalid date', () => {
      expect(() =>
        validateParams({
          ...params,
          until: new Date('invalid'),
        })
      ).toThrowErrorMatchingInlineSnapshot(`"until is an invalid date"`);
    });
  });

  describe('count', () => {
    it('throws an error when count is not a number', () => {
      expect(() =>
        // @ts-expect-error Expect invalid type
        validateParams({ ...params, count: 'invalid' })
      ).toThrowErrorMatchingInlineSnapshot(`"count must be an integer greater than 0"`);
    });

    it('throws an error when count is not an integer', () => {
      expect(() => validateParams({ ...params, count: 1.5 })).toThrowErrorMatchingInlineSnapshot(
        `"count must be an integer greater than 0"`
      );
    });

    it('throws an error when count is <= 0', () => {
      expect(() => validateParams({ ...params, count: 0 })).toThrowErrorMatchingInlineSnapshot(
        `"count must be an integer greater than 0"`
      );
    });
  });

  describe('byMonth', () => {
    it('throws an error with out of range values', () => {
      expect(() =>
        validateParams({ ...params, byMonth: [0, 6, 13] })
      ).toThrowErrorMatchingInlineSnapshot(
        `"byMonth must be an array of numbers between 1 and 12"`
      );
    });

    it('throws an error with string values', () => {
      expect(() =>
        // @ts-expect-error Expect invalid type
        validateParams({ ...params, byMonth: ['invalid'] })
      ).toThrowErrorMatchingInlineSnapshot(
        `"byMonth must be an array of numbers between 1 and 12"`
      );
    });

    it('throws an error when is empty', () => {
      expect(() => validateParams({ ...params, byMonth: [] })).toThrowErrorMatchingInlineSnapshot(
        `"byMonth must be an array of numbers between 1 and 12"`
      );
    });
  });

  describe('byMonthDay', () => {
    it('throws an error with out of range values', () => {
      expect(() =>
        validateParams({ ...params, byMonthDay: [0, 15, 32] })
      ).toThrowErrorMatchingInlineSnapshot(
        `"byMonthDay must be an array of nonzero numbers between 1 and 31 or -1 and -31"`
      );
    });

    it('throws an error with string values', () => {
      expect(() =>
        // @ts-expect-error Expect invalid type
        validateParams({ ...params, byMonthDay: ['invalid'] })
      ).toThrowErrorMatchingInlineSnapshot(
        `"byMonthDay must be an array of nonzero numbers between 1 and 31 or -1 and -31"`
      );
    });

    it('throws an error when is empty', () => {
      expect(() =>
        validateParams({ ...params, byMonthDay: [] })
      ).toThrowErrorMatchingInlineSnapshot(
        `"byMonthDay must be an array of nonzero numbers between 1 and 31 or -1 and -31"`
      );
    });
  });

  describe('byDay', () => {
    it('throws an error with out of range values when it contains only numbers', () => {
      expect(() =>
        // @ts-expect-error Expect invalid input
        validateParams({ ...params, byDay: [0, 4, 8] })
      ).toThrowErrorMatchingInlineSnapshot(`"byDay numbers must been between 1 and 7"`);
    });

    it('throws an error with invalid values when it contains only arrays', () => {
      expect(() =>
        validateParams({
          ...params,
          byDay: [
            [-1, 1],
            // @ts-expect-error Expect invalid input
            [1, 8],
            [0, 3],
            [8, 6],
          ],
        })
      ).toThrowErrorMatchingInlineSnapshot(
        `"byDay arrays must be [nonzero integer, integer between 1 and 7]"`
      );
    });

    it('throws an error when is empty', () => {
      expect(() => validateParams({ ...params, byDay: [] })).toThrowErrorMatchingInlineSnapshot(
        `"byDay must be an array of at least one integer between 1 and 7, or a nested array of [nonzero integer, integer 1 to 7]"`
      );
    });

    it('does not throw with properly formed byDay arrays', () => {
      expect(() =>
        validateParams({
          ...params,
          byDay: [
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
            [-4, 5],
            [-3, 6],
            [-2, 7],
            [-1, 1],
          ],
        })
      ).not.toThrow(`"byDay numbers must been between 1 and 7"`);
    });

    it('does not throw with non occurrence values', () => {
      expect(() => validateParams({ ...params, byDay: [1, 2, 3, 4, 5, 6, 7] })).not.toThrow(
        `"byDay numbers must been between 1 and 7"`
      );
    });
  });
});
