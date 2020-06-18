/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function QuerySelector(selector) {
    return querySelectorFunc.bind(this, selector);
}
exports.QuerySelector = QuerySelector;
function RefSelector(ref) {
    return querySelectorFunc.bind(this, "[ref=" + ref + "]");
}
exports.RefSelector = RefSelector;
function querySelectorFunc(selector, classPrototype, methodOrAttributeName, index) {
    if (selector === null) {
        console.error("ag-Grid: QuerySelector selector should not be null");
        return;
    }
    if (typeof index === "number") {
        console.error("ag-Grid: QuerySelector should be on an attribute");
        return;
    }
    addToObjectProps(classPrototype, 'querySelectors', {
        attributeName: methodOrAttributeName,
        querySelector: selector
    });
}
// think we should take this out, put property bindings on the
function GridListener(eventName) {
    return gridListenerFunc.bind(this, eventName);
}
exports.GridListener = GridListener;
function gridListenerFunc(eventName, target, methodName) {
    if (eventName == null) {
        console.error("ag-Grid: GridListener eventName is missing");
        return;
    }
    addToObjectProps(target, 'gridListenerMethods', {
        methodName: methodName,
        eventName: eventName
    });
}
// think we should take this out, put property bindings on the
function GuiListener(ref, eventName) {
    return guiListenerFunc.bind(this, ref, eventName);
}
exports.GuiListener = GuiListener;
function guiListenerFunc(ref, eventName, target, methodName) {
    if (eventName == null) {
        console.error("ag-Grid: GuiListener eventName is missing");
        return;
    }
    addToObjectProps(target, 'guiListenerMethods', {
        methodName: methodName,
        eventName: eventName,
        ref: ref
    });
}
// // think we should take this out, put property bindings on the
// export function Method(eventName?: string): Function {
//     return methodFunc.bind(this, eventName);
// }
//
// function methodFunc(alias: string, target: Object, methodName: string) {
//     if (alias === null) {
//         console.error("ag-Grid: EventListener eventName should not be null");
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
    var props = getOrCreateProps(target, target.constructor.name);
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

//# sourceMappingURL=componentAnnotations.js.map
