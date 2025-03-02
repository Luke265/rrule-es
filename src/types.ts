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

export enum Frequency {
  YEARLY = 0,
  MONTHLY = 1,
  WEEKLY = 2,
  DAILY = 3,
  HOURLY = 4,
  MINUTELY = 5,
  SECONDLY = 6,
}

export enum Weekday {
  MO = 1,
  TU = 2,
  WE = 3,
  TH = 4,
  FR = 5,
  SA = 6,
  SU = 7,
}

export interface IterParams {
  refDT: TZDate;
  wkst?: Weekday | number | null;
  byYearDay?: number[] | null;
  byMonth?: number[] | null;
  bySetPos?: number[] | null;
  byMonthDay?: number[] | null;
  byWeekNo?: number[] | null;
  byDay?: Array<Weekday | [number, Weekday]> | null;
  byHour?: number[] | null;
  byMinute?: number[] | null;
  bySecond?: number[] | null;
}

export type Params = Omit<IterParams, 'refDT'> & {
  dtStart: Date;
  freq?: Frequency;
  interval?: number;
  until?: Date | null;
  count?: number;
  tzid: string;
  exDate?: Date[];
  rDate?: Date[];
};

export interface Options {
  strict?: boolean;
}
