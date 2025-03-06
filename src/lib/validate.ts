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
import { tzOffset } from '@date-fns/tz';
import { Params, Frequency } from '@/types';

export function validateParams(inputParams: Params) {
  const params = { ...inputParams };

  if (params.dtStart === null) {
    throw new Error('dtStart is required');
  }

  if (!params.tzid) {
    throw new Error('tzid is required');
  }

  if (isNaN(params.dtStart.getTime())) {
    throw new Error('dtStart is an invalid date');
  }

  if (isNaN(tzOffset(params.tzid, new Date()))) {
    throw new Error('tzid is an invalid timezone');
  }

  if (
    typeof params.interval !== 'undefined' &&
    (!Number.isInteger(params.interval) || params.interval < 1)
  ) {
    throw new Error('interval must be an integer greater than 0');
  }

  if (!!params.until && isNaN(params.until.getTime())) {
    throw new Error('until is an invalid date');
  }

  if (
    typeof params.count !== 'undefined' &&
    (!Number.isInteger(params.count) || params.count < 1)
  ) {
    throw new Error('count must be an integer greater than 0');
  }

  if (
    !!params.byMonthDay &&
    (params.byMonthDay.length < 1 ||
      params.byMonthDay.some(
        (monthDay) =>
          !Number.isInteger(monthDay) || Math.abs(monthDay) < 1 || Math.abs(monthDay) > 31
      ))
  ) {
    throw new Error(
      'byMonthDay must be an array of nonzero numbers between 1 and 31 or -1 and -31'
    );
  }

  if (
    !!params.byMonth &&
    (params.byMonth.length < 1 ||
      params.byMonth.some((month) => !Number.isInteger(month) || month < 1 || month > 12))
  ) {
    throw new Error('byMonth must be an array of numbers between 1 and 12');
  }

  if (
    !!params.byWeekNo &&
    (params.byWeekNo.length < 1 ||
      params.byWeekNo.some((week) => !Number.isInteger(week) || week < 1 || week > 53))
  ) {
    throw new Error('byWeekNo must be an array of numbers between 1 and 53');
  }

  if (!!params.byWeekNo && params.freq !== Frequency.YEARLY) {
    throw new Error('byWeekNo is only valid when the frequency is yearly');
  }

  if (params.byDay) {
    if (params.byDay.length < 1) {
      throw new Error(
        'byDay must be an array of at least one integer between 1 and 7, or a nested array of [nonzero integer, integer 1 to 7]'
      );
    }

    const byDayNumbers = params.byDay?.filter((weekDay) => typeof weekDay === 'number') as number[];

    const byDayArrays = params.byDay?.filter((weekDay) => Array.isArray(weekDay)) as Array<
      [number, number]
    >;

    if (
      byDayNumbers.some(
        (weekDayNum) => !Number.isInteger(weekDayNum) || weekDayNum < 1 || weekDayNum > 7
      )
    ) {
      throw new Error('byDay numbers must been between 1 and 7');
    }

    if (
      byDayArrays.some(
        ([posNum, weekDayNum]) =>
          !Number.isInteger(posNum) ||
          !Number.isInteger(weekDayNum) ||
          posNum === 0 ||
          weekDayNum < 1 ||
          weekDayNum > 7
      )
    ) {
      throw new Error('byDay arrays must be [nonzero integer, integer between 1 and 7]');
    }

    if (params.freq === Frequency.MONTHLY && byDayArrays.some(([posNum]) => Math.abs(posNum) > 5)) {
      throw new Error(
        'byDay arrays must start with a nonzero integer between 5 and -5 when paired with the monthly frequency'
      );
    }
  }
}
