/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
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
    return querySelectorFunc.bind(this, '[ref=' + ref + ']');
}
exports.RefSelector = RefSelector;
function querySelectorFunc(selector, classPrototype, methodOrAttributeName, index) {
    if (selector === null) {
        console.error('ag-Grid: QuerySelector selector should not be null');
        return;
    }
    if (typeof index === 'number') {
        console.error('ag-Grid: QuerySelector should be on an attribute');
        return;
    }
    // it's an attribute on the class
    var props = getOrCreateProps(classPrototype, classPrototype.constructor.name);
    if (!props.querySelectors) {
        props.querySelectors = [];
    }
    props.querySelectors.push({
        attributeName: methodOrAttributeName,
        querySelector: selector
    });
}
function Listener(eventName) {
    return listenerFunc.bind(this, eventName);
}
exports.Listener = Listener;
function listenerFunc(eventName, target, methodName, descriptor) {
    if (eventName === null) {
        console.error('ag-Grid: EventListener eventName should not be null');
        return;
    }
    // it's an attribute on the class
    var props = getOrCreateProps(target, target.constructor.name);
    if (!props.listenerMethods) {
        props.listenerMethods = [];
    }
    props.listenerMethods.push({
        methodName: methodName,
        eventName: eventName
    });
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
