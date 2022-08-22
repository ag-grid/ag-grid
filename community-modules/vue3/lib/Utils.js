import { ComponentUtil } from '@ag-grid-community/core';
export const kebabProperty = (property) => {
    return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};
export const kebabNameToAttrEventName = (kebabName) => {
    // grid-ready for example would become onGrid-ready in Vue
    return `on${kebabName.charAt(0).toUpperCase()}${kebabName.substring(1, kebabName.length)}`;
};
export const getAgGridProperties = () => {
    const props = {};
    // for example, 'grid-ready' would become 'onGrid-ready': undefined
    // without this emitting events results in a warning
    // and adding 'grid-ready' (and variations of this to the emits option in AgGridVue doesn't help either)
    const eventNameAsProps = ComponentUtil.PUBLIC_EVENTS.map((eventName) => kebabNameToAttrEventName(kebabProperty(eventName)));
    eventNameAsProps.forEach((eventName) => props[eventName] = undefined);
    const watch = {};
    ComponentUtil.ALL_PROPERTIES
        .filter((propertyName) => propertyName != 'gridOptions') // dealt with in AgGridVue itself
        .forEach((propertyName) => {
        props[propertyName] = {};
        watch[propertyName] = {
            handler(currentValue, previousValue) {
                this.processChanges(propertyName, currentValue, previousValue);
            },
            deep: propertyName !== 'popupParent' && propertyName !== 'context'
        };
    });
    return [props, watch];
};
//# sourceMappingURL=Utils.js.map