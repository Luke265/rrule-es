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
import { getDate, getDaysInMonth, getMonth, set } from 'date-fns';
import { getDayOfOccurrences } from './get_day_of_occurrences';

export const getMonthOfOccurrences = function ({
  refDT,
  byMonthDay,
  byMonth,
  byDay,
  byHour,
  byMinute,
  bySecond,
}: IterParams) {
  const currentMonth = getMonth(refDT);
  if (byMonth && !byMonth.includes(currentMonth + 1)) return [];

  const daysInCurrentMonth = getDaysInMonth(refDT);

  const derivedBymonthday =
    byMonthDay ??
    // If byMonthDay is undefined but byDay is, iterate through every day of the month, filter by weekday later
    (byDay
      ? Array.from(Array(daysInCurrentMonth), (_, i) => i + 1)
      : // In all other cases, derive monthday from the ref DT. This is probably caused by
        // a yearly frequency recurring on the same day each year
        [getDate(refDT)]);

  return derivedBymonthday.flatMap((d) => {
    const date =
      d > 0
        ? d
        : // Handle negative byMonthDay values (e.g. -3 for third to last day of month)
          // Add 1 to daysInMonth so that -1 equals last day of month, e.g. Jan 31, 32 - 1 = 31
          daysInCurrentMonth + 1 + d;

    if (daysInCurrentMonth < date) return [];

    const currentDate = set(refDT, { date });
    if (byMonth && !byMonth.includes(getMonth(currentDate) + 1)) return [];

    return getDayOfOccurrences({
      refDT: currentDate,
      byHour,
      byMinute,
      bySecond,
    });
  });
};
