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

## When will AG Grid React UI be ready?

Our React UI is already half done and included in the latest AG Grid release. To enable it, set the property `reactUi=true`. Below is an example AG Grid React using the new React UI.

<grid-example title='Custom Sorting' name='react-ui' type='generated'></grid-example>
