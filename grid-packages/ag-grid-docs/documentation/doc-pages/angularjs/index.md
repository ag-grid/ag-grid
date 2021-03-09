---
title: "AngularJS 1.x Grid"
frameworks: ["angular"]
---

This page details how to set up AG Grid inside and AngularJS 1.x application.

When the AG Grid script loads, it does not register with AngularJS 1.x. This is because AngularJS 1.x
is an optional part of AG Grid and you need to tell AG Grid you want to use it.

## Download AG Grid Enterprise

<style>
    .gatsby-resp-image-wrapper {
        width: 4rem;
    }

    table.content code {
        font-family: monospace;
        font-size: 1.2rem;
        white-space: nowrap;
    }
</style>

<table class="content">
    <tr>
        <td style="padding: 10px;">
            <img src="resources/bower.png" alt="Bower Install AG Grid" />
        </td>
        <td>
            <strong>Bower</strong><br/><code>bower install ag-grid-enterprise</code>
        </td>
    </tr>
    <tr>
        <td style="padding: 10px;">
            <img src="resources/npm.png" alt="NPM install AG Grid" />
        </td>
        <td>
            <strong>NPM</strong><br/><code>npm install ag-grid-enterprise</code>
        </td>
    </tr>
    <tr>
        <td style="padding: 10px;">
            <img src="resources/github.png" alt="Github install AG Grid" />
        </td>
        <td>
            <strong>Github</strong><br/>Download from <a href="https://github.com/ag-grid/ag-grid-enterprise" target="_blank">Github</a>
        </td>
    </tr>
</table>

### Referencing AG Grid Enterprise

AG Grid Enterprise is also distributed as both a self contained bundle and also via a CommonJS package.

As with the [AG Grid example](../../example.php), all we need to do is reference
the ag-grid-enterprise dependency and we're good to go:

```html
<html>
<head>
    <script src="path-to-ag-grid-enterprise/ag-grid-enterprise.js"></script>
    <script src="example1.js"></script>
</head>
<body>
    <div id="myGrid" style="height: 100%;" class="ag-theme-alpine"></div>
</body>
</html>
```

[[note]]
| **Self Contained Bundles**
| <br/>
| Do **not** include both AG Grid Community and AG Grid Enterprise self contained bundles.
| The AG Grid Enterprise bundle contains AG Grid Community within it.

The creation of the Grid would be the same as the AG Grid example above.

### AG Grid Enterprise Bundle Types

Again similar to AG Grid, AG Grid Enterprise has 4 bundles:

- dist/ag-grid-enterprise.js -> standard bundle containing JavaScript and CSS
- dist/ag-grid-enterprise.min.js -> minified bundle containing JavaScript and CSS
- dist/ag-grid-enterprise.noStyle.js -> standard bundle containing JavaScript without CSS
- dist/ag-grid-enterprise.min.noStyle.js -> minified bundle containing JavaScript without CSS

Even if you are using React, AngularJS 1.x, Angular, VueJS or Web Components, the above is all
you need to do. Any grid you create will be an enterprise grid once you load the library.

### CommonJS

If using CommonJS, you one need to include AG Grid Enterprise into your project. You do not need
to execute any code inside it. When AG Grid Enterprise loads, it will register with AG Grid such
that the enterprise features are available when you use AG Grid.

```js
// ECMA 5 - using nodes require() method
var AgGrid = require('@ag-grid-community/all-modules');

// or, if using Enterprise features
var AgGrid = require('@ag-grid-enterprise/all-modules');

// ECMA 6 - using the system import method
import { Grid } from '@ag-grid-community/all-modules'

// or, if using Enterprise features
// import {Grid} from '@ag-grid-enterprise/all-modules'
```

### Creating the AngularJS 1.x Module

Include AG Grid as a dependency of your module like this:

```js
// if you're using AG Grid Enterprise, you'll need to provide the License Key before doing anything else
// not necessary if you're just using AG Grid
agGrid.LicenseManager.setLicenseKey("your license key goes here");

// get AG Grid to create an Angular module and register the AG Grid directive
agGrid.initialiseAgGridWithAngular1(angular);

// create your module with AG Grid as a dependency
var module = angular.module("example", ["agGrid"]);
```

### AG Grid div

To include a grid in your html, add the `ag-grid` attribute to a div. The value
of the div should be the provided grid options on the scope.

It is also usual to provide a styling theme to the grid. Three themes come with the
grid, `ag-theme-alpine`, `ag-theme-alpine` and `ag-theme-material`. Each one is set
by applying the corresponding class of the same name to the div.


You must provide **width and height** to your grid. The grid is programmed to fill
the width and height you give it.


```html
<div ag-grid="gridOptions" class="ag-theme-alpine" style="height: 100%;"></div>
```

(note: a div by default has 100% width, so the width is not specified explicitly above).


### Grid Options

The grid options provide AG Grid with the details needed to render. At a minimum you
should provide the columns (columnDefs) and the rows (rowData).


## Basic AngularJS 1.x Example

<grid-example title='Basic AngularJS 1.x AG Grid' name='basic' type='vanilla' options='{ "exampleHeight": 250, "extras":  ["angularjs1"] }'></grid-example>

## Events & Digest Cycle

