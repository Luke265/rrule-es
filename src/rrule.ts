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

import { TZDateMini, type TZDate } from '@date-fns/tz';
import { add, isBefore, isEqual } from 'date-fns';
import { getNextOccurrences, sanitizeParams, validateParams, freqToDateFnsMap } from './lib';
import {
  Frequency,
  type MethodOptions,
  type Options,
  Weekday,
  type Params,
  type ListResult,
  ListMethodOptions,
} from './types';

const LIST_LIMIT = 10000;
const TIMEOUT_LIMIT = 100000;

/**
 * A rule representing a recurring calendar event.
 */
export class RRule {
  private params: Params;
  private options: Options;
  private timeoutLimit = TIMEOUT_LIMIT;

  constructor(params: Params, options?: Options) {
    this.params = sanitizeParams(params as Params);
    this.options = options ?? {
      strict: false,
    };
  }

  /**
   *
   * @param {Object} params
   *
   * Returns an array of errors if anything about the parameters is invalid. Returns an empty array if there are no errors.
   */
  static validate(params: Params): string[] {
    try {
      validateParams(params);

      return [];
    } catch (e) {
      return [e];
    }
  }

  /**
   * @param {Object} params
   * @param {Object} options
   * A convenient method to create an RRule where `strict` is set to `true`. This may be useful if the
   * `strict` behavior is used often throughout a large codebase.
   */
  static strict(params: Params, options?: Options) {
    return new RRule(params, { ...options, strict: true });
  }

  private *dateset(start?: Date, end?: Date): Generator<Date, null> {
    const { dtStart, tzid, count, until, exDate, rDate } = this.params;
    const { strict } = this.options;

    const isAfterDtStart = (current: Date) => current.getTime() >= dtStart.getTime();
    const isAfterUntil = (current: Date) => !!until && current.getTime() >= until.getTime();
    const isInBounds = (current: Date) => {
      const afterStart = !start || current.getTime() >= start.getTime();
      const beforeEnd = !end || current.getTime() <= end.getTime();
      const dateIsNotExcluded =
        !exDate || !exDate.some((excludedDate) => excludedDate.getTime() === current.getTime());

      return afterStart && beforeEnd && dateIsNotExcluded;
    };

    let isFirstIteration = true;
    let yieldedOccurrenceCount = 0;
    let current = new TZDateMini(dtStart, tzid);

    // RRule standard specifies DTSTART is always the first occurrence, regardless of
    // whether it meets the rule criteria or not.
    // Make sure it yields first, *unless* the user has overridden this behavior by
    // setting strict: true
    let hasYieldedDtStart = false;
    if (!strict) {
      const dtStartIsInBounds = isInBounds(dtStart);
      if (dtStartIsInBounds) {
        yield new Date(current);
        hasYieldedDtStart = true;
        yieldedOccurrenceCount++;
      }
    }

    const nextOccurrences: TZDate[] = [];
    const nextRDates: TZDate[] = rDate?.map((date) => new TZDateMini(date, tzid)) ?? [];
    let iters = 0;

    let nextRDate = nextRDates.shift();
    while (
      (!count && !until) ||
      (count && yieldedOccurrenceCount < count) ||
      (until && current.getTime() < until.getTime())
    ) {
      iters++;
      if (iters > this.timeoutLimit) {
        throw new Error('RRule iteration limit exceeded');
      }
      if (nextRDate) {
        const previousOccurrence = current;
        if (isEqual(nextRDate, previousOccurrence)) {
          // Discard the RDate, it matches the rule and has already been yielded
          nextRDate = nextRDates.shift();
          continue;
        }

        const nextOccurrence = nextOccurrences[0];

        if (nextOccurrence && isBefore(nextRDate, nextOccurrence)) {
          yield nextRDate;
          yieldedOccurrenceCount++;
          nextRDate = nextRDates.shift();
          continue;
        }
      }

      const next = nextOccurrences.shift();
      if (next) {
        current = next;
        if (!isAfterDtStart(current)) continue;
        if (!strict && current.getTime() === dtStart.getTime() && hasYieldedDtStart) continue;
        if (isAfterUntil(current)) return null;
        yieldedOccurrenceCount++;
        if (isInBounds(current)) {
          yield new Date(current);
        } else if (start && current.getTime() > start.getTime()) {
          return null;
        }
      } else {
        getNextOccurrences({
          refDT: current.withTimeZone(tzid),
          ...this.params,
          interval: isFirstIteration ? 0 : this.params.interval,
          wkst: this.params.wkst ? (this.params.wkst as Weekday) : Weekday.MO,
        }).forEach((r) => nextOccurrences.push(r));

        if (nextOccurrences.length === 0 && !isFirstIteration) {
          // If we've reached the end of occurrences, keep looking ahead by the defined interval
          // Continue iterating until the end of the dateset
          current = add(current, {
            [freqToDateFnsMap[this.params.freq ?? Frequency.YEARLY]]: this.params.interval ?? 1,
          });
        }

        isFirstIteration = false;
      }
    }

    // yield all remaining rDates before ending the generator
    for (const occurrence of nextRDates) {
      yield new Date(occurrence);
    }

    return null;
  }

