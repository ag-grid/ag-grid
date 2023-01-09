---
title: "Axes"
---

This section explains what chart axes are, how to configure and style them, and which axis type to use in which situation.

A chart uses axes to plot data such as categories and values by converting them to screen coordinates. Since any point on the screen is an `(x, y)` pair of coordinates, a chart needs two orthogonal axes to plot the data &mdash; a horizontal axis to determine the `x` position of a point and a vertical axis to determine the `y` position. Axes also show ticks, labels and grid lines to help the user navigate a chart.

The charting library supports four axis types:

- [Category](#category-axis)
- [Number](#number-axis)
- [Log](#log-axis)
- [Time](#time-axis)

Each type is tailored to be used with certain types of data. An axis can be positioned to any side of a chart &mdash; `'top'`, `'right'`, `'bottom'`, or `'left'`. Just like with series, the axes can be specified by setting the corresponding `axes` array property of a chart.

[[note]]
| Axes are only supported in <a href="https://en.wikipedia.org/wiki/Cartesian_coordinate_system" target="blank">cartesian</a> charts, not <a href="https://en.wikipedia.org/wiki/Polar_coordinate_system" target="blank">polar</a>. For example, you can't use axes with pie series.

## Category Axis

The category axis is meant to be used with relatively small datasets of discrete values or categories, such as sales per product, person or quarter, where _product_, _person_ and _quarter_ are categories.

The category axis attempts to render a [tick](#axis-ticks), a [label](#axis-labels) and a [grid line](#axis-grid-lines) for each category, and spaces out all ticks evenly.

The category axis is used as the x-axis by default, positioned at the bottom of a chart.

The simplest category axis config looks like this:

```js
{
    type: 'category',
    position: 'bottom'
}
```

## Number Axis

The number axis is meant to be used as a value axis. While categories are spaced out evenly, the distance between values depends on their magnitude.

Instead of using one tick per value, the number axis will determine the range of all values, round it up and try to segment the rounded range with evenly spaced ticks.

The number axis is used as the y-axis by default, positioned to the left a chart.

Here's the simplest number axis config:

```js
{
    type: 'number',
    position: 'left'
}
```

## Log Axis

If the range of values is very wide, the `log` axis can be used instead of the `number` axis.
For example, because the `number` axis uses a linear scale, same changes in magnitude result in the
same pixel distance.

The `log` axis uses a log scale, where same _percentage_ changes in magnitude result in the same pixel distance.
In other words, the pixel distance between 10 and 100, and 100 and 1000 will be the same because both ranges
represent the same percentage increase. Whereas, if the `number` axis was used, the second distance would be
10 times larger than the first.

The above property of the log axis can also be useful in financial charts. For example, if your rate of
return on an investment stays consistent over time, the investment value chart will look like a straight line.

By default, the `log` axis attempts to render 10 ticks (and grid lines) per order of magnitude, depending
on available space. If your range is wide enough, you may start getting too many ticks, in which case
using a smaller value for the `tick: { count: xxx }` config might be necessary:

```js
{
    type: 'log',
    position: 'left',
    tick: {
      count: 3
    }
}
```

The `log` axis uses the common logarithm (base 10) by default. The `base` config allows
you to change the base to any number you like, for example `Math.E` for natural or `2` for binary logarithms:

```js
{
    type: 'log',
    position: 'left',
    base: 2
}
```

All of the above points are demonstrated by the example below.

### Example: Number Axis vs Log Axis

<chart-example title='Number Axis vs Log Axis' name='number-vs-log' type='generated'></chart-example>

[[note]]
| The range of a log axis should be strictly positive or strictly negative (because there's no power you can raise a number to that will yield zero). For that reason, any non-conforming range will be clipped to conformity, leaving only the larger segment. For example, `[0, 10]` will be clipped to  `[Number.EPSILON, 10]`, while `[-10, 5]` will be clipped to `[-10, -Number.EPSILON]`. Since there can be orders of magnitude difference between `Number.EPSILON` and the other range value, it is often desirable to set the `min` or `max` property of the axis manually. In this case it can be `min: 1` and `max: -1`, respectively.
## Time Axis

The time axis is similar to the number axis in the sense that it is also used to plot continuous values. The time axis can even be used with numeric data (in addition to `Date` objects), but the numbers will be interpreted as Unix timestamps. The time axis differs from the number axis in tick segmentation and label formatting. For example, you could choose to place a tick every 5 minutes, every month, or every Friday.

The time axis also supports specifier strings to control the way time values are presented as labels. For example, the `%H:%M:%S` specifier string will instruct the axis to format a time value like `new Date('Tue Feb 04 202 15:08:03')` or `1580828883000` as `'15:08:03'`. Time axes are typically used as x-axes and placed at the bottom of a chart. The simplest time axis config looks like this:

```js
{
    type: 'time',
    position: 'bottom'
}
```

## Axis Title

Sometimes it may not be obvious what a chart's dimension represents. For example, you might see numbers on a chart's axis and not be able to tell if they're millimetres, percentages, dollars, or something else! It can also be helpful to provide extra information. For example, category axis labels can clearly show people's names, but it might be worth knowing that they are a company's best performing sales people.

Luckily, an axis can have a title just like a chart. In the example below we can use axis titles to point out that:

- the horizontal dimension shows desktop operating systems
- the vertical dimension shows their percentage market share

Please see the [API reference](#reference-AgBaseCartesianAxisOptions-title) for axis title styling options like font and colour.

### Example: Axis Title

<chart-example title='Axis Title' name='axis-title' type='generated'></chart-example>

## Axis Ticks

Category axes show a tick for every category. Number and time axes try to segment the whole range into a certain number of intervals depending on the available rendering space.

The `width`, `size` and `color` of chart axis ticks can be configured as explained in the [API reference](#reference-AgNumberAxisOptions-tick) below. These configs apply to all axis types.

With number and time axes you can additionally set the `count` property - this will override the dynamic
calculation based upon available rendering space:

- In number axes the `count` means the desired number of ticks for the axis to use. Note that this value only serves as a hint and doesn't guarantee that this number of ticks is going to be used.
- In time axes the `count` property can be set to a time interval, for example `agCharts.time.month`, to make an axis show a tick every month, or to an interval derived from one of the predefined intervals, such as `agCharts.time.month.every(3)`.

The example below demonstrates how the `count` property of the number axis can be used to reduce or increase the amount of ticks.

<chart-example title='Axis Tick Styling' name='axis-tick-count' type='generated'></chart-example>

Please see the documentation for the numeric axis ticks in the [API reference](#number-axis-1) to learn about other available properties.

The example below demonstrates the usage of time intervals:
- `agCharts.time.month` will produce monthly ticks.
- `agCharts.time.month.every(2)` will generate ticks for every second month.

```js
{
    type: 'time',
    tick: {
        count: agCharts.time.month.every(2)
    }
}
```

<chart-example title='Time Axis Label Format' name='time-axis-label-format' type='generated'></chart-example>

Other available time intervals are: `year`, `month`, `day`, `hour`, `minute`, `second`, `millisecond`. There are some UTC time intervals: `utcYear`, `utcMonth`, `utcDay`, `utcYear`, `utcMinute`.

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

A label formatter function can be used to change the value displayed in the label. It's a handy feature when you need to show units next to values or format number values to a certain precision, for example.

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

Notice that the `label.format` property only affects label formatting but not segmentation. The fact that axis labels were configured to show the name of the month and the year doesn't mean that the axis will show a tick every month. To ensure that it does, we also set the `tick.count` config to use the `agCharts.time.month` interval.

Please see the [Axis Ticks](#axis-ticks) section to learn more about tick count and tick intervals.

## Axis Grid Lines

Chart axes feature grid lines by default. Grid lines extend from axis ticks on the other side of the axis into the series area, so that it's easy to trace a series item such as a marker to a corresponding tick/label.

Grid lines have the same stroke width as ticks.

Grid lines of each axis can be styled individually via the `gridStyle` config. The config takes an array of objects with two properties:

- `stroke`: colour string in hex, <a href="https://www.w3.org/TR/css-color-4/#typedef-named-color" target="blank">named</a>, rgb, or rgba format.
- `lineDash`: an array of numbers that specify distances to alternately draw a line and a gap. If the number of elements in the array is odd, the elements of the array get copied and concatenated. For example, `[5, 15, 25]` will become `[5, 15, 25, 5, 15, 25]`. If the array is empty, the grid lines will be solid without any dashes.

Each config object in the `gridStyle` array is alternately applied to the grid lines of the axis.

### Example: Grid Lines

<chart-example title='Axis Grid Lines' name='axis-grid-lines' type='generated'></chart-example>

## Multiple axes in a single direction

If you have two different datasets (each represented by its own series) but they are on vastly different scales, it is possible to have
one series be coordinated by one axis and the other series coordinated by another axis, all in a single chart.

If this is the case, the charting library will need some help in the form of an extra axis config to figure out which series should be
coordinated by which axes. By setting the axis' `keys` config to the keys of the series in question, you let the charting library know
that all series that use that those keys will be coordinated by this axis, as illustrated by the example below.

### Example: Multiple y-axes

Note, that we are:
- using two number axis configurations in the `axes` array
- position one number axis to the `left` and the other to the `right` of the chart
- set the left number axis `keys` to match the `yKey`s of the `column` series
- set the right number axis `keys` to match the `yKey` of the `line` series

<chart-example title='Multiple y-axes' name='multiple-axes' type='generated'></chart-example>


## Cross Lines

Cross lines display a vertical or horizontal line or region running across a desired chart region. This feature can be useful for data analysis as the cross lines or shaded regions will emphasise trends and draw attention to important information such as a threshold. Cross lines are not supported on polar (pie, doughnut) or treemap charts.

To render a cross line at a specific data value associated with a particular axis, the `crossLines` property needs to be specified on the individual `axes` options objects. The cross lines will span the entire chart width or height depending on which axis they are configured on.

```js
axes: [
	{
		position: 'bottom',
		type: 'number',
		crossLines: [
			// an Array of cross lines to be displayed at specific values at the bottom axis.
			{
				type: 'line',
				value: 20
			}
		]
	}
]
```

The snippet above will render a vertical line running across the height of the chart at the data value `20` on the bottom axis.

To display a region bound by two lines, the cross line `type` can be configured to `range` and the `range` property set to an array containing two data values corresponding to the boundaries of the cross line region:

```js
axes: [
	{
		position: 'right',
		type: 'number',
		crossLines: [
			// an Array of cross lines to be displayed at specific values at the right axis.
			{
				type: 'range',
				range: [10, 20]
			}
		]
	}
]
```

The snippet above will mark a horizontal region between the values `10` and `20`, running across the width of the chart.

Cross lines styles such as `stroke`, `strokeWidth` and `fill` are customisable via `AgCrossLineOptions`. A `label` can also be added and positioned with respect to the cross line.

```js
crossLines: [
  {
    type: 'range',
    range: ['apple', 'orange'],
    label: {
      text: 'Price Peak',
      position: 'top',
      fontSize: 14,
      // other cross line label options...
    },
    strokeWidth: 0,
    fill: '#7290C4',
    fillOpacity: 0.4,
  },
],
```

Please see the [API reference](#reference-AgBaseCartesianAxisOptions-crossLines) for the full cross lines styling options.

### Example: Cross Lines

The example below demonstrates how one or more cross lines can be configured in each axis direction. Note that:

- Data values can be numbers or categories such as string values or Date objects in accordance with values provided in the chart data.
- The left Y axis has cross lines with type `line`, so the `value` property on each cross lines options object is used to position the lines on the chart.
- The bottom X axis has a cross line of type `range`; the `range` property is used to configure the range of the cross line boundaries.

<chart-example title='Cross Lines' name='axis-cross-lines' type='generated'></chart-example>

## Axis API Reference

<interface-documentation interfaceName='AgBaseCartesianAxisOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation>

### Category Axis

<interface-documentation interfaceName='AgCategoryAxisOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false, "lookupRoot": "charts-api" }' exclude='["position", "title", "line", "label", "gridStyle", "keys"]'></interface-documentation>

### Number Axis

<interface-documentation interfaceName='AgNumberAxisOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false, "lookupRoot": "charts-api" }' exclude='["position", "title", "line", "label", "gridStyle", "keys"]'></interface-documentation>

### Log Axis

<interface-documentation interfaceName='AgLogAxisOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false, "lookupRoot": "charts-api" }' exclude='["position", "title", "line", "label", "gridStyle", "keys"]'></interface-documentation>

### Time Axis

<interface-documentation interfaceName='AgTimeAxisOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false, "lookupRoot": "charts-api" }' exclude='["position", "title", "line", "label", "gridStyle", "keys"]'></interface-documentation>

## Next Up

Continue to the next section to learn about [events](../events/).
