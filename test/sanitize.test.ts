/*
 * Copyright Elasticsearch B.V. Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import { sanitizeParams } from '@/lib';
import { Weekday, Frequency, type Params } from '@/types';

describe('sanitizeParams', () => {
  const params: Params = {
    wkst: Weekday.MO,
    byYearDay: [1, 2, 3],
    byMonth: [1],
    bySetPos: [1],
    byMonthDay: [1],
    byDay: [Weekday.MO, [-2, Weekday.TU]],
    byHour: [1],
    byMinute: [1],
    bySecond: [1],
    dtStart: new Date('September 3, 1998 03:24:00'),
    freq: Frequency.YEARLY,
    interval: 1,
    until: new Date('February 25, 2022 03:24:00'),
    count: 3,
    tzid: 'America/New_York',
  };

  it('returns the same params it receives if they are all valid', () => {
    expect(sanitizeParams(params)).toEqual(params);
  });

  it('throws an error when dtStart is missing', () => {
    // @ts-expect-error Expect invalid type
    expect(() => sanitizeParams({ ...params, dtStart: null })).toThrow(
      'Cannot create RRule: dtStart is required'
    );
  });

  it('throws an error when tzid is missing', () => {
    // @ts-expect-error Expect invalid type
    expect(() => sanitizeParams({ ...params, tzid: null })).toThrow(
      'Cannot create RRule: tzid is required'
    );
  });

  it('throws an error when tzid is invalid', () => {
    expect(() => sanitizeParams({ ...params, tzid: 'invalid' })).toThrow(
      'Cannot create RRule: tzid is invalid'
    );
  });

  it('throws an error when until field is invalid', () => {
    expect(() =>
      sanitizeParams({
        ...params,
        // @ts-expect-error Expect invalid type
        until: {
          getTime: () => NaN,
        },
      })
    ).toThrow('Cannot create RRule: until is an invalid date');
  });

  it('throws an error when interval is less than 0', () => {
    expect(() => sanitizeParams({ ...params, interval: -3 })).toThrow(
      'Cannot create RRule: interval must be greater than 0'
    );
  });

  it('throws an error when interval is not a number', () => {
    // @ts-expect-error Expect invalid type
    expect(() => sanitizeParams({ ...params, interval: 'foobar' })).toThrow(
      'Cannot create RRule: interval must be a number'
    );
  });

  it('filters out invalid byMonth values', () => {
    expect(sanitizeParams({ ...params, byMonth: [0, 6, 13] })).toEqual({
      ...params,
      byMonth: [6],
    });
  });

  it('removes byMonth when it is empty', () => {
    expect(sanitizeParams({ ...params, byMonth: [0] })).toEqual({
      ...params,
      byMonth: undefined,
    });
  });

  it('filters out invalid byMonthDay values', () => {
    expect(sanitizeParams({ ...params, byMonthDay: [0, 15, 32] })).toEqual({
      ...params,
      byMonthDay: [15],
    });
  });

  it('removes byMonthDay when it is empty', () => {
    expect(sanitizeParams({ ...params, byMonthDay: [0] })).toEqual({
      ...params,
      byMonthDay: undefined,
    });
  });

  it('filters out invalid byDay values', () => {
    // @ts-expect-error Expect invalid type
    expect(sanitizeParams({ ...params, byDay: [0, 4, 8, [-1, 1], [1, 8]] })).toEqual({
      ...params,
      byDay: [4, [-1, 1]],
    });
  });

  it('removes byDay when it is empty', () => {
    // @ts-expect-error Expect invalid type
    expect(sanitizeParams({ ...params, byDay: [0] })).toEqual({
      ...params,
      byDay: undefined,
    });
  });

  it('filters out invalid byYearDay values', () => {
    expect(sanitizeParams({ ...params, byYearDay: [0, 150, 367] })).toEqual({
      ...params,
      byYearDay: [150],
    });
  });

  it('removes byYearDay when it is empty', () => {
    expect(sanitizeParams({ ...params, byYearDay: [0] })).toEqual({
      ...params,
      byYearDay: undefined,
    });
  });
});
