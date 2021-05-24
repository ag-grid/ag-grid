/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { getFunctionName } from '../utils/function';
export function QuerySelector(selector) {
    return querySelectorFunc.bind(this, selector, undefined);
}
export function RefSelector(ref) {
    return querySelectorFunc.bind(this, "[ref=" + ref + "]", ref);
}
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
// think we should take this out, put property bindings on the
export function GridListener(eventName) {
    return gridListenerFunc.bind(this, eventName);
}
function gridListenerFunc(eventName, target, methodName) {
    if (eventName == null) {
        console.error('AG Grid: GridListener eventName is missing');
        return;
    }
    addToObjectProps(target, 'gridListenerMethods', {
        methodName: methodName,
        eventName: eventName
    });
}
// think we should take this out, put property bindings on the
export function GuiListener(ref, eventName) {
    return guiListenerFunc.bind(this, ref, eventName);
}
function guiListenerFunc(ref, eventName, target, methodName) {
    if (eventName == null) {
        console.error('AG Grid: GuiListener eventName is missing');
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
    var props = getOrCreateProps(target, getFunctionName(target.constructor));
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
