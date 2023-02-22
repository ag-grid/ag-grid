---
title: "Cell Content"
---

Cell content with regards how values are provided into the cells. There are different aspects of the grid that assist this.

The different parts of the grid concerned with cell values are as follows:

- [Value Getter](/value-getters/): Instead of specifying `colDef.field`, you can use `colDef.valueGetter` to provide a function for getting cell values. This is more flexible than providing field values for specific cells.
- [Value Formatters](/value-formatters/): Use formatters to format values.
- [Expressions](/cell-expressions/): Use strings instead of functions for value getters and formatters.
- [Reference Data](/reference-data/): Reference data is used to display alternative values to what is in your data, eg your data could be 'USA' but you want to display 'America' instead.

## Rendering Flow

It is helpful to understand how value getters, formatters and cell renderers work together to  provide the end result.

<image-caption src="cell-content/resources/valueGetterFlow.svg" alt="Value Getter Flow" width="46rem" centered="true"></image-caption>
