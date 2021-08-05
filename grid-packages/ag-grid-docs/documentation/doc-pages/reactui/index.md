---
title: "React UI"
frameworks: ["react"]
---

Do you know what the one thing most React developers wish was different with AG Grid? Above anything else, React developers wish AG Grid was written in React!!

We have been working very had to make this wish come true and are delighted to announce the next generation of AG Grid React will have it's UI written purely in React. We are codenaming this effort *React UI*.

Let me explain...

## What is React UI

Up until now, AG Grid's core was written in Plain JavaScript using our in house rendering engine. All the frameworks,
including React, wrapped the core Plain JavaScript rendering engine.

The advantage of this was one grid for all frameworks, meaning all of our focus went into one excellent grid, rather than focusing on many grids (one for each framework).

The disadvantage of this was sometimes it didn't feel very "Reacty", as AG Grid was not a component written in React.

React UI is an evolution of how AG Grid uses the React framework. AG Grid React UI will not be a React wrapper around
our in house rendering engine. AG Grid React UI will have the entire AG Grid UI ported to React.

<image-caption src="reactui/resources/before-vs-after.svg" alt="AG Grid React UI Explained" centered="true"></image-caption>

## Show Me

A spike of our React UI is included in the latest AG Grid release. To enable it, set the grid property `reactUi=true`. Below is an example of the new React UI.

With `reactUi=true`, the grid renders cells using React, and all parent components of the cells are also written in React, all the way back to the client application. This means all the UI from your application down to the cells, including any provided React Cell Renderers, is all now 100% React.

In the example the Age Column has a React Cell Renderer. If you inspect the DOM on this cell, you will note the Cell Renderer is placed directly inside the cell (before an extra 'react-wrapper' div was placed, a side effect of using a React component inside a non-React parent - this is not not needed).

The example also demonstrates other grid features, such as row sorting by clicking the headers with the rows moving smoothly to the new locations. The React UI is built on top of the existing AG Grid services, thus all features carry across.

You may say _"Doesn't it look identical to before?"_, and you would be right, it is identical to before from an application users point of view. That's the point - it is supposed to work exactly as before. The difference is this time it is all rendered in React.

<grid-example title='React UI' name='react-ui' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

## Can I Try In My App?

Yes.

Set the `reactUi=true` property in your AG Grid application using the latest AG Grid version and check it out.


## Does It Work With Hooks Or Classes?

It works with both.

AG Grid React UI works with client applications written using React Hooks or React Classes.

AG Grid React UI can also take custom components as Hooks or Classes.

The requirements and interface into AG Grid does not change.

## Does React UI Use Portals?

No.

Previous to React UI, when the rendering engine was written in Plain JavaScript, React Portals were used to host instances of provided Cell Renderer's and Cell Editors. This caused issues such as additional `div`'s appear in the DOM to host the portal, and also sometimes flickering or delayed rendering was visible.

The image below shows the DOM structure of a grid cell the old way compare to the new way. Note the additional hosting
`div` element is gone when using React UI.

<image-caption src="reactui/resources/no-portals.png" alt="React UI - No Portals" centered="true"></image-caption>


## Can JS Components Still Be Provided

Yes.

As before, you can provide components to customise the grid using React or Vanilla JavaScript. For example you can configure a Cell Renderer on a column using both `colDef.cellRenderer` for Vanilla JavaScript or `colDef.cellRendererFramework` for a React version.

The difference is behind the scenes in AG Grid. Before React UI, the grid used to create a React Portal to include the React Cell Renderer. Now with React UI, the React Cell Renderer is inserted directly.

The Vanilla JavaScript components are now the ones that are not native and need to be wrapped! However don't worry about that, that's all taken care of behind the scenes.

It was important for AG Grid to keep backwards compatibility and still allow native JavaScript custom components as some users of AG Grid prefer providing reusable components in plain JavaScript. This is often done by large organisation, e.g. banks, who have 100's of projects using AG Grid mixed with React, Angular and Vue, and want to provide common components that work regardless of the framework used.

## Show Me An Example Using Cell Editors

When React UI is enabled, the grid will work natively with provided React Cell Editors, as well as keeping backwards compatibility and support JavaScript Cell Editors.

Below is an example showing different types of Cell Editors. Note the following:

* Column *JS Inline* uses the default Cell Editor, which happens to be written in JavaScript and is not a popup.
* Column *JS Popup* uses the default Rich Select Cell Editor, which happens to be written in JavaScript and is a popup (`cellEditorPopup=true`).
* Column *React Inline* is a provided React Cell Renderer and is inline.
* Column *React Popup* is the same provided React Cell Renderer as the previous column, but it's configured to be in a popup (`cellEditorPopup=true`) and to appear below the cell (`cellEditorPopupPosition=true`).
* Note if you inspect the DOM for *React Inline* editor, the editor is placed directly inside the cell without any wrapping DIV element.

<grid-example title='React UI Editors' name='editors' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

## Can I React Profile AG Grid?

Yes.

As the grid is now written in React, we welcome trashing it using React profiling tools for how well it plays alongside your application with regards component refresh and wasted render cycles.

See below viewing the React Component hierarchy using React Developer Tools. The grid is now part of the overall React component hierarchy.

