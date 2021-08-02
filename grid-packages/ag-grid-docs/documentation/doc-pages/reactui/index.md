---
title: "React UI"
frameworks: ["react"]
---

Do you know what the one thing most React developers wish was different with AG Grid? Above anything else, React developers wish AG Grid was written in React!!

We have been working very had to make this wish come true and are delighted to announce the next generation of AG Grid React will have it's UI written purely in React. We are codenaming this effort *React UI*.

Let me tell you what *React UI* is...


## What is React UI

Up until now, AG Grid's core was written in Plain JavaScript using our in house rendering engine. All the frameworks,
including React, wrapped the core Plain JavaScript rendering engine.

The advantage of this was one grid for all frameworks, meaning all of our focus went into one excellent grid, rather than focusing on many grids (one for each framework).

The disadvantage of this was sometimes it didn't feel very "Reacty", as AG Grid was not a component written in React.

React UI is an evolution of how AG Grid uses the React framework. AG Grid React UI will not be a React wrapper around
our in house rendering engine. AG Grid React UI will have the entire AG Grid UI ported to React.

<image-caption src="reactui/resources/before-vs-after.svg" alt="AG Grid React UI Explained" centered="true"></image-caption>

## Show Me...

A spike of our React UI is included in the latest AG Grid release. To enable it, set the grid property `reactUi=true`. Below is an example of the new React UI.

With `reactUi=true`, the grid renders cells using React, and all parent components of the cells are also written in React, all the way back to the client application. This means all the UI from your application down to the cells, including any provided React Cell Renderers, is all now 100% React.

<grid-example title='React UI' name='react-ui' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

Notice in the example:
1. The Age Column has a React Cell Renderer.
2. Grid functions such as sort, filter, range select and row grouping work as normal.

You may say _"Doesn't it look identical to before?"_, and you would be right, it is identical to before from an application users point of view. That's the point - it is supposed to work exactly as before. The difference is this time it is all done in React.

## Can I Try?

Yes. Set the `reactUi` property in your AG Grid application using the latest AG Grid version and check it out.

## Does React UI Use Portals?

No, React UI does not use React Portals.

Previous to React UI, when the rendering engine was written in Plain JavaScript, React Portals were used to host instances of provided Cell Renderer's and Cell Editors. This caused issues such as additional `div`'s appear in the DOM to host the portal, and also sometimes flickering or delayed rendering was visible.

The image below shows the DOM structure of a grid cell the old way compare to the new way. Note the additional hosting
`div` element is gone when using React UI.

<image-caption src="reactui/resources/no-portals.png" alt="React UI - No Portals" centered="true"></image-caption>

## Can I React Profile AG Grid?

Oh yes you can!

As the grid is now written in React, we welcome trashing it using React profiling tools for how well it plays alongside your application with regards component refresh and wasted render cycles.

<image-caption src="reactui/resources/react-dev-tools.png" alt="React Developer Tools" centered="true"></image-caption>



## Community vs Enterprise

React UI is covering both AG Grid Community and AG Grid Enterprise. Once complete, both Community and Enterprise
will be 100% React.

## What Grid Features are Lost?

No features are lost.

The rendering section of AG Grid is for rendering only. All the functionality with regards application (grid) logic is separated out from the UI, giving consistent behaviour regardless of whether React UI is used or not.

In other words, because of AG Grid's excellent modular design, all logic that is not UI specific is kept outside the rendering layer, thus allowing React UI to have all the functionality available in the Core AG Grid.

This is in line with React thinking, in that React is used for rendering only, and does not dictate how the rest of the app should work.

This also means the AG Grid React UI not only supports all features of the current AG Grid React, but also the interface into AG Grid React has not changed. All features are configured in the same way. All that will be needed in your application to test React UI is set the switch `reactUi=true`.

## Hooks or Classes?

Both.

AG Grid React UI works with client applications written using React Hooks or React Classes.

AG Grid React UI can also take custom components as Hooks or Classes.

The requirements and interface into AG Grid does not change.

## Can JS Components Still Be Provided

Yes you can.

As before, you can provide components to customise the grid using React or Vanilla JavaScript. For example you can configure a Cell Renderer on a column using both `colDef.cellRenderer` for Vanilla JavaScript or `colDef.cellRendererFramework` for a React version.

The difference is behind the scenes in AG Grid. Without React UI, the grid used to create a React Portal to include the React Cell Renderer. With React ui, the React Cell Renderer is referenced directly.

The Vanilla JavaScript components are now the ones that are not native and need to be wrapped! However don't worry about that, that's all taken care of behind the scenes.

## What Does Not Work?

When `reactUi=true`, the mechanism of using React inside the old AG Grid rendering engine is turned off. This means React components provided to areas of the grid not yet using React UI will not work. For example if you have a custom Header Component written in React, it will currently not work when `reactUi=true`.

This is temporary while we implement React UI across all of AG Grid. Once complete, there will be no part using the old rendering engine and this issue will be no longer relevant.

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

## What's Next

We are now charging ahead at completing the React UI work. That means going through the list in the previous section and converting everything to React UI.

Once all parts of AG Grid are fully working with React UI we will make React UI the default with a property to go back to the old way of rendering. After some time the old way will be deprecated and then after some more time it will be removed.


## How Long Will It Take

We have spent six months getting this far. We feel most of the hard work has been done. We estimate a fully working version of AG Grid supporting React Rendering in Q4 of this year, in time for Christmas.

## Can I use React Next In Production Now?

Yes you can.

The drawback is you cannot use React Components in the sections we have not yet completed React UI for.
