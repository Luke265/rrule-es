# rrule-es

rrule-es is a modern JavaScript library for working with recurring events on calendar dates, implementing the [iCalendar RRULE](https://datatracker.ietf.org/doc/html/rfc5545) standard. It has strong support for timezones, focuses on full compliance to the iCalendar spec, and on stability and consistency no matter what system it's running on.

## Usage

```ts
import RRule, { Frequency, Weekday } from 'rrule-es';

// Create an RRule for an event that happens every other weekend in the Paris timezone
const rule = new RRule({
  freq: Frequency.WEEKLY,
  interval: 2,
  tzid: 'Europe/Paris',
  byDay: [Weekday.SA, Weekday.SU],
  dtStart: new Date('2025-03-01T00:00:00Z'),
});

// List the first 6 occurrences
rule.list(6);
/* [
  2025-03-01T00:00:00.000Z,
  2025-03-02T00:00:00.000Z,
  2025-03-15T00:00:00.000Z,
  2025-03-16T00:00:00.000Z,
  2025-03-29T00:00:00.000Z,
  2025-03-30T00:00:00.000Z,
] */

// Get a list of occurrences between 2 dates
rule.between(new Date('2025-03-10T00:00:00Z'), new Date('2025-05-01T00:00:00Z'));
/* [
  2025-03-15T00:00:00.000Z,
  2025-03-16T00:00:00.000Z,
  2025-03-29T00:00:00.000Z,
  2025-03-30T00:00:00.000Z,
  2025-04-11T23:00:00.000Z, <- Strong timezone support takes DST into account
  2025-04-12T23:00:00.000Z,
  2025-04-25T23:00:00.000Z,
  2025-04-26T23:00:00.000Z
] */

// Get the first occurrence after a date
rule.after(new Date('2025-03-10T00:00:00Z'));
/* 2025-03-15T00:00:00.000Z */

// Get the last occurrence before a date
rule.before(new Date('2025-04-27T00:00:00.000Z'));
/* 2025-04-26T23:00:00.000Z */

// Validate a set of parameters to ensure they can form a valid rule
RRule.validate({
  freq: Frequency.DAILY,
  tzid: 'UTC',
  dtStart: new Date(),
  byWeekNo: [20],
});
/* ['byWeekNo is only valid when the frequency is yearly'] */
```

## API

### Constructor

```ts
new RRule(params, (options = {}));
```

#### `params`

| Parameter    | Type                                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------ | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tzid`       | `string` **required**                          | An [IANA timezone string](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). For best results, use a country and a city. For example, `America/Phoenix` and `America/Denver` are both in US Mountain time but Phoenix doesn't observe DST                                                                                                                                                                                                                                                                                                                      |
| `dtStart`    | `Date` **required**                            | A JavaScript `Date` object indicating when the recurrence rule starts. For ease of use when considering timezones, you may want to generate this from an absolute Unix timestamp. (According to iCalndar standarad, the `dtStart` will always be the first occurrence of the rule even if it doesn't fit the underlying recurrence rule; if you prefer a behavior more similar to `python-dateutil`, see `strict` in `Options` below, or include `dtStart` in the `exDate`) parameter                                                                                      |
| `freq`       | enum `Frequency`                               | Values are `Frequency.YEARLY`, `.MONTHLY`, `.WEEKLY`, `.DAILY`, `.HOURLY`, `.MINUTELY`, or `.SECONDLY`. Defaults to `YEARLY`                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `interval`   | `number`                                       | The interval between each freq. For example, `interval: 1` and `YEARLY` is every 1 year, `interval: 2` and `WEEKLY` is every 2 weeks                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `count`      | `number`                                       | The number of times this rule will recur until it stops. If omitted, the rule recurs forever.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `until`      | `Date`                                         | If provided, the rule will recur until this `Date`, and then stop.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `wkst`       | enum `Weekday`                                 | `Weekday.MO`, `.TU`, `.WE`, `.TH`, `.FR`, `.SA`, `.SU`, or an ISO weekday integer from 1 to 7. When passed with the `WEEKLY` frequency, this determines what day the week starts on. Defaults to `Weekday.MO`                                                                                                                                                                                                                                                                                                                                                              |
| `byDay`      | `Array<Weekday \| [nonzero integer, Weekday]>` | `Weekday.MO`, `.TU`, `.WE`, `.TH`, `.FR`, `.SA`, `.SU`. If provided, this rule will recur on the listed `Weekday`s of the week, e.g. `[Weekday.MO, Weekday.FR]` recurs every Monday and Friday. If passed an array of nested arrays like `[nth, day of week]`, the rule will recur on the `n`th day of the week based on the `freq`. For example, `[[-2, Weekday.MO], [-1, Weekday.TU]]` combined with `MONTHLY` recurs on the second to last Monday and the last Tuesday of the month. `[[20, Weekday.MO]]` combined with `YEARLY` recurs on the 20th Monday of the year. |
| `byMonth`    | `number[]`                                     | An array of months of the year when this rule should recur, numbered `1` to `12`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `byMonthDay` | `number[]`                                     | An array of days of the month when this rule should recur, e.g. `[1, 15]` for the 1st and 15th of the month                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `byWeekNo`   | `number[]`                                     | An array of weeks of the year when this rule should recur, numbered `1` to `53`. As per iCalendar standard, RRule will throw an error if this is paired with anything but a `freq` of `YEARLY`                                                                                                                                                                                                                                                                                                                                                                             |
| `byHour`     | `number[]`                                     | An array of hours of the day when this rule should recur, numbered `1` to `24`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `byMinute`   | `number[]`                                     | An array of minutes of the hour when this rule should recur, numbered `1` to `59`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `bySecond`   | `number[]`                                     | An array of seconds of the minute when this rule should recur, numbered `1` to `59`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `bySetPos`   | `number[]`                                     | An array of integers specifying every `n`th occurrence of the rule based on the `freq`. This will filter out all occurrences _except_ for these occurrences. For example, a `MONTHLY` frequency combined with a `byDay` of `[Weekday.SA, Weekday.SU]` and a `bySetPos` of `[-1]` will recur on the last weekend day of the month.                                                                                                                                                                                                                                          |
| `exDate`     | `Date[]`                                       | An array of `Date` instances to exclude from the occurrences. These Dates, if they occur in the recurrence rule, will always be skipped.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `rDate`      | `Date[]`                                       | An array of `Date` instances to always include in the occurrences. If these Dates do not naturally occur as a result of the rule, they will be inserted into the occurrence list.                                                                                                                                                                                                                                                                                                                                                                                          |

#### `options`

| Option   | Type      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `strict` | `boolean` | Defaults to `false`. If `false`, the specified `dtStart` will always be the first occurrence of the rule. This behavior is compliant with the iCalendar RFC, but can be inconvenient. If you set `strict` to `true`, then `dtStart` will not NECESSARILY be the first occurrence of the rule. It will only occur if it actually meets the rule criteria. Similar RRULE libraries such as `python-dateutil` have identical behavior to `strict: true` |

## Methods

### `RRule.prototype.list(opts: { limit?: number })`

returns `Date[] & { hasMore?: boolean }`

Returns an array all dates matching the rule. The `limit` argument will be the maximum size of the list of matches returned. If you omit the `limit`, the method will return up to 10000 matches.

If it hits the limit, the array will come back with the property `hasMore: true`.

### `RRule.prototype.before(dt: Date, opts: { inclusive: boolean = false })`

returns `Date | null`

Returns the last occurrence before `dt`, or `null` if there is none.

If `inclusive` is true and `dt` is an actual occurrence, the method will return `dt`.

### RRule.prototype.after(dt: Date, opts: { inclusive: boolean = false })`

returns `Date | null`

Returns the last occurrence after `dt`, or `null` if there is none.

If `inclusive` is true and `dt` is an actual occurrence, the method will return `dt`.

### RRule.prototype.between(start: Date, end: Date, opts: { inclusive: boolean = false })`

returns `Date[]`

Returns an array of all dates between `start` and `end`.

If `inclusive` is true and either `start` or `end` are actual occurrences, then `start` and/or `end` will be included in the array of dates.

## Static methods

### `RRule.strict(params: Params, options?: Options)`

A convenient method to create an RRule where `strict` is set to `true`. This may be useful if the `strict` behavior is used often throughout a large codebase.

Accepts an `options` argument for consistency, even though as of this release the only option `strict` will always be overridden and set to `true`. This is for future-proofing in case more options are added in a later release.

#### Usage

```ts
const rule = new RRule.strict({ ... });
```

### `RRule.validate(params: Params)`

Takes an object of RRule params and returns an array of errors if anything about the parameters is invalid. Returns an empty array if there are no errors.

## License

Copyright 2025 Elasticsearch B.V.
Licensed under the Apache License 2.0, see LICENSE.txt for details
