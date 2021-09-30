---
title: "React UI"
frameworks: ["react"]
---

Something great is happening, we are porting the UI of AG Grid to be written 100% in React. Up until now AG Grid React wrapped the JavaScript version of AG Grid. The next generation of AG Grid React will have it's UI written purely in React. We are codenaming this effort **React UI**.

Up until now AG Grid's core was written in Plain JavaScript using our in house rendering engine. All the frameworks,
including React, wrapped the core Plain JavaScript rendering engine.

The advantage of this was one grid for all frameworks, meaning all of our focus went into one excellent grid, rather than focusing on many grids (one for each framework).

The disadvantage of this for the React community was sometimes it didn't feel very "Reacty", as AG Grid was not a component written in React.

React UI is an evolution of how AG Grid uses the React framework. AG Grid React UI will not be a React wrapper around
our in house rendering engine. AG Grid React UI will have the **AG Grid UI ported to React**.

The latest AG Grid v26.0 has a large portion of the grid UI written in React, ready for you to get stuck into and tell us what you think.

<div style="margin-top: 30px; margin-bottom: 30px;">
    <image-caption src="reactui/resources/before-vs-after.svg" alt="AG Grid React UI Explained" centered="true"></image-caption>
</div>

## Show Me

To enable React UI in the latest AG Grid release, set the grid property `reactUi=true`.  You can do this in your own applications from v26 onwards.

With `reactUi=true`, the grid renders cells using React, and all parent components of the cells are also written in React, all the way back to the client application. This means all the UI from your application down to the cells, including any provided React Cell Renderers, is all now 100% React.

The example below demonstrates AG Grid with the core grid rendered using React.

<grid-example title='React UI' name='react-ui' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

All features you would expect in the grid, such as sorting and column moving, can be tested to work in this example. The React UI is built on top of the existing AG Grid services, thus all features carry across.

You may say _"Doesn't it look identical to before?"_, and you would be right, it is identical to before from an application users point of view. That's the point - it is supposed to work exactly as before. The difference is this time it is all rendered in React.

## React Profile

You can profile the example above using the React Developer Tools and see the internals of AG Grid written in React.

If you want to profile the example above, open it up in plunker, and then open it in a new tab from inside plunker (otherwise the profiler will profile our website or Plunker, both of which are written in React).

As the grid is now written in React, we welcome trashing it using React profiling tools for how well it plays alongside your application with regards component refresh and wasted render cycles.

<image-caption src="reactui/resources/react-dev-tools.png" alt="React Developer Tools" centered="true"></image-caption>

## Advanced Grid Features

All features of AG Grid work when `reactUi=true`, no exceptions.

Below is an example with Range Selection, Checkbox Click Selection and Row Grouping.

<grid-example title='React UI Advanced Features' name='advanced-features' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

Below is an example using Master Detail.

When the master grid has `reactUi=true` then the detail grids use React UI also. In the example both Master and Detail grids are using React Cell Renderers.

<grid-example title='React UI Master Detail' name='master-detail' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

## React UI and Portals?

AG Grid React UI does not use portals to host custom components (eg Cell Renderers).

Previous to React UI, when the rendering engine was written in Plain JavaScript, React Portals were used to host instances of provided components i.e. Cell Renderer's and Cell Editors etc. This caused issues such as additional `div`'s appear in the DOM to host the portal, and also sometimes flickering or delayed rendering was visible.

The image below shows the DOM structure of a grid cell the old way compare to the new way. Note the additional hosting
`div` element is gone when using React UI.

<image-caption src="reactui/resources/no-portals.png" alt="React UI - No Portals" centered="true"></image-caption>


## JS Components inside React UI

As before, you can provide components to customise the grid using React or Vanilla JavaScript. For example you can configure a Cell Renderer on a column using both `colDef.cellRenderer` for Vanilla JavaScript or `colDef.cellRendererFramework` for a React version.

The difference is behind the scenes in AG Grid. Before React UI, the grid used to create a React Portal to include the React Cell Renderer. Now with React UI, the React Cell Renderer is inserted directly.

The Vanilla JavaScript components are now the ones that are not native and need to be wrapped! However don't worry about that, that's all taken care of behind the scenes.

It was important for AG Grid to keep backwards compatibility and still allow native JavaScript custom components as some users of AG Grid prefer providing reusable components in plain JavaScript. This is often done by large organisation, e.g. banks, who have 100's of projects using AG Grid mixed with React, Angular and Vue, and want to provide common components that work regardless of the framework used.

## Using Cell Editors

When React UI is enabled, the grid will work natively with provided React Cell Editors.

Below is an example showing different types of Cell Editors and also mixing React and JavaScript for the provided editors. Note the following:

* Column *JS Inline* uses JavaScript Cell Editor.
* Column *JS Popup* uses JavaScript Cell Editor in a popup (`cellEditorPopup=true`).
* Column *React Inline* is a provided React Cell Renderer.
* Column *React Popup* s a provided React Cell Renderer in a popup (`cellEditorPopup=true`).
* Both popup editors are also configured to below the cell (`cellEditorPopupPosition=true`).

<grid-example title='React UI Editors' name='editors' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

See [Cell Editors](/component-cell-editor/) for full details on creating Cell Editors.

## Customising Headers

When React UI is enabled, the grid will work natively with custom React Column Header components.

Below is an example showing a grid configured with a custom React Column Header component.

