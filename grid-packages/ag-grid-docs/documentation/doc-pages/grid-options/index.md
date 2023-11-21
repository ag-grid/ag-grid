---
title: "Grid Options"
---

All of these grid options are available through the generic `GridOptions<TData>` interface.

`TData` can optionally be used to represent the shape of the row data and is explained further under [Typescript Generics](/typescript-generics).

<framework-specific-section frameworks="react">
|Properties can be updated via property bindings unless they are marked as `Initial`.
</framework-specific-section>

<framework-specific-section frameworks="angular,vue">
|Unless they are marked as `Initial`, properties can be updated via property bindings, or by using one of the API functions [setGridOption](/grid-api/#reference-gridOptions-setGridOption) or [updateGridOptions](/grid-api/#reference-gridOptions-updateGridOptions).
</framework-specific-section>

<framework-specific-section frameworks="javascript">
|Properties can be updated via one of the API functions [setGridOption](/grid-api/#reference-gridOptions-setGridOption) or [updateGridOptions](/grid-api/#reference-gridOptions-updateGridOptions), unless they are marked as `Initial`.
</framework-specific-section>

<api-documentation source='properties.json' ></api-documentation>