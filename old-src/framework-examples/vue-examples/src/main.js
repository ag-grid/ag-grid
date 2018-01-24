import Vue from "vue";
import VueRouter from "vue-router";
import "../node_modules/ag-grid/dist/styles/ag-grid.css";
import "../node_modules/ag-grid/dist/styles/ag-theme-fresh.css";
import "../node_modules/bootstrap/dist/css/bootstrap.css";

// need if you use ag-grid enterprise features
import "ag-grid-enterprise/main";

import RichGridExample from "./rich-grid-example/RichGridExample.vue";
import DynamicComponentExample from "./dynamic-component-example/DynamicComponentExample.vue";
import RichDynamicComponentExample from "./rich-dynamic-component-example/RichDynamicComponentExample.vue";
import EditorComponentExample from "./editor-component-example/EditorComponentExample.vue";
import FloatingRowExample from "./floating-row-example/FloatingRowExample.vue";
import FullWidthRowExample from "./full-width-example/FullWidthExample.vue";
import GroupedRowExample from "./grouped-row-example/GroupedRowExample.vue";
import FilterExample from "./filter-example/FilterExample.vue";
import MasterDetailExample from "./master-detail-example/MasterDetailExample.vue";

Vue.use(VueRouter);

const routes = [
    {path: '/', component: RichGridExample, name: "Rich Grid with Pure JavaScript"},
    {path: '/dynamic', component: DynamicComponentExample, name: "Dynamic Components Example"},
    {path: '/rich-dynamic', component: RichDynamicComponentExample, name: "Dynamic Components - Richer Example"},
    {path: '/editor', component: EditorComponentExample, name: "Editor Component Example"},
    {path: '/floating', component: FloatingRowExample, name: "Pinned Row Example"},
    {path: '/full-width', component: FullWidthRowExample, name: "Full Width Row Example"},
    {path: '/grouped-row', component: GroupedRowExample, name: "Grouped Row Example"},
    {path: '/filter', component: FilterExample, name: "Filter Example"},
    {path: '/master-detail', component: MasterDetailExample, name: "Master Detail Example"}
];

const router = new VueRouter({
    routes
});

const app = new Vue({
    data: {
        routes
    },
    router
}).$mount('#app');

