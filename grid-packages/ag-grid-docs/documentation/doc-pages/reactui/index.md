---
title: "Rendering"
frameworks: ["react"]
---

<video-section id="oAQ5vavDupU" title="React Rendering" header="true">
When using AG Grid React, all of the grid's core rendering (headers, rows, cells etc) is rendered using React.
AG Grid React shares the same 'business logic layer' as the other AG Grid versions (Angular, Vue, or just JavaScript) frameworks. This means the features of AG Grid React are identical to the features in AG Grid's other framework flavours. However because the rendering is done 100% in React, the grid works as a native React Component.
</video-section>



The remainder of this page takes a deeper look at the grid's React rendering, including React Render Cycles and also React Developer Tools.

[[note]]
| Don't like our new React Rendering introduced in v27? You can turn it off with `suppressReactUi=true`. However we advise against this long term, as we plan to drop support for the old rendering engine in future versions.

## Show Me

The grid renders cells using React, and all parent components of the cells are also written in React, all the way back to the client application. This means all the UI from your application down to the cells, including any provided React Cell Renderers, is all 100% React.

The example below demonstrates AG Grid rendered 100% in React. Note the example has the Age column customised using a React Component.

<grid-example title='React UI' name='react-ui' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

See [Cell Renderers](/component-cell-renderer/) for full details on creating Cell Renderers.

## React Profile

You can profile the example above using the React Developer Tools and see the internals of AG Grid written in React.

If you want to profile (using React Developer Tools) the example above, do the following:
1. Open the example in Plunker.
1. From inside Plunker, open in a new tab.
1. Open React Developer Tools

[[note]]
| We do not advise using the React Developer Tools on the AG Grid website, or inside Plunker, as both the AG Grid website and Plunker are also written in React, which complicates the React Developer Tools.

As the grid is written in React, we welcome trashing it using React profiling tools for how well it plays alongside your application with regards component refresh and wasted render cycles.

<image-caption src="reactui/resources/react-dev-tools.png" alt="React Developer Tools" maxWidth="90%" constrained="true" centered="true"></image-caption>

## Using Cell Editors

Below is an example showing different types of React Cell Editors. Note the following:

* Edit any cell by double clicking the mouse.
* **Country** and **Athlete Columns** have default editors (not customised).
* **Gold Column** is using a **React Inline Cell Renderer**. The editing happens inside the cells.
* **Silver Column** is using a **React Popup Cell Renderer** (`cellEditorPopup=true`). The editing happens in a popup.

<grid-example title='React UI Editors' name='editors' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

See [Cell Editors](/component-cell-editor/) for full details on creating Cell Editors.


## Customising Headers

Below is an example showing a grid configured with a custom React Column Header component.

* Columns Athlete and Age use a Header Comp that displays the Header name and allows sorting (by clicking on the header).
* All other columns do not have their Headers customised and work as normal.


<grid-example title='React UI Headers' name='headers' type='react' options=' { "showImportsDropdown": false }'></grid-example>

See [Header Components](/component-header/) for full details on creating Header Components.

## No Wasted Renders

AG Grid does not cause unnecessary render cycles. The following example demonstrates this.

Below each Column is configured to use a Cell Renderer that prints into the Cell the number of times the Cell has had it's render method called. This tells us how many times the render method is called. For non wasted renders, the render method should only get called if it's contents change. Note that the number stays at '1' even if you do any of the following:
1. Move columns by dragging the headers. The Cell Renderer does not re-render despite the cell moving.
1. Create a Cell Range by dragging the mouse over some cells. The Cell Renderers do not re-render despite the cell UI background and border changing.

Clicking 'Increase Medals' will re-render the Cell Renderer's as the displayed value is updated.

Note that we memoise the Cell Renderer using `const RenderCounterCellRenderer = memo( (params) => {`.

<grid-example title='React UI Render Cycles' name='no-wasted-render' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

## Advanced Grid Features

The rendering of AG Grid is 100% React regardless of what grid features are used.

Below is an example with Range Selection, Checkbox Click Selection and Row Grouping.

<grid-example title='React UI Advanced Features' name='advanced-features' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

Below is an example using Master Detail. When the master grid is AG Grid React, then the detail grids also use AG Grid React. In the example both Master and Detail grids are using React Cell Renderers.

<grid-example title='React UI Master Detail' name='master-detail' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

## All Customisations Supported

Above we saw customising the grid Cells (Renderers and Editors) and Headers using React Components.
All of the other customisations allowed by AG Grid are also supported when `reactUi=true`.

The example below shows the following customisations:
1. Column Filters and Floating Filters.
1. Tool Panels.
1. Status Bar.
1. Overlays.
1. Tooltip.

<grid-example title='React UI All Customisations' name='all-customisations' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>
