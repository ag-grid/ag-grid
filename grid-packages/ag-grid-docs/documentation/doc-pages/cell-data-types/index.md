---
title: "Cell Data Types"
---

Editing values of different data types, as well as using other grid functionality, is made easy by using cell data types.

## Enable Cell Data Types

Cell data types can be enabled by setting the `cellDataType` property on the column definition.

There are six pre-defined data types: `'text'`, `'number'`, `'boolean'`, `'date'`, `'dateString'` and `'object'`.

<api-documentation source='column-properties/properties.json' section="columns" names='["cellDataType"]'></api-documentation>

<snippet spaceBetweenProperties="true">
|const gridOptions = {
|    columnDefs: [
|        {
|            field: 'athlete',
|            // enables cell data type `text`
|            cellDataType: 'text'
|        }
|    ]
|}
</snippet>

As well as specifying a specific cell data type for a column, the grid can also infer the cell data type from the row data. This can be done by setting `cellDataType = 'auto'`. This can be set on the [Default Column Definition](/column-definitions/#custom-column-types) to apply to all columns.

The inference will occur the first time that row data is passed into the grid. For inference to work for a column, it must contain non-null values and have the `field` property set (inference will not use Value Getters). If these conditions are not met, no cell data type will be set (it will need to be defined directly on the column if desired). Note that where inference is possible but it does not match any of the pre-defined cell data types, it will default to `object`.

The following example demonstrates enabling cell data types (via `'auto'`):
- The **Athlete** column has a `'text'` data type.
- The **Age** column has a `'number'` data type.
- The **Gold** column has a `'boolean'` data type.
- The **Date** column has a `'date'` data type.
- The **Date (String)** column has a `'dateString'` data type.
- The **Country** column has an `'object'` data type. This also [Overrides the Pre-Defined Cell Data Type Definition](#overriding-the-pre-defined-cell-data-type-definitions) so that the value parser and formatter work with the object structure.

<grid-example title='Enable Cell Data Types' name='enable-cell-data-types' type='generated'></grid-example>

<note>
Inferring cell data types only works for the Client-Side Row Model. For other row models, you will need to define cell data types for each column.
</note>

## Pre-Defined Cell Data Types

Each of the pre-defined cell data types work by setting specific column definition properties with default values/callbacks. This enables the different grid features to work correctly for that data type.

The column definition properties that are set based on the cell data type will override any in the [Default Column Definition](/column-definitions/#custom-column-types), but will be overridden by any [Column Type](/column-definitions/#custom-column-types) properties as well as properties set directly on individual column definitions.

As most grid functionality works directly with `string` values, the `'text'` cell data type does not set many properties. All of the other cell data types set the following (unless specified):
- A [Value Parser](/value-parsers/) to convert from `string` to the relevant data type.
- A [Value Formatter](/value-formatters/) to convert from the relevant data type to `string`.
- `useValueParserForImport = true` to [Use the Value Parser with Other Grid Features](/value-parsers/#use-value-parser-for-import).
- `useValueFormatterForExport = true` to [Use the Value Formatter with Other Grid Features](/value-formatters/#use-value-formatter-for-export).
- A [Key Creator](/grouping-complex-objects/#creating-group-keys-from-complex-objects) which uses the Value Formatter to allow Row Grouping to work (except for `'number'` which doesn't need to).

### Text

The `'text'` cell data type is used for `string` values. The only property set is a Value Parser to handle `''` as `null`.

### Number

The `'number'` cell data type is used for `number` values.

The following properties are set:
- Cell values and headers are aligned right via `headerClass` and `cellClass`.
- The [Number Cell Editor](/provided-cell-editors/#number-cell-editor) is used for editing.
- For AG Grid Community, the [Number Filter](/filter-number/) is used.
- For AG Grid Enterprise, `filterParams.comparator` is set to [Sort the Filter List](/filter-set-filter-list/#sorting-filter-lists).

To show only a certain number of decimal places, you can [Override the Pre-Defined Cell Data Type Definition](#overriding-the-pre-defined-cell-data-type-definitions) and provide your own Value Formatter. It is also possible to control the number of decimal places allowed during editing, by providing a precision to the [Number Cell Editor](/provided-cell-editors/#number-cell-editor).

### Boolean

The `'boolean'` cell data type is used for `boolean` values.

The following properties are set:
- The [Checkbox Cell Renderer](/cell-rendering/#checkbox-cell-renderer) is used for rendering, which displays a checkbox.
- The [Checkbox Cell Editor](/provided-cell-editors/#checkbox-cell-editor) is used for editing (similar to the renderer).
- `suppressKeyboardEvent` is set to enable the <kbd>Space</kbd> key to toggle the renderer value.
- For AG Grid Community, the [Text Filter](/filter-text/) is used, and `filterParams` is set to display a single dropdown with `'True'`/`'False'` (or equivalents with [Localisation](/localisation/)).
- For AG Grid Enterprise, `filterParams.valueFormatter` is set to show `'True'`/`'False'` (or equivalents with [Localisation](/localisation/)).

### Date

The `'date'` cell data type is used for date values that are represented as `Date` objects.

The default Value Parser and Value Formatter use the ISO string format `'yyyy-mm-dd'`. If you wish to use a different date format, then you can [Override the Pre-Defined Cell Data Type Definition](#overriding-the-pre-defined-cell-data-type-definitions).

The following properties are set:
- The [Date Cell Editor](/provided-cell-editors/#date-cell-editor) is used for editing.
- For AG Grid Enterprise, `filterParams.valueFormatter` is set to format the values using the Value Formatter.

### Date as String

The `'dateString'` cell data type is used for date values that are represented as `string` values.

This data type uses the ISO string format `'yyyy-mm-dd'`. If you wish to use a different date format, then you can [Override the Pre-Defined Cell Data Type Definition](#overriding-the-pre-defined-cell-data-type-definitions).

The following properties are set:
- The [Date as String Cell Editor](/provided-cell-editors/#date-as-string-cell-editor) is used for editing.
- For AG Grid Community, the [Date Filter](/filter-text/) is used, and `filterParams.comparator` is set to parse the `string` date values.
- For AG Grid Enterprise, `filterParams.valueFormatter` is set to format the values using the Value Formatter.

### Object

The `'object'` cell data type is used for values that are complex objects (e.g. none of the above data types).

If you have different types of complex object, you will want to [Provide Custom Cell Data Types](#providing-custom-cell-data-types).

The default Value Parser and Value Formatter do not really do anything, as their behaviour needs to change based on the object structure. It is expected that you will [Override the Pre-Defined Cell Data Type Definition](#overriding-the-pre-defined-cell-data-type-definitions).

The following properties are set:
- `cellEditorParams.useFormatter = true` so that the cell editor uses the Value Formatter.
- A `comparator` is defined to allow [Custom Sorting](/row-sorting/#custom-sorting) using the Value Formatter.
- For AG Grid Community, a [Filter Value Getter](/value-getters/#filter-value-getters) is used to convert the value with the Value Formatter.
- For AG Grid Enterprise, `filterParams.valueFormatter` is set to format the values using the Value Formatter.

### Pre-Defined Cell Data Type Example

The [Enable Cell Data Types Example](#example-enable-cell-data-types) above demonstrates each of the different pre-defined cell data types with AG Grid Community.

The example below shows the same data types in AG Grid Enterprise:
- Row grouping is enabled allowing each of the fields to be grouped on.
- Import/Export features are enabled allowing the following:
    - Clipboard (copy/paste)
    - Fill handle
    - CSV/Excel export

<grid-example title='Pre-Defined Cell Data Types' name='pre-defined-cell-data-types' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "range", "rowgrouping", "excel", "clipboard", "setfilter"] }'></grid-example>

## Providing Custom Cell Data Types

Custom cell data types can be added by setting the grid option `dataTypeDefinitions`.

<api-documentation source='grid-options/properties.json' section='editing' names='["dataTypeDefinitions"]' ></api-documentation>

<snippet spaceBetweenProperties="true">
|const dataTypeDefinitions = {
|    percentage: {
|        extendsDataType: 'number',
|        baseDataType: 'number',
|        valueFormatter: params => params.value == null ? '' : `${Math.round(params.value * 100)}%`,
|    }
|}
</snippet>

Each custom data type definition must have a `baseDataType` of one of the six [Pre-Defined Cell Data Types](#pre-defined-cell-data-types), which represents the data type of the underlying cell values.

Data type definitions support inheritance via the `extendsDataType` property. Each custom cell data type must either extend one of the pre-defined types, or another custom type. Any non-overridden properties are inherited from the parent definition. To prevent inheriting properties from the parent definition, `suppressDefaultProperties = true` can be set on the definition.

[Column Types](/column-definitions/#custom-column-types) can be set via the `columnTypes` property to allow other column definition properties to be set for the data type. By default these will replace any column types against the parent definition. To allow these to be appended to the parent definition column types, `appendColumnTypes = true` can be set.

To allow [Inferring Cell Data Types](#inferring-cell-data-types) to work for custom types, the `dataTypeMatcher` property can be set. This returns `true` if the value is of the correct type. Note that the data type matchers will be called in the order they are provided in `dataTypeDefinitions` (for custom only), and then the pre-defined data type matchers will be called.

The following example demonstrates providing custom cell data types:
- The **Country** column contains complex objects and has a cell data type of `'country'`.
- The **Sport** column contains a different type of complex object and has a cell data type of `'sport'`.
- The `dataTypeMatcher` callback is defined for both cell data types to allow inferring the type.

<grid-example title='Providing Custom Cell Data Types' name='providing-custom-cell-data-types' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "range", "setfilter"] }'></grid-example>

## Overriding the Pre-Defined Cell Data Type Definitions

The default properties for the [Pre-Defined Cell Data Types](#pre-defined-cell-data-types) can be overridden if desired.

For example, this is required if a different date format is desired.

This works in the same way as when [Providing Custom Cell Data Types](#providing-custom-cell-data-types).

<snippet spaceBetweenProperties="true">
|const dataTypeDefinitions = {
|    // override `'date'` to handle custom date format `dd/mm/yyyy`
|    date: {
|        baseDataType: 'date',
|        extendsDataType: 'date',
|        valueParser: params => {
|           if (params.newValue == null) {
|               return null;
|           }
|           // convert from `dd/mm/yyyy`
|           const dateParts = params.newValue.split('/');
|           return dateParts.length === 3
|               ? new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]))
|               : null;
|        },
|        valueFormatter: params => {
            // convert to `dd/mm/yyyy`
|           return params.value == null ? '' : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear}`;
|        },
|    }
|}
</snippet>

The following example demonstrates overriding pre-defined cell data types:
- The **Date** column is of type `'dateString'` which has been overridden to use a different date format (`dd/mm/yyyy`).
- The data type definition for `'dateString'` provides a `dateParser` and `dateFormatter` as it is a [Date as String Data Type Definition](#date-as-string-data-type-definition).

<grid-example title='Overriding Pre-Defined Cell Data Types' name='overriding-pre-defined-cell-data-types' type='generated'></grid-example>
### Date as String Data Type Definition

If overriding `'dateString'` due to a different date format, then a couple of extra properties need to be set to handle conversion between `Date` objects and the desired `string` format.

<interface-documentation interfaceName='DateStringDataTypeDefinition' names='["dateParser", "dateFormatter"]' config='{"description":""}'></interface-documentation>
