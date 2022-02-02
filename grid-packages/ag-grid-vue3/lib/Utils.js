import { ComponentUtil } from 'ag-grid-community';
export var kebabProperty = function (property) {
    return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};
export var kebabNameToAttrEventName = function (kebabName) {
    // grid-ready for example would become onGrid-ready in Vue
    return "on" + kebabName.charAt(0).toUpperCase() + kebabName.substring(1, kebabName.length);
};
export var getAgGridProperties = function () {
    var props = {};
    // for example, 'grid-ready' would become 'onGrid-ready': undefined
    // without this emitting events results in a warning
    // and adding 'grid-ready' (and variations of this to the emits option in AgGridVue doesn't help either)
    var eventNameAsProps = ComponentUtil.PUBLIC_EVENTS.map(function (eventName) { return kebabNameToAttrEventName(kebabProperty(eventName)); });
    eventNameAsProps.reduce(function (accumulator, eventName) {
        accumulator[eventName] = undefined;
        return accumulator;
    }, props);
    var watch = {};
    ComponentUtil.ALL_PROPERTIES
        .filter(function (propertyName) { return propertyName != 'gridOptions'; }) // dealt with in AgGridVue itself
        .forEach(function (propertyName) {
        props[propertyName] = {};
        watch[propertyName] = {
            handler: function (currentValue, previousValue) {
                this.processChanges(propertyName, currentValue, previousValue);
            },
            deep: propertyName !== 'popupParent' && propertyName !== 'context'
        };
    });
    var model = {
        prop: 'rowDataModel',
        event: 'data-model-changed',
    };
    return [props, watch, model];
};
//# sourceMappingURL=Utils.js.map