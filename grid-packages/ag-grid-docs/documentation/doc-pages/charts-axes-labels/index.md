---
title: "Axis Labels"
---

This section covers axis labels.

## Axis Labels

The axis renders a label next to every tick to show the tick's value. Chart axis labels support the same font and colour options as the axis title. Additionally, the distance of the labels from the ticks and their rotation can be configured via the `padding`, `rotation` and `autoRotate` properties respectively.

### Label Rotation & Skipping

Label rotation allows a trade-off to be made between space occupied by the axis, series area, and readability of the axis
labels.

Three rotation approaches are available:
- No rotation. X-axis labels are parallel to the axis, Y-axis labels are perpendicular.
- Setting a fixed rotation from the axis via the `rotation` property.
- Enabling automatic rotation via the `autoRotate` property, and optionally specifying a rotation angle via the
  `autoRotateAngle` property. Rotation is applied if any label will be wider than the gap between ticks.

Label skipping is performed automatically when there is a high likelihood of collisions. To disable this, set `label.avoidCollisions` to false:

```js
{
    label: {
      avoidCollisions: false
    }
}
```

If `autoRotate` is enabled, rotation will be attempted first to find a label fit, before label skipping applies.
Category axes have `autoRotate` enabled by default with the default `autoRotateAngle` of `335`.

When `label.avoidCollisions` is `true`, the axis labels are dropped if they do not have a minimum of `10`px between them. This minimum gap between the axis labels can be configured using the `label.minSpacing` property:

```js
{
    label: {
      minSpacing: 20
    }
}
```

The following example demonstrates label rotation and skipping:
- There is a grab handle in the bottom right to allow resizing of the chart to see how labels change with available
  space.
- Initially both axes have defaults applied. The X-axis is a category axis so `autoRotate` is enabled by default.
- The first row of buttons at the top change the configuration of both axes to allow all rotation behaviours to be
  viewed.
- The second row of buttons allow switching between X-axis types and labels.

<chart-example title='Axis Label Rotation & Skipping' name='axis-label-rotation' type='generated'></chart-example>


### Label Formatting

A label formatter function can be used to change the value displayed in the label. It's a handy feature when you need to show units next to values or format number values to a certain precision.

A label formatter function receives a single `params` object which contains:

- the raw `value` of the label (without the default formatting applied)
- the `index` of the label in the data array
- the number of `fractionDigits`, if the value is a number
- the default label `formatter`, if the axis is a time axis

For example, to add `'%'` units next to number values, you can use the following formatter function:

```js
formatter: function(params) {
    return params.value + '%';
}
```

<chart-example title='Axis Label Formatter' name='axis-label-formatter' type='generated'></chart-example>

#### Number Label Format String

For number axes, a format string can be provided, which will be used to format the numbers for display as axis labels.
The format string may contain the following directives, which reflect those from Python's <a href="https://docs.python.org/3/library/string.html#format-specification-mini-language" target="_blank">format specification</a>:

`[[fill]align][sign][#][0][width][grouping_option][.precision][type]`

Where:

- `fill` - Can be any character.
- `align`:
  - `>` - Forces the field to be right-aligned within the available space (default).
  - `<` - Forces the field to be left-aligned within the available space.
  - `^` - Forces the field to be centered within the available space.
  - `=` - Like >, but with any sign and symbol to the left of any padding.
- `sign`:
  - `-` - Nothing for zero or positive and a minus sign for negative (default).
  - `+` - A plus sign for zero or positive and a minus sign for negative.
  - `(` - Nothing for zero or positive and parentheses for negative.
  - ` ` - A space for zero or positive and a minus sign for negative.
- `symbol`:
  - `$` - Apply the `$` currency symbol
  - `#` - For binary, octal, or hexadecimal notation, prefix by `0b`, `0o`, or `0x`, respectively.
