---
title: "Excel Export - Data Types"
enterprise: true
---

## Data types

The following example demonstrates how to use other data types for your export. Note that:

- Boolean works off using 1 for true
- The date time format for excel follows this format yyyy-mm-ddThh:MM:ss.mmm:
- If you try to pass data that is not compatible with the underlying data type Excel will throw an error
- When using `dataType: 'DateTime'` Excel doesn't format the resultant value, in this example it shows 39923. You need to add the formatting inside Excel. You can see a better example of how to handle Date Formatting in the [Excel Export - Excel Styles](/excel-export-styles/#styling-dates) section.

<grid-example title='Excel Data Types' name='excel-export-data-types' type='generated' options='{ "enterprise": true, "exampleHeight": 200 }'></grid-example>

## Dates
When exporting dates to Excel format, you should use an Excel Style with `dataType="DateTime"`. The `DateTime` format only accepts dates in `ISO Format`, therefore, in order to get this to work, all dates need to be provided in the `yyyy-mm-ddThh:mm:ss` format. If your dates are not in ISO format, you should use the `processCellCallback` method to convert them. By default, these values are displayed as number, as demonstrated in [Data Types](/excel-export/#example-data-types). To make these numbers look like a regular date, the Excel Style should be combined with the `numberFormat` Excel Style.

Note the following:

- There is only one date source in `ISO Format`.
- All columns apart from the `ISO Format` column use `Value Formatter` to change the date format.
- The `excelStyles` has a `numberFormat` for each date style (including the ISO Format), otherwise only a number would be displayed.

<grid-example title='Excel Export - Styling Dates' name='excel-export-dates' type='generated' options='{ "enterprise": true }'></grid-example>