  /**
   *
   * @param {Date} start
   * @param {Date} end
   * @param {Object} options
   * @param {boolean} options.inclusive Defaults to `false`
   *
   * Returns an array of all dates between `start` and `end`.
   * If `inclusive` is true and either `start` or `end` are actual occurrences, then `start` and/or `end` will be included in the array of dates.
   */
  between(start: Date, end: Date, { inclusive = false }: MethodOptions = {}) {
    if (isNaN(start.getTime())) {
      throw new Error('RRule error: Start date passed to `between` is invalid');
    }
    if (isNaN(end.getTime())) {
      throw new Error('RRule error: End date passed to `between` is invalid');
    }
    const dates = [...this.dateset(start, end)];
    if (!inclusive) {
      if (dates[0] && isEqual(dates[0], start)) dates.shift();
      if (dates.length && isEqual(dates[dates.length - 1], end)) dates.pop();
    }

    return [...dates];
  }

  /**
   *
   * @param {Date} dt
   * @param {Object} options
   * @param {boolean} options.inclusive Defaults to `false`
   *
   * Returns the last occurrence before `dt`, or `null` if there is none.
   * If `inclusive` is true and `dt` is an actual occurrence, the method will return `dt`.
   */
  before(dt: Date, { inclusive = false }: MethodOptions = {}) {
    if (isNaN(dt.getTime())) {
      throw new Error('RRule error: Date passed to `before` is invalid');
    }
    const dates = [...this.dateset(this.params.dtStart, dt)];

    let lastDate = dates[dates.length - 1];
    if (!inclusive && lastDate && isEqual(dt, lastDate)) lastDate = dates[dates.length - 2];

    if (!lastDate) return null;
    return lastDate;
  }

  /**
   *
   * @param {Date} dt
   * @param {Object} options
   * @param {boolean} options.inclusive Defaults to `false`
   *
   * Returns the last occurrence after `dt`, or `null` if there is none.
   * If `inclusive` is true and `dt` is an actual occurrence, the method will return `dt`.
   */
  after(dt: Date, { inclusive = false }: MethodOptions = {}) {
    if (isNaN(dt.getTime())) {
      throw new Error('RRule error: Date passed to `after` is invalid');
    }
    const dates = this.dateset(dt);

    let nextDate = dates.next().value;
    if (!inclusive && nextDate && isEqual(dt, nextDate)) nextDate = dates.next().value;

    if (!nextDate) return null;
    return nextDate;
  }

  /**
   *
   * @param {Object} options
   * @param {number} options.limit Defaults to 10000
   *
   * Returns an array of all `Date`s matching the rule. The `limit` argument will be the maximum size of the list of matches returned.
   * If you omit the `limit`, the method will return up to 10000 matches. If it hits the limit, the array will come back with the
   * property `hasMore: true`.
   */
  list({ limit = LIST_LIMIT }: ListMethodOptions = {}): ListResult {
    const dateGenerator = this.dateset();
    const dates: ListResult = [];
    let next = dateGenerator.next();
    for (let i = 0; i < limit; i++) {
      if (!next.done) dates.push(next.value);
      else break;
      next = dateGenerator.next();
    }
    if (next.done) return dates;
    else {
      dates.hasMore = true;
      return dates;
    }
  }

  __unsafeSetTimeoutLimit(limit: number) {
    this.timeoutLimit = limit;
  }
}
