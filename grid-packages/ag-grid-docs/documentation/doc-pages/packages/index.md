---
title: "AG Grid Packages"
---

AG Grid `packages` are the easiest way to get started with AG Grid, but the trade-off will be a larger overall bundle size may be larger than required if you don't need all features within a given package.

## Introduction

The following artifacts are "`packages`" and are designed to work to together:

[[only-javascript]]
|| Package Name | Contents |
|| ------------ | -------- |
|| `ag-grid-community` | All Community Features |
|| `ag-grid-enterprise` | All Enterprise Features |
[[only-angular]]
|| Package Name | Contents |
|| ------------ | -------- |
|| `ag-grid-community` | All Community Features |
|| `ag-grid-enterprise` | All Enterprise Features |
|| `ag-grid-angular` | Angular Support |
[[only-react]]
|| Package Name | Contents |
|| ------------ | -------- |
|| `ag-grid-community` | All Community Features |
|| `ag-grid-enterprise` | All Enterprise Features |
|| `ag-grid-react` | React Support |
[[only-vue]]
|| Package Name | Contents |
|| ------------ | -------- |
|| `ag-grid-community` | All Community Features |
|| `ag-grid-enterprise` | All Enterprise Features |
|| `ag-grid-vue` | Vue Support |



When using `packages` you get all of the code within that package and cannot pick and choose which features you require. You also don't need to register these packages in the same way you do with `modules`.

This means that it is easier to use `packages` but the trade-off will be you'll end up with a larger bundle size if you don't require all features within a given package.

If you do decide to use `packages` you'll need to specify `ag-grid-community` as a minimum dependency:

```js
"dependencies": {
    "ag-grid-community": "~25.3.0"
    //...other dependencies...
}
```

You can then (optionally) specify `ag-grid-enterprise` if you require Enterprise features:

```diff
"dependencies": {
    "ag-grid-community": "~25.3.0"
+   "ag-grid-enterprise": "~25.3.0"
    //...other dependencies...
}
```

If you do require Enterprise features you'll additionally need to import the `ag-grid-enterprise` package for it to be included in your application:

```js
import 'ag-grid-enterprise';
```

[[only-angular]]
|Finally, if you're using Angular you'll need to specify `ag-grid-angular` packages:
|
|```diff
|"dependencies": {
|    "ag-grid-community": "~25.3.0"
|    "ag-grid-enterprise": "~25.3.0"
|+   "ag-grid-angular": "~25.3.0"
|    //...other dependencies...
|}
|```
[[only-react]]
|Finally, if you're using Reaxt you'll need to specify `ag-grid-react` packages:
|
|```diff
|"dependencies": {
|    "ag-grid-community": "~25.3.0"
|    "ag-grid-enterprise": "~25.3.0"
|+   "ag-grid-react": "~25.3.0"
|    //...other dependencies...
|}
|```
[[only-vue]]
|Finally, if you're using Vue you'll need to specify `ag-grid-vue` packages:
|
|```diff
|"dependencies": {
|    "ag-grid-community": "~25.3.0"
|    "ag-grid-enterprise": "~25.3.0"
|+   "ag-grid-vue": "~25.3.0"
|    //...other dependencies...
|}
|```

Please refer to the [modules](/modules/) documentation for more information on that side of things.

Please refer to the [Getting Started](/getting-started/) guides for a walkthrough on how to install and use these packages from the ground up:

