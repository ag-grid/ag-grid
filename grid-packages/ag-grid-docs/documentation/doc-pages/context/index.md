---
title: "Context"
---

This sections covers how shared contextual information can be passed around the grid.

## Overview

The context object is passed to all callbacks and events used in the grid. The purpose of the context object is to allow the client application to pass details to custom callbacks such as the [Cell Renderers](/cell-rendering/) and [Cell Editors](/cell-editing/).

<api-documentation source='grid-options/properties.json' section='miscellaneous' names='["context"]' ></api-documentation>

To update the context call `api.setGridOption` with the new context. Alternatively, if you maintain a reference to the context object it's values can be mutated directly. 

## Context Object Example

The example below demonstrates how the context object can be used. Note the following:

- Selecting the reporting currency from the dropdown places it in the context object.

- When the reporting currency is changed the cell renderer uses the currency supplied in the context object to calculate the value using: `params.context.reportingCurrency`.

- The price column header is updated to show the selected currency using a header value getter using `ctx.reportingCurrency`.

<grid-example title='Context Object' name='context' type='mixed'></grid-example>

