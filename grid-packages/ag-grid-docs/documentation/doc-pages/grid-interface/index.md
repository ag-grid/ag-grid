---
title: "Grid Interface" 
---

This section details the public interface that your application can use to interact with the grid, including methods, properties and events.
 
The grid interface is the combination of the following items:
 
- [Grid Options](/grid-options/): properties and callbacks used to configure the grid.
- [Grid Events](/grid-events/): events published by the grid to inform applications of changes in state.
- [Grid API](/grid-api/): methods used to interact with the grid after it's created.
    
md-include:index-javascript.md
md-include:index-angular.md
md-include:index-react.md
md-include:index-vue.md

## Access the Grid API

md-include:api-javascript.md
md-include:api-angular.md
md-include:api-react.md
md-include:api-vue.md

## Events Are Asynchronous
 
Grid events are asynchronous so that the state of the grid will be settled by the time your event callback gets invoked.

## Default Boolean Properties

Where the property is a boolean (`true` or `false`), then `false` (or left blank) is the default value. For this reason, on / off items are presented in a way that causes the most common behaviour to be used when the value is `false`. For example, `suppressCellFocus` is named as such because most people will want cell focus to be enabled.

## Next Steps

 Complete references available: [options](/grid-options/), [methods](/grid-api/) and [events](/grid-events/).
