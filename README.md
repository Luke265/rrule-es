# rrule-es

rrule-es is a modern JavaScript library for working with recurring events on calendar dates, implementing the [iCalendar RRULE](https://datatracker.ietf.org/doc/html/rfc5545) standard. It has strong support for timezones, focuses on full compliance to the iCalendar spec, and on stability and consistency no matter what system it's running on.

## Usage

```ts
import { RRule, Frequency, Weekday } from 'rrule-es';

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

<table>
    <tr>
        <td>Parameter</td>
        <td>Type</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>`tzid`</td>
        <td>`string` **required**</td>
        <td>An [IANA timezone string](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). For best results, use a country and a city. For example, `America/Phoenix` and `America/Denver` are both in US Mountain time but Phoenix doesn&#39;t observe DST</td>
    </tr>
    <tr>
        <td>`dtStart`</td>
        <td>`Date` **required**</td>
        <td>A JavaScript `Date` object indicating when the recurrence rule starts. For ease of use when considering timezones, you may want to generate this from an absolute Unix timestamp. (According to iCalndar standarad, the `dtStart` will always be the first occurrence of the rule even if it doesn&#39;t fit the underlying recurrence rule; if you prefer a behavior more similar to `python-dateutil`, see `forceIncludeDtStart` in `Options` below, or include `dtStart` in the `exDate`) parameter</td>
    </tr>
    <tr>
        <td>`freq`</td>
        <td>enum `Frequency`</td>
        <td>Values are `Frequency.YEARLY`, `.MONTHLY`, `.WEEKLY`, `.DAILY`, `.HOURLY`, `.MINUTELY`, or `.SECONDLY`. Defaults to `YEARLY`</td>
    </tr>
    <tr>
        <td>`interval`</td>
        <td>`number`</td>
        <td>The interval between each freq. For example, `interval: 1` and `YEARLY` is every 1 year, `interval: 2` and `WEEKLY` is every 2 weeks</td>
    </tr>
    <tr>
        <td>`count`</td>
        <td>`number`</td>
        <td>The number of times this rule will recur until it stops. If omitted, the rule recurs forever.</td>
    </tr>
    <tr>
        <td>`until`</td>
        <td>`Date`</td>
        <td>If provided, the rule will recur until this `Date`, and then stop.</td>
    </tr>
    <tr>
        <td>`wkst`</td>
        <td>enum `Weekday`</td>
        <td>`Weekday.MO`, `.TU`, `.WE`, `.TH`, `.FR`, `.SA`, `.SU`, or an ISO weekday integer from 1 to 7. When passed with the `WEEKLY` frequency, this determines what day the week starts on. Defaults to `Weekday.MO`</td>
    </tr>
    <tr>
        <td>`byDay`</td>
        <td>`Array&lt;Weekday \| [nonzero integer, Weekday]&gt;`</td>
        <td>`Weekday.MO`, `.TU`, `.WE`, `.TH`, `.FR`, `.SA`, `.SU`. If provided, this rule will recur on the listed `Weekday`s of the week, e.g. `[Weekday.MO, Weekday.FR]` recurs every Monday and Friday. If passed an array of nested arrays like `[nth, day of week]`, the rule will recur on the `n`th day of the week based on the `freq`. For example, `[[-2, Weekday.MO], [-1, Weekday.TU]]` combined with `MONTHLY` recurs on the second to last Monday and the last Tuesday of the month. `[[20, Weekday.MO]]` combined with `YEARLY` recurs on the 20th Monday of the year.</td>
    </tr>
    <tr>
        <td>`byMonth`</td>
        <td>`number[]`</td>
        <td>An array of months of the year when this rule should recur, numbered `1` to `12`</td>
    </tr>
    <tr>
        <td>`byMonthDay`</td>
        <td>`number[]`</td>
        <td>An array of days of the month when this rule should recur, e.g. `[1, 15]` for the 1st and 15th of the month</td>
    </tr>
    <tr>
        <td>`byWeekNo`</td>
        <td>`number[]`</td>
        <td>An array of weeks of the year when this rule should recur, numbered `1` to `53`. As per iCalendar standard, RRule will throw an error if this is paired with anything but a `freq` of `YEARLY`</td>
    </tr>
    <tr>
        <td>`byHour`</td>
        <td>`number[]`</td>
        <td>An array of hours of the day when this rule should recur, numbered `1` to `24`</td>
    </tr>
    <tr>
        <td>`byMinute`</td>
        <td>`number[]`</td>
        <td>An array of minutes of the hour when this rule should recur, numbered `1` to `59`</td>
    </tr>
    <tr>
        <td>`bySecond`</td>
        <td>`number[]`</td>
        <td>An array of seconds of the minute when this rule should recur, numbered `1` to `59`</td>
    </tr>
    <tr>
        <td>`bySetPos`</td>
        <td>`number[]`</td>
        <td>An array of integers specifying every `n`th occurrence of the rule based on the `freq`. This will filter out all occurrences *except* for these occurrences. For example, a `MONTHLY` frequency combined with a `byDay` of `[Weekday.SA, Weekday.SU]` and a `bySetPos` of `[-1]` will recur on the last weekend day of the month.</td>
    </tr>
    <tr>
        <td>`exDate`</td>
        <td>`Date[]`</td>
        <td>An array of `Date` instances to exclude from the occurrences. These Dates, if they occur in the recurrence rule, will always be skipped.</td>
    </tr>
    <tr>
        <td>`rDate`</td>
        <td>`Date[]`</td>
        <td>An array of `Date` instances to always include in the occurrences. If these Dates do not naturally occur as a result of the rule, they will be inserted into the occurrence list.</td>
    </tr>
</table>

#### `options`

<table>
    <tr>
        <td>Option</td>
        <td>Type</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>`forceIncludeDtStart`</td>
        <td>`boolean`</td>
        <td>Defaults to `true`. If `true`, the specified `dtStart` will always be the first occurrence of the rule. This behavior is compliant with the iCalendar RFC, but can be inconvenient. If you set `forceIncludeDtStart` to `false`, then `dtStart` will not NECESSARILY be the first occurrence of the rule. It will only occur if it actually meets the rule criteria.</td>
    </tr>
</table>

```ts
new RRule(Params, Options);

interface Params {
dtStart: Date; // Recommended to generate this from a UTC timestamp, but this impl
tzid: string; // Takes an IANA timezone string. Recommended to use a country and city for DST accuracy, e.g. America/Phoenix and America/Denver are both in Mountain time but Phoenix doesn't observe DST
freq?: Frequency; // Defaults to YEARLY
interval?: number; // Every x freq, e.g. 1 and YEARLY is every 1 year, 2 and WEEKLY is every 2 weeks
until?: Date; // Recur until this date
count?: number; // Number of times this rule should recur until it stops
wkst?: Weekday | number; // Start of week, defaults to Monday
// The following, if not provided, will be automatically derived from the dtstart
byDay?: Weekday[] | string[]; // Day(s) of the week to recur, OR nth-day-of-month strings, e.g. "+2TU" second Tuesday of month, "-1FR" last Friday of the month, which will get internally converted to a byweekday/bysetpos combination
bySetPos?: number[]; // Positive or negative integer affecting nth day of the month, eg -2 combined with byweekday of FR is 2nd to last Friday of the month. Best not to set this manually and just use byweekday.
byYearDay?: number[]; // Day(s) of the year that this rule should recur, e.g. 32 is Feb 1. Respects leap years.
byMonth?: number[]; // Month(s) of the year that this rule should recur
byMonthDay?: number[]; // Day(s) of the momth to recur
byHour?: number[]; // Hour(s) of the day to recur
byMinute?: number[]; // Minute(s) of the hour to recur
bySecond?: number[]; // Seconds(s) of the day to recur
}

interface Options {
forceIncludeDtStart?: boolean; // Defaults to `true`
}

```

## Methods

### `RRule.prototype.list(limit?: number)`

returns `Date[] & { hasMore?: boolean }`

Returns an array all dates matching the rule. The `limit` argument will be the maximum size of the list of matches returned. If you omit the `limit`, the method will return up to 10000 matches.

If it hits the limit, the array will come back with the property `hasMore: true`.

### `RRule.prototype.before(dt: Date. inclusive: boolean = false)`

returns `Date | null`

Returns the last occurrence before `dt`, or `null` if there is none.

If `inclusive` is true and `dt` is an actual occurrence, the method will return `dt`.

### RRule.prototype.after(dt: Date, inclusive: boolean = false)`

returns `Date | null`

Returns the last occurrence after `dt`, or `null` if there is none.

If `inclusive` is true and `dt` is an actual occurrence, the method will return `dt`.

### RRule.prototype.between(start: Date, end: Date, inclusive: boolean = false)`

returns `Date[]`

Returns an array of all dates between `start` and `end`.

If `inclusive` is true and either `start` or `end` are actual occurrences, then `start` and/or `end` will be included in the array of dates.
