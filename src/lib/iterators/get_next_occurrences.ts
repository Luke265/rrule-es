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
import { add } from 'date-fns';
import { Frequency, Weekday, type IterParams } from '@/types';
import {
  getMonthOfOccurrences,
  getDayOfOccurrences,
  getHourOfOccurrences,
  getMinuteOfOccurrences,
  getWeekOfOccurrences,
  getYearOfOccurrences,
} from './lib';
import { filterBy, filterByDay, filterBySetpos } from '@/lib/filters';

export const getNextOccurrences = function ({
  refDT,
  wkst = Weekday.MO,
  byYearDay,
  byMonth,
  byMonthDay,
  byWeekNo,
  byDay,
  byHour,
  byMinute,
  bySecond,
  bySetPos,
  freq = Frequency.YEARLY,
  interval = 1,
}: IterParams & {
  freq?: Frequency;
  interval?: number;
}) {
  const params = {
    wkst,
    byYearDay,
    byMonth,
    byMonthDay,
    byWeekNo,
    byDay,
    byHour,
    byMinute,
    bySecond,
    bySetPos,
  };

  switch (freq) {
    case Frequency.YEARLY: {
      const nextRef = add(refDT, { years: interval });
      return getYearOfOccurrences({
        refDT: nextRef,
        ...params,
      })
        .filter(filterByDay(byDay, Frequency.YEARLY))
        .filter(filterBySetpos(bySetPos));
    }
    case Frequency.MONTHLY: {
      const nextRef = add(refDT, { months: interval });
      return getMonthOfOccurrences({
        refDT: nextRef,
        ...params,
      })
        .filter(filterBy({ byYearDay }))
        .filter(filterByDay(byDay, Frequency.MONTHLY))
        .filter(filterBySetpos(bySetPos));
    }
    case Frequency.WEEKLY: {
      const nextRef = add(refDT, { weeks: interval });
      return getWeekOfOccurrences({
        refDT: nextRef,
        ...params,
      })
        .filter(filterBy({ byYearDay, byMonth, byMonthDay }))
        .filter(filterBySetpos(bySetPos));
      // filterByDay is handled inside of getWeekOfOccurrences for more efficiency
    }
    case Frequency.DAILY: {
      const nextRef = add(refDT, { days: interval });
      return getDayOfOccurrences({
        refDT: nextRef,
        ...params,
      })
        .filter(filterBy({ byYearDay, byMonth, byMonthDay, byDay }))
        .filter(filterBySetpos(bySetPos));
    }
    case Frequency.HOURLY: {
      const nextRef = add(refDT, { hours: interval });
      return getHourOfOccurrences({
        refDT: nextRef,
        ...params,
      })
        .filter(filterBy({ byYearDay, byMonth, byMonthDay, byDay }))
        .filter(filterBySetpos(bySetPos));
    }
    case Frequency.MINUTELY: {
      const nextRef = add(refDT, { minutes: interval });
      return getMinuteOfOccurrences({
        refDT: nextRef,
        ...params,
      })
        .filter(filterBy({ byYearDay, byMonth, byMonthDay, byDay, byHour }))
        .filter(filterBySetpos(bySetPos));
    }
    case Frequency.SECONDLY: {
      const nextRef = add(refDT, { seconds: interval });
      return getMinuteOfOccurrences({
        refDT: nextRef,
        ...params,
      })
        .filter(filterBy({ byYearDay, byMonth, byMonthDay, byDay, byHour, byMinute }))
        .filter(filterBySetpos(bySetPos));
    }
  }
};
