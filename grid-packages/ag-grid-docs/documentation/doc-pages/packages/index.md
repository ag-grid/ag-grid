---
title: "AG Grid Packages"
---

AG Grid `packages` are the easiest way to get started with AG Grid, but the trade-off will be a larger overall bundle size if you don't need all of the features within a given package.

<framework-specific-section frameworks="vue">
<note>
|Note that the following describes the setup for Vue 3. For Vue 2, use `ag-grid-vue` instead of `ag-grid-vue3`.
</note>
</framework-specific-section>

## Introduction

The following artifacts are "`packages`" and are designed to work together:

<framework-specific-section frameworks="javascript">
<table>
    <thead>
    <tr>
        <th>Package Name</th>
        <th>Contents</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td><code>ag-grid-community</code></td>
        <td>All Community Features</td>
    </tr>
    <tr>
        <td><code>ag-grid-enterprise</code></td>
        <td>All Enterprise Features</td>
    </tr>
    <tr>
        <td><code>ag-grid-charts-enterprise</code></td>
        <td>AG Grid Enterprise & AG Charts Enterprise</td>
    </tr>
    </tbody>
</table>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<table>
    <thead>
    <tr>
        <th>Package Name</th>
        <th>Contents</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td><code>ag-grid-community</code></td>
        <td>All Community Features</td>
    </tr>
    <tr>
        <td><code>ag-grid-enterprise</code></td>
        <td>All Enterprise Features</td>
    </tr>
    <tr>
        <td><code>ag-grid-charts-enterprise</code></td>
        <td>AG Grid Enterprise & AG Charts Enterprise</td>
    </tr>
    <tr>
        <td><code>ag-grid-angular</code></td>
        <td>Angular Support</td>
    </tr>
    </tbody>
</table>
</framework-specific-section>

<framework-specific-section frameworks="react">
<table>
    <thead>
    <tr>
        <th>Package Name</th>
        <th>Contents</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td><code>ag-grid-community</code></td>
        <td>All Community Features</td>
    </tr>
    <tr>
        <td><code>ag-grid-enterprise</code></td>
        <td>All Enterprise Features</td>
    </tr>
    <tr>
        <td><code>ag-grid-charts-enterprise</code></td>
        <td>AG Grid Enterprise & AG Charts Enterprise</td>
    </tr>
    <tr>
        <td><code>ag-grid-react</code></td>
        <td>React Support</td>
    </tr>
    </tbody>
</table>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<table>
    <thead>
    <tr>
        <th>Package Name</th>
        <th>Contents</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td><code>ag-grid-community</code></td>
        <td>All Community Features</td>
    </tr>
    <tr>
        <td><code>ag-grid-enterprise</code></td>
        <td>All Enterprise Features</td>
    </tr>
    <tr>
        <td><code>ag-grid-charts-enterprise</code></td>
        <td>AG Grid Enterprise & AG Charts Enterprise</td>
    </tr>
    <tr>
        <td><code>ag-grid-vue3</code></td>
        <td>Vue Support</td>
    </tr>
    </tbody>
</table>
</framework-specific-section>

When using `packages` you get all of the code within that package and cannot pick and choose which features you require. Unlike [Modules](/modules/) there is no need to register feature modules with the grid as the packages take care of this for you.

As a result it is easier to use `packages` but the trade-off will be that you end up with a larger bundle size if you don't require all the features within a given package.

If you do decide to use `packages` you'll need to specify `ag-grid-community` as a minimum dependency:

<snippet transform={false}>
"dependencies": {
    "ag-grid-community": "~@AG_GRID_VERSION@"
    //...other dependencies...
}
</snippet>

You can then (optionally) specify `ag-grid-enterprise` if you require Enterprise features:

<snippet transform={false} language="diff">
"dependencies": {
    "ag-grid-community": "~@AG_GRID_VERSION@"
+   "ag-grid-enterprise": "~@AG_GRID_VERSION@"
    //...other dependencies...
}
</snippet>

If you do require Enterprise features you'll additionally need to import the `ag-grid-enterprise` package for it to be included in your application:

<snippet transform={false}>
import 'ag-grid-enterprise';
</snippet>

<framework-specific-section frameworks="angular">
|Finally, if you're using Angular you'll need to specify `ag-grid-angular` packages:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="diff">
|"dependencies": {
|    "ag-grid-community": "~@AG_GRID_VERSION@"
|    "ag-grid-enterprise": "~@AG_GRID_VERSION@"
|+   "ag-grid-angular": "~@AG_GRID_VERSION@"
|    //...other dependencies...
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
|Finally, if you're using React you'll need to specify `ag-grid-react` packages:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="diff">
|"dependencies": {
|    "ag-grid-community": "~@AG_GRID_VERSION@"
|    "ag-grid-enterprise": "~@AG_GRID_VERSION@"
|+   "ag-grid-react": "~@AG_GRID_VERSION@"
|    //...other dependencies...
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
|Finally, if you're using Vue you'll need to specify `ag-grid-vue3` packages:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="diff">
|"dependencies": {
|    "ag-grid-community": "~@AG_GRID_VERSION@"
|    "ag-grid-enterprise": "~@AG_GRID_VERSION@"
|+   "ag-grid-vue3": "~@AG_GRID_VERSION@"
|    //...other dependencies...
|}
</snippet>
</framework-specific-section>

## Example: Packages

If you are using packages then check that you select the 'Packages' option from the example runner dropdown as this means the code that you see will be using `packages`. This is important as it means any imports will be from `packages` enabling correct copy and pasting.

<image-caption src="package-example-runner.png" alt="Example Runner using Packages" maxWidth="90%" constrained="true" centered="true" toggleDarkMode="true"></image-caption>

## Mixing **packages** and **modules**

<warning>
| Do **not** mix `packages` and `modules`! This will result in a large bundle size!
</warning>

It is vitally important that you do not mix packages and modules in the same application as you will end up including AG Grid twice and doubling your bundle size! All modules are scoped by either `@ag-grid-community/*` or `@ag-grid-enterprise/*` and should not be mixed with the standalone packages of `ag-grid-community` and `ag-grid-enterprise`.

 | Packages             | Modules                     |
 | -------------------- | --------------------------- |
 | `ag-grid-community`  | `@ag-grid-community/xxxxx`  |
 | `ag-grid-enterprise` | `@ag-grid-enterprise/xxxxx` |


<snippet transform={false}> 
"dependencies": {
    "ag-grid-community": "~@AG_GRID_VERSION@" // a package dependency
    "@ag-grid-enterprise/row-grouping": "~@AG_GRID_VERSION@" // a module dependency
    //...other dependencies...
}
</snippet>

Please refer to the [Modules](/modules/) documentation if you are concerned with bundle size.

Please refer to the [Getting Started](/getting-started/) guides for a walk through on how to install and use these packages from the ground up.

