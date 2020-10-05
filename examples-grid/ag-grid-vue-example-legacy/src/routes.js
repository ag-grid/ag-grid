import RichGridExample from './rich-grid-example/RichGridExample.vue';
import LargeDataSetExample from './large-data-set-example/LargeDataSetExample.vue';

export default [
    {
        path: '/',
        components: {
            default: RichGridExample
        },
        name: 'Rich Grid with Pure JavaScript'
    },
    { path: '/large-data', component: LargeDataSetExample, name: 'Large Data Example' }
];