For AngularJS 1.x - AG Grid does not not fire events inside an Angular JS digest cycle. This is done on
purpose for performance reasons, as there are many events fired, even if you don't listen to them.
Firing the digest cycle for each one would kill performance. So you may want to $scope.$apply() after you
handle the event.

## Destroy

If using AG Grid's AngularJS direction, you do not need to manually clean up the grid. The grid ties in
with the AngularJS 1.x lifecycle and releases all resources when the directive is destroyed.

## Advanced AngularJS 1.x Example

The below example has much more details. The mechanism for setting up the grid is the same as above.
Don't worry about the finer details for now, how all the different options are configured is explained
in the relevant parts of the documentation.

<grid-example title='Basic AngularJS 1.x AG Grid' name='basic2' type='vanilla' options='{ "exampleHeight": 460, "extras": ["angularjs1"] }'></grid-example>

## Angular 1.x and AG Grid Components

AG Grid does not provide direct support for it's [components](/components/) and AngularJS 1.x.
If you want to put custom AngularJS 1.x components into AG Grid, follow the
[instructions for plain JavaScript component](/getting-started/). You will then need to manage creating
and destroying child scopes yourself inside the `init()` and `destroy()` methods.

Below shows an example of using AG Grid Filter, Header and Cell Renderer components. The following can be noted:

- The Make column has an Angular 1 Header Component.
- The Model column has an Angular 1 Filter.
- The Price column has an Angular 1 Cell Renderer.
- The Date column has an Angular 1 Cell Editor (using the [AngularJS UI Bootstrap Directive](https://angular-ui.github.io/bootstrap/)).
- The Date column has an Angular 1 Date Filter (using the [AngularJS UI Bootstrap Directive](https://angular-ui.github.io/bootstrap/)).
- Each component creates it's own $scope in the `init` method and destroys it in the `destroy` method.


<grid-example title='Components' name='components' type='vanilla' options='{ "exampleHeight": 250, "extras": ["angularjs1", "ui-bootstrap"] }'></grid-example>

[[note]]
| Creating child scopes and managing AngularJS compiling is part of the AngularJS framework. Please google how to do this, it's not part of AG Grid.

## Angular Compiling

Angular 1.x is great. It allows us to build large end-to-end single page web apps with relative ease.
However the author of AG Grid is of the opinion that not everything should be built in Angular.
Angular 1.x does come with a disadvantage, it can slow things down. AG Grid does not use
Angular 1.x (or any other framework) underneath the hood, it is all blazing fast raw Javascript.

But maybe you are not worried about performance. Maybe you are not displaying that many rows and
columns. And maybe you want to provide your own cell renderers and use Angular here. For whatever
reason, it is possible to turn Angular on for Angular version 1.x.

When [Angular is turned on in AG Grid](/getting-started/), every time a row is inserted, a new
child Angular Scope is created for that row. This scope gets the row attached to it so it's
available to any Angular logic inside the cell.

Each cell within the row does not get a new child scope. So if placing item inside the child scope
for the row, be aware that it is shared across all cells for that row. If you want a cell to
have it's own private scope, consider using a directive for the renderer that will introduce a new scope.


### Turn On Angular Compile

Angular compiling is turned on by setting the grid options attribute angularCompileRows to true.

- **angularCompileRows:** Whether to compile the rows for Angular.

The default is always to have Angular compiling off for performance reasons.

Below then uses three columns rendered using custom Angular renderers.

- **Athlete:** Uses simple binding to display text.
- **Age:** Uses simple binding to display a button, with a button click event using ng-click.
- **Country:** Uses a custom Angular directive to display the country.

<grid-example title='Angular compiling' name='compiling' type='vanilla' options='{ "extras": ["angularjs1"] }'></grid-example>

[[note]]
| When scrolling the example above up and down, the cells rendered using Angular are blank
| initially, and filled in during the next Angular digest cycle. This behaviour the author
| has observed in other Angular grid implementations. This is another reason why the author
| prefers non-Angular rendering for large grids.

## Cell Templates

[Cell Templates](/component-cell-renderer/#cell-renderer-component) allow you to specify
templates to use to render your cells. This is handy if you want to put JavaScript markup with
AngularJS 1.x bindings as the cells. Cell templates are specified in the column definition by
providing a template as a string or a templateUrl to load the template from the server.

If using templateUrl, then the html is cached. The server is only hit once per template and it is reused.

The example below uses cell templates for the first three columns.

- **Col 1 - ** The first column uses a static template. Pretty pointless as you can't change the content between rows.
- **Col 2 - ** The second column uses an inline template. AngularJS 1.x is then used to fetch the content from the scope via ng-bind.
- **Col 3 - ** The third column is similar to the second, with the difference that it loads the template from the server.

[[note]]
| In the example, as you scroll up and down, the redraw on the AngularJS 1.x columns has a lag.
| This is waiting for the AngularJS 1.x digest cycle to kick in to populate the values into these rows.

<grid-example title='Cell Templates' name='cell-templates' type='vanilla' options='{ "enterprise": true, "extras": ["angularjs1"] }'></grid-example>

## Next Steps

Ready to try AG Grid in your project? Download AG Grid Community edition or trial AG Grid Enterprise for free.
