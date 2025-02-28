/*
 * Copyright Elasticsearch B.V. Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import { tzOffset } from '@date-fns/tz';
import { Frequency, type Params } from '@/types';

export function sanitizeParams(inputParams: Params) {
  const params = { ...inputParams };

  // Guard against invalid params that can't be omitted
  if (!params.dtStart) {
    throw new Error('Cannot create RRule: dtStart is required');
  }

  if (!params.tzid) {
    throw new Error('Cannot create RRule: tzid is required');
  }

  if (isNaN(params.dtStart.getTime())) {
    throw new Error('Cannot create RRule: dtStart is an invalid date');
  }

  if (isNaN(tzOffset(params.tzid, new Date()))) {
    throw new Error('Cannot create RRule: tzid is invalid');
  }

  if (params.until && isNaN(params.until.getTime())) {
    throw new Error('Cannot create RRule: until is an invalid date');
  }

  if (params.interval !== null && params.interval !== undefined) {
    if (typeof params.interval !== 'number') {
      throw new Error('Cannot create RRule: interval must be a number');
    }

    if (params.interval < 1) {
      throw new Error('Cannot create RRule: interval must be greater than 0');
    }
  }

  if (params.byMonth) {
    // Only months between 1 and 12 are valid
    params.byMonth = params.byMonth.filter(
      (month) => typeof month === 'number' && month >= 1 && month <= 12
    );
    if (!params.byMonth.length) {
      delete params.byMonth;
    }
  }

  if (params.byMonthDay) {
    // Only days with an absolute value of 1 and 31 are valid
    params.byMonthDay = params.byMonthDay.filter(
      (day) => typeof day === 'number' && Math.abs(day) >= 1 && Math.abs(day) <= 31
    );
    if (!params.byMonthDay.length) {
      delete params.byMonthDay;
    }
  }

  if (params.byDay) {
    params.byDay = params.byDay.filter((day) => {
      const [pos, weekday] = typeof day === 'number' ? [1, day] : day;
      if (Math.abs(pos) >= 5 && params.freq === Frequency.MONTHLY) return false;

      return pos !== 0 && weekday >= 1 && weekday <= 7;
    });
    if (!params.byDay.length) {
      delete params.byDay;
    }
  }

  if (params.byYearDay) {
    // Only days between 1 and 366 are valid
    params.byYearDay = params.byYearDay.filter((day) => day >= 1 && day <= 366);
    if (!params.byYearDay.length) {
      delete params.byYearDay;
    }
  }

  if (params.byWeekNo) {
    // Only weeks between 1 and 53 are valid
    params.byWeekNo = params.byWeekNo.filter((week) => week >= 1 && week <= 53);
    // iCalendar RFC specifies byWeekNo is only valid when paired with Yearly frequency
    if (!params.byWeekNo.length || params.freq !== Frequency.YEARLY) {
      delete params.byWeekNo;
    }
  }

  if (params.wkst && (params.wkst < 1 || params.wkst > 7)) {
    delete params.wkst;
  }

  return params;
}
