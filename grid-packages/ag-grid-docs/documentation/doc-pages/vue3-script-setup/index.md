---
title: "Vue 3 SFC with script/setup"
frameworks: ["vue"]
---

## Overview

This section describes how to make use of Vue 3's `script/setup` syntactic sugar with AG Grid and AG Grid components.

## Using Custom Components in AG Grid with script/setup

When using a [Custom Component](../components/) in AG Grid with `script/setup` you need to expose the custom components
with `defineExpose`, as follows:

<snippet transform={false} language="html">
|&lt;template>
|  &lt;ag-grid-vue
|      :columnDefs="columnDefs"
|      :rowData="rowData"
|      class="ag-theme-quartz">
|  &lt;/ag-grid-vue>
|&lt;/template>
|
|&lt;script setup>
|import {ref} from 'vue';
|import "ag-grid-community/styles/ag-grid.css";
|import "ag-grid-community/styles/ag-theme-quartz.css";
|import {AgGridVue} from "ag-grid-vue3";
|
|import CellComponentRenderer from "./CellComponentRenderer.vue"
|import CellComponentEditor from "@/rich-grid-example/CellComponentEditor";
|import DateComponent from "@/rich-grid-example/DateComponent";
|import HeaderGroupComponent from "@/rich-grid-example/HeaderGroupComponent";
|
|const columnDefs = ref([
|  {field: "make", , cellRenderer: "CellComponentRenderer"},
|  {field: "model"},
|  {field: "price"},
|  {field: "manufactured"}
|]);
|
|const rowData = ref([
|  {make: "Toyota", model: "Celica", price: 35000},
|  {make: "Ford", model: "Mondeo", price: 32000},
|  {make: "Porsche", model: "Boxster", price: 72000},
|]);
|
|// expose the custom cell renderer for use within AG Grid
|defineExpose({CellComponentRenderer})
|&lt;/script>
</snippet>

Here we expose the custom `CellComponentRenderer` for use within the grid, referenced in the column definition via `cellRenderer: "CellComponentRenderer"`.

With the exception of the `defineExpose` you can then use  [Custom Components](../components/) in the normal way for Vue 3 Components.

### Date Components

When exposing a date component for use with AG Grid you need to expose the component as follows:

`defineExpose({"agDateInput": DateComponent})`

with `DateComponent` being the custom component you wish to use within AG Grid.

You can learn more about Date Components [here](../filter-date/). 
