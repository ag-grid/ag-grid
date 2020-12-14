import { ComponentUtil } from 'ag-grid-community';
export var kebabProperty = function (property) {
    return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};
export var kebabNameToAttrEventName = function (kebabName) {
    // grid-ready for example would become onGrid-ready in Vue
    return "on" + kebabName.charAt(0).toUpperCase() + kebabName.substring(1, kebabName.length);
};
export var getAgGridProperties = function () {
    var props = {
        gridOptions: {
            default: function () {
                return {};
            },
        },
        autoParamsRefresh: false,
        componentDependencies: {
            default: function () {
                return [];
            }
        },
        modules: {
            default: function () {
                return [];
            }
        },
        rowDataModel: undefined
    };
    // for example, 'grid-ready' would become 'onGrid-ready': undefined
    // without this emitting events results in a warning
    // and adding 'grid-ready' (and variations of this to the emits option in AgGridVue doesn't help either)
    var eventNameAsProps = ComponentUtil.EVENTS.map(function (eventName) { return kebabNameToAttrEventName(kebabProperty(eventName)); });
    eventNameAsProps.reduce(function (accumulator, eventName) {
        accumulator[eventName] = undefined;
        return accumulator;
    }, props);
    var watch = {
        rowDataModel: function (currentValue, previousValue) {
            this.processChanges('rowData', currentValue, previousValue);
        },
    };
    ComponentUtil.ALL_PROPERTIES.forEach(function (propertyName) {
        props[propertyName] = {};
        watch[propertyName] = function (currentValue, previousValue) {
            this.processChanges(propertyName, currentValue, previousValue);
        };
    });
    var model = {
        prop: 'rowDataModel',
        event: 'data-model-changed',
    };
    return [props, watch, model];
};
