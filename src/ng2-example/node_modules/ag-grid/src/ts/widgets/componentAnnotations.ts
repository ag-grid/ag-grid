export function QuerySelector(selector?: string): Function {
    return querySelectorFunc.bind(this, selector);
}

function querySelectorFunc(selector: string, classPrototype: any, methodOrAttributeName: string, index: number) {

    if (selector===null) {
        console.error('ag-Grid: QuerySelector selector should not be null');
        return;
    }
    if (typeof index === 'number') {
        console.error('ag-Grid: QuerySelector should be on an attribute');
        return;
    }

    // it's an attribute on the class
    var props = getOrCreateProps(classPrototype);
    if (!props.querySelectors) {
        props.querySelectors = [];
    }
    props.querySelectors.push({
        attributeName: methodOrAttributeName,
        querySelector: selector
    });
}

export function Listener(eventName?: string): Function {
    return listenerFunc.bind(this, eventName);
}

function listenerFunc(eventName: string, target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>) {

    if (eventName===null) {
        console.error('ag-Grid: EventListener eventName should not be null');
        return;
    }

    // it's an attribute on the class
    var props = getOrCreateProps(target);
    if (!props.listenerMethods) {
        props.listenerMethods = [];
    }
    props.listenerMethods.push({
        methodName: methodName,
        eventName: eventName
    });
}

function getOrCreateProps(target: any): any {

    var props = target.__agComponentMetaData;

    if (!props) {
        props = {};
        target.__agComponentMetaData = props;
    }

    return props;
}