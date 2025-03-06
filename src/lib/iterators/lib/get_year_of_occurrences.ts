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
import type { IterParams } from '@/types';
import type { TZDate } from '@date-fns/tz';
import { add, getISOWeek, getISOWeeksInYear, getYear, set, setDayOfYear } from 'date-fns';
import { getDayOfOccurrences } from './get_day_of_occurrences';
import { getMonthOfOccurrences } from './get_month_of_occurrences';
import { getWeekOfOccurrences } from './get_week_of_occurrences';

export const getYearOfOccurrences = function ({
  refDT,
  wkst,
  byYearDay,
  byMonth,
  byMonthDay,
  byWeekNo,
  byDay,
  byHour,
  byMinute,
  bySecond,
}: IterParams) {
  if (byYearDay) {
    return byYearDay.flatMap((dayOfYear) => {
      const currentDate = setDayOfYear(refDT, dayOfYear);
      if (getYear(currentDate) !== getYear(refDT)) return [];
      return getDayOfOccurrences({ refDT: currentDate, byHour, byMinute, bySecond });
    });
  }

  if (byMonth) {
    return byMonth.flatMap((month) => {
      const currentMonth = set(refDT, { month: month - 1 });
      return getMonthOfOccurrences({
        refDT: currentMonth,
        wkst,
        byMonth,
        byMonthDay,
        byDay,
        byHour,
        byMinute,
        bySecond,
      });
    });
  }

  if (byDay) {
    // Iterate through every week in the year, byDay filters can potentially result in lots of occurrences
    return Array.from(Array(getISOWeeksInYear(refDT)), (_, i) => i).flatMap((weekNo) => {
      const currentWeek: TZDate = add(set(refDT, { month: 0, date: 1 }), { weeks: weekNo });
      if (byWeekNo && !byWeekNo.includes(getISOWeek(currentWeek))) return [];

      return getWeekOfOccurrences({
        refDT: currentWeek,
        wkst,
        byDay,
        byHour,
        byMinute,
        bySecond,
        byMonth,
      });
    });
  }

  // Use the yearday in refDT as byYearDay and just get a single day of occurrences
  return getDayOfOccurrences({ refDT, byHour, byMinute, bySecond });
};
