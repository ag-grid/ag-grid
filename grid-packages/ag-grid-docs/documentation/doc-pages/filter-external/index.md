---
title: "External Filter"
---

External filtering allows you to mix your own filtering logic with the grid's inbuilt filtering, without creating column-based filter components.

[[warning]]
| This form of filtering is only compatible with the Client-Side Row Model, see [Row Models](/row-models/) for more details.

## Implementing External Filtering

The example below shows external filters in action. There are two methods on `gridOptions` you need to implement: `isExternalFilterPresent` and `doesExternalFilterPass`.

<api-documentation source='grid-options/properties.json' section='filter' names='["isExternalFilterPresent", "doesExternalFilterPass"]'></api-documentation>

### isExternalFilterPresent

`isExternalFilterPresent` is called exactly once every time the grid senses a filter change. It should return `true` if external filtering is active or `false` otherwise. If you return `true`, `doesExternalFilterPass` will be called while filtering, otherwise `doesExternalFilterPass` will not be called.

### doesExternalFilterPass
`doesExternalFilterPass` is called once for each row node in the grid. If you return `false`, the node will be excluded from the final set.


[[note]]
| If the external filter changes, you need to call `api.onFilterChanged()` to tell the grid.

## Example

The example below shows an external filter in action.

<grid-example title='External Filter' name='external-filter' type='generated' options='{ "enterprise": true, "exampleHeight": 565, "modules": ["clientside", "setfilter", "menu", "columnpanel"] }'></grid-example>

