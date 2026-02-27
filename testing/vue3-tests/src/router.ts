import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: '/ag-10731',
    },
    {
        path: '/ag-10731',
        name: 'AG-10731 Editor getValue',
        component: () => import('./test-cases/AG-10731-editor-getvalue/IndexPage.vue'),
    },
    {
        path: '/ag-11495',
        name: 'AG-11495 Row Data',
        component: () => import('./test-cases/AG-11495-rowdata/AgGrid.vue'),
    },
    {
        path: '/ag-11760-expose',
        name: 'AG-11760 Header Expose',
        component: () => import('./test-cases/AG-11760-header-expose/Page.vue'),
    },
    {
        path: '/ag-11760-support',
        name: 'AG-11760 Header Support',
        component: () => import('./test-cases/AG-11760-header-support/Page.vue'),
    },
    {
        path: '/ag-13735',
        name: 'AG-13735 Class Instances RowData',
        component: () => import('./test-cases/AG-13735-class-instances-rowdata/Page.vue'),
    },
    {
        path: '/ag-14083',
        name: 'AG-14083 RowData Object Functions',
        component: () => import('./test-cases/AG-14083-rowdata-object-functions/Page.vue'),
    },
    {
        path: '/ag-14134',
        name: 'AG-14134 Class Instance RowData',
        component: () => import('./test-cases/AG-14134-class-instance-rowdata/Page.vue'),
    },
    {
        path: '/ag-6753',
        name: 'AG-6753 Reactive RowData Options',
        component: () => import('./test-cases/AG-6753-reactive-rowdata-options/Page.vue'),
    },
    {
        path: '/simple-v-model',
        name: 'Simple v-model Reactivity',
        component: () => import('./test-cases/simple-v-model-reactivity/Page.vue'),
    },
    {
        path: '/simple-vue3-grid',
        name: 'Simple Vue3 Grid',
        component: () => import('./test-cases/simple-vue3-grid/Page.vue'),
    },
    {
        path: '/ts-testcase',
        name: 'TS Testcase',
        component: () => import('./test-cases/ts-testcase/Page.vue'),
    },
    {
        path: '/zd34301',
        name: 'ZD34301 Inject/Provide',
        component: () => import('./test-cases/zd34301-inject-provide/Page.vue'),
    },
    {
        path: '/zd35354',
        name: 'ZD35354 Row Data Reactivity',
        component: () => import('./test-cases/zd35354-row-data-reactivity/Page.vue'),
    },
    {
        path: '/zd36616',
        name: 'ZD36616 Reactive RowData Editable',
        component: () => import('./test-cases/zd36616-reactive-rowdata-editable/Page.vue'),
    },
    {
        path: '/zd40289',
        name: 'ZD40289 Immediate Watch',
        component: () => import('./test-cases/zd40289-immediate-watch/Page.vue'),
    },
    {
        path: '/ag-14250',
        name: 'AG-14250 Lose Focus',
        component: () => import('./test-cases/AG-14250-lose-focus/Page.vue'),
    },
    {
        path: '/ag-14783',
        name: 'AG-14783 Copy Paste',
        component: () => import('./test-cases/AG-14783-copy-paste/Page.vue'),
    },
    {
        path: '/ag-14654',
        name: 'AG-14654 Change Detection',
        component: () => import('./test-cases/AG-14654-change-detection/Page.vue'),
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});
