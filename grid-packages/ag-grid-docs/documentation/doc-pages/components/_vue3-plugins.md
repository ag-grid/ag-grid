|## Vue 3 Components - Plugins
|
|If you are using Vue 3 Components that rely on a plugin (for example a cell renderer component that 
|uses `vue-router's` `router-link`) then you need to pass those plugins down to `@ag-grid-community/vue3 / ag-grid-vue3`.
|
|For example
|
|```js
|// main.js
|import ant from 'ant-design-vue'
|import router from './router'
|import App from './App.vue'
|
|createApp(App).use(router).use(ant).mount('#app')
|```
|
|```js
|// CellRendererComponent.vue
|
|// Note that this component relies on both the "router" and "ant" plugins to function, so these both need to provided  
|// to the @ag-grid-community/vue3 / ag-grid-vue3 component
|
|<template>
|  <div>
|    <a-spin tip="Grid Loading..." />
|    <a-divider></a-divider>
|        <router-link to="/about">About</router-link>
|    <a-divider></a-divider>
|  </div>
|</template>
|<script>
|export default {
|}
|</script>
|```
|
|```js
|// Grid.vue
|
|<template>
|   <ag-grid-vue
|       :plugins="plugins"
|       ...other properties>
|   </ag-grid-vue>
|</template>
|
|<script>
|//...other imports
|import {AgGridVue} from "@ag-grid-community/vue3";
|import CellRendererComponent from "CellRendererComponent.vue";
|import ant from 'ant-design-vue'
|import router from '../router';
|
|export default {
|   components: {
|       AgGridVue,
|       CellRendererComponent
|   }
|   data() {
|       return {
|           plugins: [ant,router],
|           columnDefs: [
|                {
|                   field: "value",
|                   cellRendererFramework: 'CellRendererComponent'     
|               }
|           ]
|       }
|   }
|   //...other properties & methods
|}
|</script>
|```
