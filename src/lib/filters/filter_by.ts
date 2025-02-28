/*
 * Copyright Elasticsearch B.V. Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import type { TZDate } from '@date-fns/tz';
import {
  getDayOfYear,
  getDaysInYear,
  getDate,
  getDaysInMonth,
  getMonth,
  getHours,
  getMinutes,
} from 'date-fns';
import type { Params } from '@/types';
import { filterByDay } from './filter_by_day';

export const filterBy =
  ({ byYearDay, byMonth, byMonthDay, byDay, byHour, byMinute }: Partial<Params>) =>
  (occurrence: TZDate) => {
    if (byYearDay && !filterByYearDay(byYearDay)(occurrence)) return false;
    if (byMonth && !filterByMonth(byMonth)(occurrence)) return false;
    if (byMonthDay && !filterByMonthDay(byMonthDay)(occurrence)) return false;
    if (byDay && !filterByDay(byDay)(occurrence)) return false;
    if (byHour && !filterByHour(byHour)(occurrence)) return false;
    if (byMinute && !filterByMinute(byMinute)(occurrence)) return false;
    return true;
  };

const filterByYearDay = (byYearDay: Params['byYearDay']) => (occurrence: TZDate) =>
  !byYearDay ||
  byYearDay.some((dayOfYear) => {
    const occurrenceDayOfYear = getDayOfYear(occurrence);
    if (dayOfYear < 0) {
      const daysInOccurrenceYear = getDaysInYear(occurrence);
      return occurrenceDayOfYear === daysInOccurrenceYear + dayOfYear;
    }
    return occurrenceDayOfYear === dayOfYear;
  });

const filterByMonth = (byMonth: Params['byMonth']) => (occurrence: TZDate) =>
  !byMonth || byMonth.some((month) => getMonth(occurrence) === month - 1);

const filterByMonthDay = (byMonthDay: Params['byMonthDay']) => (occurrence: TZDate) =>
  !byMonthDay ||
  byMonthDay.some((monthday) => {
    if (monthday > 0) return getDate(occurrence) === monthday;
    return getDate(occurrence) === getDaysInMonth(occurrence) + 1 + monthday;
  });

const filterByHour = (byHour: Params['byHour']) => (occurrence: TZDate) =>
  !byHour || byHour.some((hour) => getHours(occurrence) === hour);

const filterByMinute = (byMinute: Params['byMinute']) => (occurrence: TZDate) =>
  !byMinute || byMinute.some((minute) => getMinutes(occurrence) === minute);