* Columns Athlete and Age use a Header Comp that displays the Header name and allows sorting (by clicking on the header).
* All other columns do not have their Headers customised and work as normal.


<grid-example title='React UI Headers' name='headers' type='react' options=' { "showImportsDropdown": false }'></grid-example>

See [Header Components](/component-header/) for full details on creating Header Components.

## No Wasted Renders

Before AG Grid React UI, it was tricky to manage wasted React renders, as the grid wasn't participating as part of the React application. Now that the grid is written in React, it participates fully in the React rendering..

Below each Column is configured to use a Cell Renderer that prints into the Cell the number of times the Cell has had it's render method called. This tells us how many times the render method is called. For non wasted renders, the render method should only get called if it's contents change. Note that the number stays at '1' even if you do any of the following:
1. Move columns by dragging the headers. The Cell Renderer does not re-render despite the cell moving.
1. Create a Cell Range by dragging the mouse over some cells. The Cell Renderers do not re-render despite the cell UI background and border changing.

Clicking 'Increase Medals' will re-render the Cell Renderer's as the displayed value is updated.

Note that we memoise the Cell Renderer using `const RenderCounterCellRenderer = memo( (params) => {`.

<grid-example title='React UI Render Cycles' name='no-wasted-render' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

The example below demonstrates how the Cell Renderer gets re-rendered when we do not memoise the Cell Renderer.

Both examples are identical with the exception of above uses memo, below does not use memo.

Note below how moving columns and range selection does get the cell to needlessly re-render.

<grid-example title='React UI Render Cycles' name='wasted-render' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

## Good Breaking Changes

There are some good breaking changes, to do with stuff we could shake off, now that we are no longer wrapping React. These good breaking changes are listed below. They are all niche areas of the grid - if you don't recognise what they are talking about, then you are probably not using them and can just ignore. The list is:

1. When providing components (Cell Renderer etc), it was possible to provide CSS Classes to the hosting DOM element with the callback `getReactContainerClasses()`. This method is no longer needed as there is no longer a hosting DOM element. The hosting DOM element was baggage.
1. Before to get a reference to an active React Cell Renderer, after calling `gridApi.getCellRendererInstances()` you need to call `getFrameworkComponentInstance()` on the component. You now no longer need to call `getFrameworkComponentInstance()`. This is because there is no longer a JavaScript Cell Renderer wrapping the React Cell Renderer. This method used to be on the wrapper which then returned back the wrapped React Cell Renderer (or a reference to the imperative handle if using React Hooks). The same is true for accessing Cell Editors, in that `getFrameworkComponentInstance()` is no longer needed here either.
1. Before when providing a Popup Cell Editor, the Cell Editor could implement the methods `isPopup()` and `popupPosition()` to have the Cell Editor in a popup and to optionally state it's position. In the React paradigm, it's required to know where a component is to be placed before it is created (which is not a constraint with our internal AG Grid rendering engine, where components can be created first and placed into the DOM second). To solve this, the Column Definition now has properties `cellEditorPopup` and `cellEditorPopupPosition` which should be used.


## What Grid Features are Lost?

No features are lost.

The rendering section of AG Grid is for rendering only. All the functionality with regards application (grid) logic is separated out from the UI, giving consistent behaviour regardless of whether React UI is used or not.

In other words, because of AG Grid's excellent modular design, all logic that is not UI specific is kept outside the rendering layer, thus allowing React UI to have all the functionality available in the Core AG Grid.

This is in line with React thinking, in that React is used for rendering only, and does not dictate how the rest of the app should work.

This also means the AG Grid React UI not only supports all features of the current AG Grid React, but also the interface into AG Grid React has not changed. All features are configured in the same way. All that will be needed in your application to test React UI is set the switch `reactUi=true`.


## How Much of AG Grid is now React UI?

The work covers the core grid, rows and cells. This means if you provide Cell Renderers and Cell Editors, they will live inside the same React Context as your application.

The following areas are yet to be completed. All of these areas use the old rendering engine alongside the new React UI:
1. Column Filters and Floating Filters.
1. Tool Panels.
1. Status Bar.
1. Overlays.
1. Custom Tooltip.


When `reactUi=true`, the mechanism of using React inside the old AG Grid rendering engine is turned off. This means React components provided to areas of the grid not yet using React UI will not work. For example if you have a custom Header Component written in React, it will currently not work when `reactUi=true`.

This is temporary while we implement React UI across all of AG Grid. Once complete, there will be no part using the old rendering engine and this issue will be no longer relevant.

## Community vs Enterprise

React UI is covering both AG Grid Community and AG Grid Enterprise. Once complete, both Community and Enterprise
will be 100% React.

## What's Next for React UI

We are now charging ahead at completing the React UI work. That means going through the list in the previous section and converting everything to React UI.

Once all parts of AG Grid are fully working with React UI we will make React UI the default with a property to go back to the old way of rendering. After some time the old way will be deprecated and then after some more time it will be removed.


## How Long Will It Take

We have spent six months getting this far. We feel most of the hard work has been done. We estimate a fully working version of AG Grid supporting React Rendering in Q4 of this year, in time for Christmas.

## Can I use React UI In Production Now?

This is brand new, so there may be some teething problems. However if you are happy with what you see, then yes you can use it in production. It is part of AG Grid and is covered by the same SLA, which means we will endeavour to fix all bugs and help via the same support channels.
