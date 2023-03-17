/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefSelector = exports.QuerySelector = void 0;
var function_1 = require("../utils/function");
function QuerySelector(selector) {
    return querySelectorFunc.bind(this, selector, undefined);
}
exports.QuerySelector = QuerySelector;
function RefSelector(ref) {
    return querySelectorFunc.bind(this, "[ref=" + ref + "]", ref);
}
exports.RefSelector = RefSelector;
function querySelectorFunc(selector, refSelector, classPrototype, methodOrAttributeName, index) {
    if (selector === null) {
        console.error('AG Grid: QuerySelector selector should not be null');
        return;
    }
    if (typeof index === 'number') {
        console.error('AG Grid: QuerySelector should be on an attribute');
        return;
    }
    addToObjectProps(classPrototype, 'querySelectors', {
        attributeName: methodOrAttributeName,
        querySelector: selector,
        refSelector: refSelector
    });
}
// // think we should take this out, put property bindings on the
// export function Method(eventName?: string): Function {
//     return methodFunc.bind(this, eventName);
// }
//
// function methodFunc(alias: string, target: Object, methodName: string) {
//     if (alias === null) {
//         console.error("AG Grid: EventListener eventName should not be null");
//         return;
//     }
//
//     addToObjectProps(target, 'methods', {
//         methodName: methodName,
//         alias: alias
//     });
// }
function addToObjectProps(target, key, value) {
    // it's an attribute on the class
    var props = getOrCreateProps(target, function_1.getFunctionName(target.constructor));
    if (!props[key]) {
        props[key] = [];
    }
    props[key].push(value);
}
function getOrCreateProps(target, instanceName) {
    if (!target.__agComponentMetaData) {
        target.__agComponentMetaData = {};
    }
    if (!target.__agComponentMetaData[instanceName]) {
        target.__agComponentMetaData[instanceName] = {};
    }
    return target.__agComponentMetaData[instanceName];
}
