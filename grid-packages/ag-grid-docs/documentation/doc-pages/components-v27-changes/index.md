---
title: "Component Changes in v27"
---

Configuring components was made simpler in v27.

Before it was necessary to tell the grid that a Component was a Framework Component by using `xxxFramework` properties. Having separate properties for JavaScript and Framework components is no longer necessary. Now the grid works out if a Component is JavaScript or a Framework Component.

For example, consider how a Cell Renderer used to be configured before and after v27.
Prior to v27, the following was used:

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        { 
            field: 'name',
            cellRenderer: NameJsCellRenderer, // JS Component
            cellRendererParams: {a: 'something'}
        },
        { 
            field: 'age',
            cellRendererFramework: AgeFrameworkCellRenderer, // Framework Component
            cellRendererParams: {b: 'something'}
        }
    ],
}
</snippet>

| Old Property             | Description     |
| ------------------------ | ------------------------- |
| cellRenderer             | A JavaScript Cell Renderer|
| cellRendererFramework    | A Framework Cell Renderer |
| cellRendererParams       | Additional parameters      |

From v27 onwards, the following is used:

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        { 
            field: 'name',
            cellRendererComp: NameJsCellRenderer, // Grid decides JS or Framework Component
        },
        { 
            field: 'age',
            cellRendererComp: AgeFrameworkCellRenderer, // Grid decides JS or Framework Component, no xxxFramework
        }
    ],
}
</snippet>

| New Property             | Description       |
| ------------------------ | ------------------------- |
| cellRendererComp         | Replaces cellRenderer and cellRendererFramework, can be either JavaScript or Framework Component  |
| cellRendererCompParams   | Same as cellRendererParams  |

In other words, now when providing components, you always use the same property (`cellRendererComp` for Cell Renderers) regardless of whether it is a JavaScript or Framework Component.

The grid now inspects the Component and if it sees the method `getGui()` it assumes it is a JavaScript Component, as `getGui()` is on all JavaScript Components and not on any Framework Components. Otherwise it treats it as a Framework Component.

## Advantages

The changes were done for two reasons.

Firstly the new approach results in less verbose code. The word `framework` isn't appearing everywhere when providing Framework Components.

Secondly for consistency. Configurations are now the same for JavaScript and Frameworks, thus less confusing for those who switch between both.

## Non Breaking Change

This is a non-breaking change. The old properties still work as before. The new logic is applied only to the new property names. There is no plan to deprecate the old property names, thus there is no need to migrate your code. We intend to keep the old property names working in the background for backwards compatibility.

This means there is now duplication in the interface (two ways to configure the same thing). We decided this duplication was better than removing the properties and creating a breaking change.

All the documentation and documentation examples (except this page) have been migrated to use the new property names.

## Registering Components

Before when registering components, JavaScript and Framework Components needed to be registered independently. That is no longer the case.

Prior to v27, registering Components was done as follows:

<snippet spaceBetweenProperties="true">
const gridOptions = {
    components: {
        nameJs: NameJsCellRenderer // JS Component
    },
    frameworkComponents: {
        ageFwk: AgeFrameworkCellRenderer // Framework Component
    },
    columnDefs: [
        { 
            field: 'name',
            cellRenderer: 'nameJs'
        },
        { 
            field: 'age',
            cellRendererFramework: 'ageFwk' // Framework Component
        }
    ],
}
</snippet>

| Old Property           | Description      |
| ---------------------- | ------------------------- |
| components             | A map of names to JavaScript Components |
| frameworkComponents    | A map of names to Framework Components |

For v27 onwards, registering Components is as follows:

<snippet spaceBetweenProperties="true">
const gridOptions = {
    comps: {
        nameJs: NameJsCellRenderer, // JS Component
        ageFwk: AgeFrameworkCellRenderer // Framework Component
    },
    columnDefs: [
        { 
            field: 'name',
            cellRenderer: 'nameJs'
        },
        { 
            field: 'age',
            cellRenderer: 'ageFwk'
        }
    ],
}
</snippet>

| New Property             | Description      |
| ------------------------ | ------------------------- |
| comps         | Replaces components and frameworkComponents, a map of names to Components, Components can be JavaScript or Framework |

As before, the grid will inspect the components, and if is sees a `getGui()` method it treats it as a JavaScript component, otherwise a Framework Component.

## Selectors

For Selectors (Cell Renderer and Cell Editor only), the alternatives to these are simplified. The result of the new selectors do not need to specify the type (JS or Framework) of the component.

