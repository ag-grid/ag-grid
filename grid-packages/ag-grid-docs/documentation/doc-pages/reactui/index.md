---
title: "React UI"
frameworks: ["react"]
---

The next generation of AG Grid React will have it's UI written purely in React. We are calling this project "React UI".

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

Notice in the example below the Age Column has a React Cell Renderer.

<grid-example title='React UI' name='react-ui' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

## Does React UI Use Portals?

No, React UI does not use React Portals.

Previous to React UI, when the rendering engine was written in Plain JavaScript, React Portals were used to host instances of provided Cell Renderer's and Cell Editors. This caused issues such as additional `span`'s appear in the DOM to host the portal, and also sometimes flickering or delayed rendering was visible.

<image-caption src="reactui/resources/no-portals.png" alt="React UI - No Portals" centered="true"></image-caption>

## Community vs Enterprise

React UI is covering both AG Grid Community and AG Grid Enterprise. Once complete, both Community and Enterprise
will be 100% React.

## What's Features are Lost?

No features are lost.

The rendering section of AG Grid is for rendering only. All the functionality with regards application (grid) logic is separated out from the UI, giving consistent behaviour regardless of whether React UI is used or not.

In other words, because of AG Grid's excellent modular design, all logic that is not UI specific is kept outside the rendering layer, thus allowing React UI to have all the functionality available in the Core AG Grid.

This is in line with React thinking, in that React is used for rendering only, and does not dictate how the rest of the app should work.

This also means the AG Grid React UI not only supports all features of the current AG Grid React, but also the interface into AG Grid React has not changed. All features are configured in the same way. All that will be needed in your application to test React UI is set the switch `reactUi=true`.

## Can JS Components Still Be Provided

Yes you can.

As before, you can provide components to customise the grid using React or Vanilla JavaScript. For example you can configure a Cell Renderer on a column using both `colDef.cellRenderer` for Vanilla JavaScript or `colDef.cellRendererFramework` for a React version.

The difference is behind the scenes in AG Grid. Without React UI, the grid used to create a React Portal to include the React Cell Renderer. With React ui, the React Cell Renderer is referenced directly.

The Vanilla JavaScript components are now the ones that are not native and need to be wrapped! However don't worry about that, that's all taken care of behind the scenes.

## What Does Not Work?

When `reactUi=true`, the mechanism of using React inside the old AG Grid rendering engine is turned off. This means React components provided to areas of the grid not yet using React UI will not work. For example if you have a customer Header Component written in React, it will currently not work when `reactUi=true`.

This is temporary while we implement React UI across all of AG Grid. Once complete, there will be no part using the old rendering engine and this issue will be no longer relevant.

## What Does the Spike Cover

The covered everything needed to prove that Cells would render using React.

## What is not covered

## What's Next

We are now charging ahead at completing the React UI work, that is replace all of the AG Grid UI with React.
Next on the list are the following:

1. Column Headers
1. Column Filters 
1. Tool Panels / Tab 