"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var {createApp} = require('vue');
if (typeof createApp !== "undefined") {
    __export(require("./lib/AgGridVue"));
} else {
    __export(require("./lib/legacy/AgGridVue"));
}