Before v27, the following was used:

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        { 
            field: 'rating',
            cellRendererSelector: params => {
                let comp = params.value>10 ? LowRatingFrameworkCellRenderer : HighRatingFrameworkCellRenderer;
                return {
                    component: comp,
                    frameworkComponent: true // Tell's grid it's Framework Component
                };
            }
        }
    ],
}
</snippet>

From v27 onwards, the following is used:

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        { 
            field: 'rating',
            cellRendererCompSelector: params => {
                let comp = params.value>10 ? LowRatingFrameworkCellRenderer : HighRatingFrameworkCellRenderer;
                return {
                    comp: comp // Grid decides JS or Framework Component
                };
            }
        }
    ],
}
</snippet>

## Using Functional JavaScript Components

The old configuration allowed using JavaScript Functional Components. This does not work with the new configuration options, as such functions will be missing the `getGui()` method and will be mistakenly treated as Framework Components.

If you are using JavaScript Functional Components inside a React / Angular / Vue grid, then refer to the Functional Component the old way. For example to specify a Functional Cell Renderer, use `cellRenderer` instead of `cellRendererComp`.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        { 
            field: 'a',
            // this will fail, as will be treated as a Framework Component
            cellRendererComp: function (p) { '< div>Hello< /div>' }
        },
        { 
            field: 'a',
            // this will work, using the old configuration.
            cellRenderer: function (p) { '< div>Hello< /div>' }
        }
    ],
}
</snippet>

If you want to use the new properties for such components, convert them to Class Components.

## All Changed Properties

The table below lists all the changed properties.

| Component                     | Old Properties | New Properties |
| ----------------------------- | ------------------------- | ------------------------ | 
| Cell Renderer                 | cellRenderer<br/>cellRendererFramework<br/>cellRendererParams<br/>cellRendererSelector         | cellRendererComp<br/>cellRendererCompParams<br/>cellRendererCompSelector         | 
| Cell Editor                   | cellEditor<br>cellEditorFramework<br>cellEditorParams<br/>cellEditorSelector | cellEditorComp<br>cellEditorCompParams<br/>cellEditorCompSelector | 
| Filter                        | filter<br/>filterFramework<br/>filterParams              | filterComp<br/>filterCompParams              | 
| Floating Filter               | floatingFilter<br/>floatingFilterFramework<br/>floatingFilterParams       | floatingFilterComp<br/>floatingFilterCompParams       | 
| Header Component              | header<br/>headerFramework<br/>headerParams               | headerComp<br/>headerCompParams               | 
| Header Group Component        | headerGroup<br/>headerGroupFramework<br/>headerGroupParams         | headerGroupComp<br/>headerGroupCompParams         | 
| Tooltip Component             | tooltip<br/>tooltipFramework<br/>tooltipParams              | tooltipComp<br/>tooltipCompParams              | 
| Group Row Cell Renderer       | groupRowCell<br/>groupRowCellFramework<br/>groupRowCellParams         |  groupRowCellComp<br/>groupRowCellCompParams         | 
| Group Row Inner Cell Renderer | innerCell<br/>innerCellFramework<br/>innerCellParams            | innerCellComp<br/>innerCellCompParams            | 
| Detail Cell Renderer          | detailRowCell<br/>detailRowCellFramework<br/>detailRowCellParams        | detailRowCellComp<br/>detailRowCellCompParams        | 
| Full Width Cell Renderer      | fullWidthCell<br/>fullWidthCellFramework<br/>fullWidthCellParams        | fullWidthCellComp<br/>fullWidthCellCompParams        | 
| Loading Cell Renderer         | loadingRowCell<br/>loadingRowCellFramework<br/>loadingRowCellParams       | loadingRowCellComp<br/>loadingRowCellCompParams       |
| Loading Overlay               | loadingOverlay<br/>loadingOverlayFramework<br/>loadingOverlayParams       | loadingOverlayComp<br/>loadingOverlayCompParams       | 
| No Rows Overlay               | noRowsOverlay<br/>noRowsOverlayFramework<br/>noRowsOverlayParams        | noRowsOverlayComp<br/>noRowsOverlayCompParams        |
| Date Component                | date<br/>dateFramework<br/>dateParams                  | dateComp<br/>dateCompParams                  | 
| Status Bar Component          | statusPanel<br/>statusPanelFramework<br/>statusPanelParams          | statusPanelComp<br/>statusPanelCompParams          | 
| Tool Panel                    | toolPanel<br/>toolPanelFramework<br/>toolPanelParams            | toolPanelComp<br/>toolPanelCompParams            | 


