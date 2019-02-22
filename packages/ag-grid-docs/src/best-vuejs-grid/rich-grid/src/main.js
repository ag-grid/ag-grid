import Vue from "vue";

import RichGridExample from "./rich-grid-example/RichGridExample.vue";

if (window.webpackHotUpdate) {
    console.log('In Dev Mode');
}

new Vue({
    el: '#app',
    render: h => h(RichGridExample)
})