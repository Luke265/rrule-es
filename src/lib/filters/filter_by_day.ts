/*
 * Copyright Elasticsearch B.V. Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import { weekdayToDateFnsDay } from '@/lib/helpers';
import { Frequency, Weekday, type Params } from '@/types';
import type { TZDate } from '@date-fns/tz';
import {
  add,
  getDate,
  getDaysInMonth,
  getISODay,
  isEqual,
  nextDay,
  previousDay,
  set,
  sub,
} from 'date-fns';

export const filterByDay = (byDay: Params['byDay'], freq?: Frequency) => {
  const integerBydayEntries = byDay?.filter((d) => typeof d === 'number') ?? [];
  const posBydayEntries = byDay?.filter((d) => Array.isArray(d)) ?? [];

  return (occurrence: TZDate) => {
    if (!byDay) return true;

    const occurrenceDayOfWeek = getISODay(occurrence);
    if (integerBydayEntries.some((day) => occurrenceDayOfWeek === day)) return true;
    if (freq === Frequency.MONTHLY)
      return filterByPosWeekdayOfMonth(occurrence, occurrenceDayOfWeek, posBydayEntries);
    if (freq === Frequency.YEARLY)
      return filterByPosWeekdayOfYear(occurrence, occurrenceDayOfWeek, posBydayEntries);
    else return posBydayEntries.some(([, weekday]) => occurrenceDayOfWeek === weekday);
  };
};

const filterByPosWeekdayOfMonth = (
  occurrence: TZDate,
  occurrenceDayOfWeek: Weekday,
  posBydayEntries: Array<[number, Weekday]>
) => {
  const occurrenceDateInMonth = getDate(occurrence);
  const matchingWeekdaysInMonth: number[] = [];

  for (let date = 1; date <= getDaysInMonth(occurrence); date++) {
    const currentDateInMonthOfOccurrence = set(occurrence, { date });
    const dayOfWeek = getISODay(currentDateInMonthOfOccurrence);
    if (dayOfWeek === occurrenceDayOfWeek) matchingWeekdaysInMonth.push(date);
  }

  return posBydayEntries.some(([pos, weekday]) => {
    if (occurrenceDayOfWeek !== weekday) return false;
    if (pos < 0) {
      return (
        matchingWeekdaysInMonth[matchingWeekdaysInMonth.length + pos] === occurrenceDateInMonth
      );
    }
    return matchingWeekdaysInMonth[pos - 1] === occurrenceDateInMonth;
  });
};

const filterByPosWeekdayOfYear = (
  occurrence: TZDate,
  occurrenceDayOfWeek: Weekday,
  posBydayEntries: Array<[number, Weekday]>
) => {
  const firstDayOfYear = set(occurrence, { month: 0, date: 1 });
  const lastDayOfYear = set(occurrence, { month: 11, date: 31 });
  const firstWeekdayOfYear = getISODay(firstDayOfYear);
  const lastWeekdayOfYear = getISODay(lastDayOfYear);

  return posBydayEntries.some(([pos, weekday]) => {
    if (occurrenceDayOfWeek !== weekday) return false;
    let targetDate: TZDate;
    if (pos > 0) {
      const firstTargetWeekdayOfYear =
        firstWeekdayOfYear === weekday
          ? firstDayOfYear
          : nextDay(firstDayOfYear, weekdayToDateFnsDay(weekday));

      targetDate = add(firstTargetWeekdayOfYear, { weeks: pos - 1 });
    } else {
      const lastTargetWeekdayOfYear =
        lastWeekdayOfYear === weekday
          ? lastDayOfYear
          : previousDay(lastDayOfYear, weekdayToDateFnsDay(weekday));
      targetDate = sub(lastTargetWeekdayOfYear, { weeks: Math.abs(pos) - 1 });
    }
    return isEqual(occurrence, targetDate);
  });
};