- `zero` - The `0` option enables zero-padding. Implicitly sets fill to `0` and align to `=`.
- `width` - The width defines the minimum field width. If not specified, then the width will be determined by the content.
- `comma` - The comma `,` option enables the use of a group separator, such as a comma for thousands.
- `precision` - Depending on the type, the precision either indicates the number of digits that follow the decimal point (types `f` and `%`), or the number of significant digits (types ` `​, `e`, `g`, `r`, `s` and `p`). If the precision is not specified, it defaults to 6 for all types except `​ ` (none), which defaults to 12. Precision is ignored for integer formats (types `b`, `o`, `d`, `x`, `X` and `c`).
- `trim` - The `~` option trims insignificant trailing zeros across all format types. This is most commonly used in conjunction with types `r`, `e`, `s` and `%`.
- `type` - Determines how the data should be presented:
  - `%` - Multiply by 100, and then decimal notation with a percent sign.
  - `b` - Binary notation, rounded to integer.
  - `c` - Converts the integer to the corresponding unicode character before printing.
  - `d` - Decimal notation, rounded to integer.
  - `e` - Exponent notation.
  - `f` - Fixed point notation.
  - `g` - Either decimal or exponent notation, rounded to significant digits.
  - `o` - Octal notation, rounded to integer.
  - `p` - Multiply by 100, round to significant digits, and then decimal notation with a percent sign.
  - `r` - Decimal notation, rounded to significant digits.
  - `s` - Decimal notation with a SI prefix, rounded to significant digits.
  - `x` - Hexadecimal notation, using lower-case letters, rounded to integer.
  - `X` - Hexadecimal notation, using upper-case letters, rounded to integer.

[[note]]
|If you want to have a formatted value in the middle of some string, you have to wrap it in `#{}`,
| so that it's clear where the number format begins and ends. For example: `I'm #{0>2.0f} years old`.

The `label` config of the left axis in the example below uses the `'🌧️ #{0>2.1f} °C'` specifier string for the `format` property to format numbers as integers padded to left with zeros to achieve a consistent 2-digit width.

Notice that we wrapped the number format in `#{}` since we want to prepend the formatted value with the weather icon
and to append the units used at the end.

<chart-example title='Number Axis Label Format' name='number-axis-label-format' type='generated'></chart-example>

#### Number Currency Format

Let's take a look at another example that illustrates a common requirement of formatting numbers as currency. Note that we are using:
- the `s` SI prefix directive to shorten big numbers by using smaller numbers in combination with units,
  so that `3500000` becomes `3.5M` for example
- the `~` trim option to trim all insignificant trailing zeros from the formatted value,
  so that `3.0M` becomes `3M` for example
- the `$` option so that the formatted value is prefixed by the `$` symbol
- the `formatter` function in addition to the `format` config to convert certain SI units to currency units

The last point deserves a more in-depth explanation. Because the currency units don't match the SI
units exactly, we have to convert certain SI units to their currency counterparts.
For example, the SI unit for thousands is `k` for kilo, `M` for `mega`, `G` for `giga` and so on.
With currencies though it's typical to format thousands as `K`, while `M` is the same for `million` and `B` (rather than `G`) is used to denote a `billion`.

So how do we replace `k` with `K` and `G` with `B`? To do that, we need to provide a `formatter` function in addition to our `format` string. The `formatter` function receives the unformatted `value`,
as well as the `formatter` function generated from the `format` config we provided. So all we have
to do is to format the original value using that generated formatter `params.formatter(params.value)`
and replace the SI units with the currency ones `.replace('k', 'K').replace('G', 'B')`.


<chart-example title='Number Axis Currency Format' name='number-axis-currency-format' type='generated'></chart-example>

#### Time Label Format String

For time axes, a format string can be provided, which will be used to format the dates for display as axis labels. The format string may contain the following directives, which reflect those from Python's <a href="https://strftime.org/" target="_blank">strftime</a>:

