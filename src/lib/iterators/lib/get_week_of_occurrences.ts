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
import { type IterParams, Weekday } from '@/types';
import { getISODay, setDay } from 'date-fns';
import { getDayOfOccurrences } from './get_day_of_occurrences';

const ISO_WEEKDAYS = [
  Weekday.MO,
  Weekday.TU,
  Weekday.WE,
  Weekday.TH,
  Weekday.FR,
  Weekday.SA,
  Weekday.SU,
];

export const getWeekOfOccurrences = function ({
  refDT,
  wkst = Weekday.MO,
  byDay,
  byHour,
  byMinute,
  bySecond,
  byMonth,
}: IterParams) {
  const weekStart = wkst ?? Weekday.MO;
  const weekdaysToUse = byDay?.map((entry) => {
    if (typeof entry === 'number') return entry;
    const [, weekday] = entry;
    return weekday;
  }) ?? [getISODay(refDT)];

  const weekdays = ISO_WEEKDAYS.slice(weekStart - 1)
    .concat(ISO_WEEKDAYS.slice(0, weekStart - 1))
    .filter((d) => weekdaysToUse.includes(d));

  return weekdays.flatMap((day) => {
    const currentDay = setDay(refDT, weekdayToDateFnsDay(day), {
      weekStartsOn: weekdayToDateFnsDay(weekStart),
    });
    return getDayOfOccurrences({
      refDT: currentDay,
      byHour,
      byMinute,
      bySecond,
      byMonth,
    });
  });
};
