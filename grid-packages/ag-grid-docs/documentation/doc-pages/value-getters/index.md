---
title: "Value Getters"
---

Normally columns are configured with `field` attributes, so the column knows what field to take values from in the data. Instead of providing `field` it is possible to provide a `valueGetter` instead. A Value Getter is a function that gets called allowing values to be pulled from literally anywhere, including executing any expressions you wish along the way.

You should use `colDef.field` most of the time. Use value getters when retrieving the data requires more logic, including executing your own expressions (similar to what a spreadsheet would do).

<api-documentation source='column-properties/properties.json' section="columns" names='["valueGetter"]'></api-documentation>


```ts
// example value getter, adds two fields together
colDef.valueGetter = params => {
    return params.data.firstName + params.data.lastName;
}
```

[[note]]
| All valueGetters must be pure functions. That means, given the same state of your
| data, it should consistently return the same result. This is important as the grid will only call your
| valueGetter once during a redraw, even though the value may be used multiple times. For example, the
| value will be used to display the cell value, however it can additionally be used to provide values
| to an aggregation function when grouping, or can be used as input to another valueGetter via the
| `params.getValue()` function.


### Example Value Getters

The example below demonstrates `valueGetter`. The following can be noted from the demo:

- Columns A and B are simple columns using `field`

- Value Getters are used in all subsequent columns as follows:
    - Column '#' prints the row number, taken from the [Row Node](/row-object/).
    - Column 'A+B' adds A and B.
    - Column 'A * 1000' multiplies A by 1000.
    - Column 'B * 137' multiplies B by 137.
    - Column 'Random' doesn't take any value from the data, rather it returns a random value.
    - Column 'Chain' takes the value 'A+B' and works on it further, thus chaining value getters.
    - Column 'Const' returns back the same value for each column.

<grid-example title='Value Getters' name='value-getters' type='generated'></grid-example>

### Header Value Getters

Use `headerValueGetter` instead of `colDef.headerName` to allow dynamic header names.

<api-documentation source='column-properties/properties.json' section="header" names='["headerValueGetter"]' ></api-documentation>

The parameters for `headerValueGetter` differ from standard `valueGetter` as follows:

- Only one of column or columnGroup will be present, depending on whether it's a column or a column group.
- Parameter `location` allows you to have different column names depending on where the column is appearing, eg you might want to have a different name when the column is in the column drop zone or the toolbar.