- `%a` - abbreviated weekday name.*
- `%A` - full weekday name.*
- `%b` - abbreviated month name.*
- `%B` - full month name.*
- `%c` - the locale’s date and time, such as `%x`, `%X`.*
- `%d` - zero-padded day of the month as a decimal number `[01,31]`.
- `%e` - space-padded day of the month as a decimal number `[ 1,31]`; equivalent to `%_d`.
- `%f` - microseconds as a decimal number `[000000,999999]`.
- `%H` - hour (24-hour clock) as a decimal number `[00,23]`.
- `%I` - hour (12-hour clock) as a decimal number `[01,12]`.
- `%j` - day of the year as a decimal number `[001,366]`.
- `%m` - month as a decimal number `[01,12]`.
- `%M` - minute as a decimal number `[00,59]`.
- `%L` - milliseconds as a decimal number `[000,999]`.
- `%p` - either AM or PM.*
- `%Q` - milliseconds since UNIX epoch.
- `%s` - seconds since UNIX epoch.
- `%S` - second as a decimal number `[00,61]`.
- `%u` - Monday-based (ISO) weekday as a decimal number `[1,7]`.
- `%U` - Sunday-based week of the year as a decimal number `[00,53]`.
- `%V` - ISO 8601 week number of the year as a decimal number `[01, 53]`.
- `%w` - Sunday-based weekday as a decimal number `[0,6]`.
- `%W` - Monday-based week of the year as a decimal number `[00,53]`.
- `%x` - the locale’s date, such as `%-m/%-d/%Y`.*
- `%X` - the locale’s time, such as `%-I:%M:%S %p`.*
- `%y` - year without century as a decimal number `[00,99]`.
- `%Y` - year with century as a decimal number.
- `%Z` - time zone offset, such as `-0700`, `-07:00`, `-07`, or `Z`.
- `%%` - a literal percent sign (%).

Directives marked with an asterisk (*) may be affected by the locale definition.

For `%U`, all days in a new year preceding the first Sunday are considered to be in week 0.<br />
For `%W`, all days in a new year preceding the first Monday are considered to be in week 0.<br />

For `%V`, per the strftime man page:

In this system, weeks start on a Monday, and are numbered from 01, for the first week, up to 52 or 53, for the last week. Week 1 is the first week where four or more days fall within the new year (or, synonymously, week 01 is: the first week of the year that contains a Thursday; or, the week that has 4 January in it).

The `%` sign indicating a directive may be immediately followed by a padding modifier:

1. `0` - zero-padding
1. `_` - space-padding
1. (nothing) - disable padding

If no padding modifier is specified, the default is `0` for all directives except `%e`, which defaults to `_`.

The `label` config of the bottom axis in the example below uses the `'%b&nbsp;%Y'` specifier string for the `format` property to format dates as the abbreviated name of the month followed by the full year.

Notice that the `label.format` property only affects label formatting but not segmentation. The fact that axis labels were configured to show the name of the month and the year doesn't mean that the axis will show a tick every month. To ensure that it does, we also set the `tick.interval` config to use the `time.month` interval.

Please see the [Axis Ticks](#axis-ticks) section to learn more about tick intervals.

## Axis Grid Lines

Chart axes feature grid lines by default. Grid lines extend from axis ticks on the other side of the axis into the series area, so that it's easy to trace a series item such as a marker to a corresponding tick/label.

Grid lines have the same stroke width as ticks.

Grid lines of each axis can be styled individually via the `gridStyle` config. The config takes an array of objects with two properties:

- `stroke`: colour string in hex, <a href="https://www.w3.org/TR/css-color-4/#typedef-named-color" target="blank">named</a>, rgb, or rgba format.
- `lineDash`: an array of numbers that specify distances to alternately draw a line and a gap. If the number of elements in the array is odd, the elements of the array get copied and concatenated. For example, `[5, 15, 25]` will become `[5, 15, 25, 5, 15, 25]`. If the array is empty, the grid lines will be solid without any dashes.

Each config object in the `gridStyle` array is alternately applied to the grid lines of the axis.

## Next Up

Continue to the next section to learn more about [overlays](/charts-overlays/).