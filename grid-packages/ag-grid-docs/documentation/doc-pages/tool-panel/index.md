---
title: "Tool Panels"
enterprise: true
---

This section covers Tool Panels, available via the grid's Side Bar, which allow for easy access to powerful grid operations such as grouping, pivoting, and filtering. Custom Tool Panels can also be provided to the grid.

## Overview

Tool Panels are panels that sit in the Side Bar to the right of the grid. The Side Bar allows access to the tool panels via buttons that work like tabs. The Side Bar and a Tool Panel are highlighted in the screenshot below.

<image-caption src="tool-panel/resources/sideBar.png" maxwidth="52rem" alt="Side Bar" constrained="true" centered="true"></image-caption>

## Provided Tool Panels

The grid provides the following Tool Panels:

- [Columns Tool Panel](/tool-panel-columns/) - to control aggregations, grouping and pivoting.
- [Filters Tool Panel](/tool-panel-filters/) - to perform multiple column filters.

## Custom Tool Panel Components

In addition to the provided Tool Panels, it is also possible to provide custom Tool Panels.

For more details refer to the section: [Custom Tool Panel Components](/component-tool-panel/).

## API

The `gridApi` has the following methods that can be used to interact with the tool panel.

<api-documentation source='grid-api/api.json' section='accessories' names='["openToolPanel","closeToolPanel","getOpenedToolPanel","isToolPanelShowing","refreshToolPanel", "getToolPanelInstance"]'></api-documentation>

## Events

The following events are emitted from the tool panel.

<api-documentation source='grid-events/events.json' section='accessories'></api-documentation>

## Next Up

Before covering the Tool Panels in detail, continue to the next section to learn about the [Side Bar](/side-bar/).