<image-caption src="reactui/resources/react-dev-tools.png" alt="React Developer Tools" centered="true"></image-caption>

## Show Me No Wasted Renders

Below demonstrates no wasted React Render Cycles.

Each Column is configured to use a Cell Renderer that prints into the Cell the number of times the Cell has had it's render method called. Note that the number stays at '1' even while the Cells are moved around using Row Sorting (click a Header) or Column Reordering (drag a Header).

When the contents of a Cell changes, by pressing the button Increase Some Medals, then only the cells that have had their values changed have the render method called.

To properly achieve this, note that the Cell Renderer is memoized using `React.memo(RenderCounterCellRenderer)`.

To observe what happens when the Cell Renderer is not memoized, toggle using the button Toggle Memo. When the Cell Renderer is not memoized, then any small change to the DOM cell (eg changing the background color) results in the Cell Renderer getting recalled, even though there is no change to the value to get rendered.

<grid-example title='React UI Render Cycles' name='wasted-render' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

## Show Me Advanced Features Working

Remember we said all features of AG Grid will work with React UI? Here is an example with Range Selection, Checkbox Click Selection and Row Grouping.

Notice that the Cell Renderer for Sport is using inside the Grouping Column.

<grid-example title='React UI Advanced Features' name='advanced-features' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>


## Any Small Print?

There are some good breaking changes, to do with stuff we could shake off, now that we are no longer wrapping React. These good breaking changes are listed below. They are all niche areas of the grid - if you don't recognise what they are talking about, then you are probably not using them and can just ignore. The list is:

1. When providing components (Cell Renderer etc), it was possible to provide CSS Classes to the hosting DOM element with the callback `getReactContainerClasses()`. This method is no longer needed as there is no longer a hosting DOM element. The hosting DOM element was baggage.
1. Before to get a reference to an active React Cell Renderer the following code would be called: `gridApi.getCellRenderer().getFrameworkComponentInstance()`. Now you only need to call `gridApi.getCellRenderer()`. The reason why you no longer need to call `getFrameworkComponentInstance` is that there is no longer a wrapper wrapping the React Cell Renderer. This method used to be on the wrapper which then returned back the wrapped React Cell Renderer (or a reference to the imperative handle if using React Hooks). The same is true for `getCellEditor()`, in that `getFrameworkComponentInstance` is no longer needed here either.
1. Before when providing a Popup Cell Editor, the Cell Editor could implement the methods `isPopup()` and `popupPosition()` to have the Cell Editor in a popup and to optionally state it's position. In the React paradigm, it's required to know where a component is to be placed before it is created (which is not a constraint with our internal AG Grid rendering engine, where components can be created first and placed into the DOM second). To solve this, the Column Definition now has properties `cellEditorPopup()` and `cellEditorPopupPosition()` which should be used.

## Community vs Enterprise

React UI is covering both AG Grid Community and AG Grid Enterprise. Once complete, both Community and Enterprise
will be 100% React.

## What Grid Features are Lost?

No features are lost.

The rendering section of AG Grid is for rendering only. All the functionality with regards application (grid) logic is separated out from the UI, giving consistent behaviour regardless of whether React UI is used or not.

In other words, because of AG Grid's excellent modular design, all logic that is not UI specific is kept outside the rendering layer, thus allowing React UI to have all the functionality available in the Core AG Grid.

This is in line with React thinking, in that React is used for rendering only, and does not dictate how the rest of the app should work.

This also means the AG Grid React UI not only supports all features of the current AG Grid React, but also the interface into AG Grid React has not changed. All features are configured in the same way. All that will be needed in your application to test React UI is set the switch `reactUi=true`.


## What Does the Spike Cover

The spike covers everything needed to allow cells to be customised using React components. That means full support for Cell Renders and Cell Editors.

## What is not covered

The following areas are yet to be completed:
1. Master Detail - Detail Grids
1. Column Headers and Header Groups.
1. Column Filters and Floating Filters.
1. Tool Panels.
1. Status Bar.
1. Overlays.
1. Custom Tooltip.

All of these areas use the old rendering engine alongside the new React UI. This means the grid still fully works, you just won't be able to customise these parts of AG Grid using React when `reactUi=true`.

## Does Anything Break?

When `reactUi=true`, the mechanism of using React inside the old AG Grid rendering engine is turned off. This means React components provided to areas of the grid not yet using React UI will not work. For example if you have a custom Header Component written in React, it will currently not work when `reactUi=true`.

This is temporary while we implement React UI across all of AG Grid. Once complete, there will be no part using the old rendering engine and this issue will be no longer relevant.

## What's Next for React UI

We are now charging ahead at completing the React UI work. That means going through the list in the previous section and converting everything to React UI.

Once all parts of AG Grid are fully working with React UI we will make React UI the default with a property to go back to the old way of rendering. After some time the old way will be deprecated and then after some more time it will be removed.


## How Long Will It Take

We have spent six months getting this far. We feel most of the hard work has been done. We estimate a fully working version of AG Grid supporting React Rendering in Q4 of this year, in time for Christmas.

## Can I use React Next In Production Now?

Yes you can. Let us know if you find any issues :)

