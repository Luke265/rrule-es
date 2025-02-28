/*
 * Copyright Elasticsearch B.V. Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import type { Day } from 'date-fns';
import { Weekday, Frequency } from '../../types';

export const weekdayToDateFnsDay = (weekday: Weekday) =>
  (weekday === Weekday.SU ? 0 : weekday) as Day;

export const freqToDateFnsMap = {
  [Frequency.YEARLY]: 'years',
  [Frequency.MONTHLY]: 'months',
  [Frequency.WEEKLY]: 'weeks',
  [Frequency.DAILY]: 'days',
  [Frequency.HOURLY]: 'hours',
  [Frequency.MINUTELY]: 'minutes',
  [Frequency.SECONDLY]: 'seconds',
};
