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
import { getMinutes, set } from 'date-fns';
import type { IterParams } from '@/types';
import { getMinuteOfOccurrences } from './get_minute_of_occurrences';

export const getHourOfOccurrences = function ({ refDT, byMinute, bySecond }: IterParams) {
  const derivedByminute =
    byMinute ?? (bySecond ? Array.from(Array(60), (_, i) => i) : [getMinutes(refDT)]);

  return derivedByminute.flatMap((m) => {
    const currentMinute = set(refDT, { minutes: m });
    return getMinuteOfOccurrences({ refDT: currentMinute, bySecond });
  });
};