See the [Column Tool Panel Example](/tool-panel-columns/#column-tool-panel-example) for an example of `headerValueGetter` used in different locations, where you can change the header name depending on where the name appears.

### Filter Value Getters

See [Filter Values](/filtering/#filter-values) for more information on Filter Value Getters.

<api-documentation source='column-properties/properties.json' section="filtering" names='["filterValueGetter"]' ></api-documentation>

## Value Cache

The value cache is used for the results of value getters. If you are not using value getters, then you do not need the value cache.

Each time the grid requires a value from a value getter, the value getter is executed. For most use cases, this will not be an issue, as value getters will execute quickly and not have any noticeable performance implications for your application. However sometimes you might implement time-intensive tasks in your value getters. If this is the case, then you can opt to turn on the value cache to store the results of the value getters.

When the value cache is turned on, each time a value getter is executed, its result is stored in the value cache. If the data in the grid has not changed since the last time the value getter was used, then the value is retrieved from the cache instead of executing the value getter again.

This value cache is for advanced users who have time-consuming value getters and want to speed up their applications by introducing a cache to reduce the number of times value getters get executed.

[[note]]
| One client of AG Grid had 1,000 rows and 20 columns in a grid. A lot of the columns were doing advanced
| maths, using third-party maths API in the valueGetter for 8 of the columns. The client was also grouping
| and the summing by the columns containing the value getters. This meant, if more rows were added, the grid
| recomputed the aggregations, resulting in all the value getters getting called again, causing the grid to
| stall for around 1,000ms as rows were added.
| <br/><br/>
| Introducing the value cache meant the value getters were execute once when the initial data was loaded, so
| the 1,000ms happened once. Then when delta changes came in, the value getters were only executed on the
| new records, giving an almost seamless experience to the user.

### Example: Value Cache


Below shows a grid demonstrating the value cache. The column on the right has a value getter
that has a `console.log()` statement. This will allow us to see exactly when the value getter is called. So it is best to open this example in a new tab and open up the development console. From the example, the following can be noted:

- When the grid is initially loaded, the **value getter is called over 100 times**. This is for the following reasons:
    - The aggregation requires each value for the group total.
    - The DOM requires each value that is displayed (because of scrolling, not all are displayed)
- As you **scroll up and down** the grid, the value getters are executed, as the DOM needs values for rendering.
- As you **open and close groups**, the value getters are executed, as the DOM needs values for rendering.
- Now turn the value cache **on** by selecting the radio button at the top. The grid gets reset and then works with the value cache on. Notice in the console that the value getter gets executed exactly 100 times, once for each row. Even through the value getter result is used in two places (aggregation and rendering the row), the value getter is only called once. Even scrolling and opening / closing the groups does not result in the value getter getting executed again.

<grid-example title='Value Cache' name='value-cache' type='typescript' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"]  }'></grid-example>

[[note]]
| Note that the example still works fast when the value cache is turned off. This emphasises you don't need to turn the value cache on if your application is not getting slowed down by your value getters.

### Value Cache Properties

The following are the grid properties related to the value cache.

<api-documentation source='grid-options/properties.json' section="miscellaneous" names='["valueCache", "valueCacheNeverExpires"]'></api-documentation>

### Expiring the Value Cache

The value cache starts empty. Then as value getters execute, their results are stored and the value cache fills up. Certain events trigger the value cache to be emptied. This is called expiring the value cache. Once expired, every value getter will get executed again next time the value is needed. The events that cause the value cache to expire are the following:

- New row data is set into the grid via `setRowData(newData)` API or changing the `rowData` framework bound property*.
- New columns are set into the grid via `setColumnDefs()` API or changing the `columnDefs` framework bound property*.
- Data is modified using the `rowNode.setData(data)` or `rowNode.setDataValue(col,value)` node API methods.
- A value is modified in the grid using the grid's UI editing feature, e.g. the user double clicks a cell and enters a new value.
- The `expireValueCache()` grid API method gets called by the application.

[[note]]
| \* Assuming your framework allows binding properties and this is what you are using.

### Example: Expiring through Editing

The first example above didn't have any editing, so there was no concern for expiring the value cache. This example introduces grid editing. The example differs from the last in the following ways:

- Value Cache is on.
- Editing is enabled.
- There are only 10 rows, so it's easier to count the number of cells.
- There is another column **'Total x10'** which also uses a value getter and references the original **'Total'** column, thus calling this value getter results in an additional call to the original value getter.

As before, we focus on the value getter of the **'Total'** column and can see how many times it gets called via the console. The following can be noted:

- The values in the **Total** column are used many times as follows:
    - For inserting the value into the DOM (i.e. what's visible in the cell).
    - For calculating the group total for the total column (ie the figure 87,040 is a sum of the 5 values below it).
    - For calculating the **'Total x 10'** column, as that value getter also references the values in the **'Total'** column.
- Despite the values getting used multiple times, each value getter is executed exactly once. This can be observed by opening the development console and observing the log message the value getter prints.
- If you close and then re-open a group, the value getters are not re-executed, even though the values are needed to re-create the DOM elements that represent the cells.
- Hitting **'Refresh Cells'** will refresh all the cells, but again the value getters will not get re-executed.
- Hitting **'Invalidate Cache'** and then **'Refresh Cells'** will result in the value getters getting re-executed, as the cell refresh operation requires the values and the cache was invalidated. You will notice invalidating and then refreshing doesn't do anything noticeable to the grid, the data is the same, the only hint that anything happened is the value getter's console messages.
- Changing any value in the grid, either editing via the UI directly or hitting the **'Change One Value'** button, will result in the value cache getting cleared and all cells getting refreshed (where [change detection](/change-detection/) then updates any changes cells and only changed cells).

<grid-example title='Expiring Cache through Editing' name='expiring-through-editing' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"]  }'></grid-example>

[[note]]
| It is not possible to partially invalidate the cache, eg it is not possible to invalidate only a
| portion of the cells. You might think that if you update a cell, then you only need to invalidate
| that row's data as the value getters can only access that row. That is not true - a value getter
| is a function where you can take data from anywhere in the grid and the grid is none the wiser.
| So if you change any value, then every single value getter is potentially impacted as far as the grid
| is concerned so the whole value cache is invalidated.

### Setting to Never Expire

Above details how the cache operates under normal operations. In essence, the value cache gets expired whenever the grid is aware of a change to the underlying data. This strategy is the default strategy for the cache. If you want to **persist the cache** when data updates, then set the grid property `valueCacheNeverExpires=true`.

If you have `valueCacheNeverExpires=true`, then the only event that will expire the value cache will be the `api.expireValueCache()` method. Use this if your data is changing, but you don't want to execute value getters again, or you want to control exactly when the value cache is expired.

### Example: Never Expire

This example is again almost identical to the example above. The difference here is the value cache is turned on but
to never invalidate. Note the following:

- When the grid initialises, there are 10 value getter calls. The values are getting cached.<p/>

- After you edit a cell, either through the UI or through the API by pressing **'Update One Value'**,
  the value getters are not called again, so the **Total** and **Total x 10** columns are not correctly refreshed.
  The grid already executed the value getters for this column, it will not do it again,
  it will instead take values from the value cache.<p/>

- To get the total column to update after edits, press **'Expire Value Cache'**
  (calls grid API `expireValueCache()`) and then press **'Aggregate Data & Refresh Cells'**
  (calls grid API `refreshClientSideRowModel('aggregate')` followed by grid API `refreshCells()`).

  The call `refreshClientSideRowModel('aggregate')` is required as aggregations use Value Getters,
  thus the aggregations at group level (that is the two total column at the two group rows) need aggregation
  to be re-run for their values to be updated.

  The call `refreshCells()` is required to update the UI, which
  in turn also calls Value Getters.


<grid-example title='Never expire Value change' name='never-expire' type='generated' options='{ "enterprise": true, "exampleHeight": 610, "modules": ["clientside", "rowgrouping"] }'></grid-example>
