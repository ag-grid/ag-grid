export function QuerySelector(selector?: string): Function {
    return querySelectorFunc.bind(this, selector);
}

export function RefSelector(ref?: string): Function {
    return querySelectorFunc.bind(this, "[ref=" + ref + "]");
}

function querySelectorFunc(selector: string, classPrototype: any, methodOrAttributeName: string, index: number) {
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
export function Listener(eventName?: string): Function {
    return listenerFunc.bind(this, eventName);
}

function listenerFunc(eventName: string, target: Object, methodName: string) {
    if (eventName === null) {
        console.error("ag-Grid: EventListener eventName should not be null");
        return;
    }

    addToObjectProps(target, 'listenerMethods', {
        methodName: methodName,
        eventName: eventName
    });
}

// think we should take this out, put property bindings on the
export function Method(eventName?: string): Function {
    return methodFunc.bind(this, eventName);
}

function methodFunc(alias: string, target: Object, methodName: string) {
    if (alias === null) {
        console.error("ag-Grid: EventListener eventName should not be null");
        return;
    }

    addToObjectProps(target, 'methods', {
        methodName: methodName,
        alias: alias
    });
}

function addToObjectProps(target: Object, key: string, value: any): void {
    // it's an attribute on the class
    const props = getOrCreateProps(target, (target.constructor as any).name);
    if (!props[key]) {
        props[key] = [];
    }
    props[key].push(value);
}

function getOrCreateProps(target: any, instanceName: string): any {
    if (!target.__agComponentMetaData) {
        target.__agComponentMetaData = {};
    }

    if (!target.__agComponentMetaData[instanceName]) {
        target.__agComponentMetaData[instanceName] = {};
    }

    return target.__agComponentMetaData[instanceName];
}