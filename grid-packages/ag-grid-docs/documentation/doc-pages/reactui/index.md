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

<grid-example title='React UI' name='react-ui' type='react' options=' { "enterprise": true, "showImportsDropdown": false }'></grid-example>

## Do You Use Portals?

No, React UI does not use React Portals. Previous to React UI, when the rendering engine was written in Plain JavaScript, React Portals were used to host instances of provided Cell Renderer's and Cell Editors. This caused issues such as additional `span`'s appear in the DOM to host the portal, and also sometimes flickering or delayed rendering was visible.

<image-caption src="reactui/resources/no-portals.png" alt="React UI - No Portals" centered="true"></image-caption>

## What Does the Spike Cover


