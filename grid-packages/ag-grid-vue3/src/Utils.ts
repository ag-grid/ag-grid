import {ComponentUtil} from 'ag-grid-community';

export const kebabProperty = (property: string) => {
    return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

export const kebabNameToAttrEventName = (kebabName: string) => {
    // grid-ready for example would become onGrid-ready in Vue
    return `on${kebabName.charAt(0).toUpperCase()}${kebabName.substring(1, kebabName.length)}`
};

export interface Properties {
    [propertyName: string]: any;
}

export const getAgGridProperties = (): [Properties, Properties, { prop: string, event: string }] => {
    const props: Properties = {};

    // for example, 'grid-ready' would become 'onGrid-ready': undefined
    // without this emitting events results in a warning
    // and adding 'grid-ready' (and variations of this to the emits option in AgGridVue doesn't help either)
    const eventNameAsProps = ComponentUtil.PUBLIC_EVENTS.map((eventName: string) => kebabNameToAttrEventName(kebabProperty(eventName)));
    eventNameAsProps.forEach((eventName:string) => props[eventName] = undefined)

    const watch: Properties = {};

    ComponentUtil.ALL_PROPERTIES
        .filter((propertyName: string) => propertyName != 'gridOptions') // dealt with in AgGridVue itself
        .forEach((propertyName: string) => {
            props[propertyName] = {};

            watch[propertyName] = {
                handler(currentValue: any, previousValue: any) {
                    this.processChanges(propertyName, currentValue, previousValue);
                },
                deep: propertyName !== 'popupParent' && propertyName !== 'context'
            };
        });

    const model: { prop: string, event: string } = {
        prop: 'rowDataModel',
        event: 'data-model-changed',
    };

    return [props, watch, model];
};

