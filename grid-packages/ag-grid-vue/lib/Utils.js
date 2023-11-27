import { ComponentUtil } from 'ag-grid-community';
export var getAgGridProperties = function () {
    var props = {
        gridOptions: {
            default: function () {
                return {};
            },
        },
        rowDataModel: undefined,
    };
    var SHALLOW_CHECK_PROPERTIES = ['context', 'popupParent'];
    var DEEP_CHECK_PROPERTIES = ComponentUtil.ALL_PROPERTIES.filter(function (propertyName) { return !SHALLOW_CHECK_PROPERTIES.includes(propertyName); });
    var createPropsObject = function (properties, component) {
        var props = {};
        properties.forEach(function (propertyName) {
            if (component[propertyName] === ComponentUtil.VUE_OMITTED_PROPERTY) {
                return;
            }
            props[propertyName] = component[propertyName];
        });
        return props;
    };
    var processPropsObject = function (prev, current, component) {
        if (!component.gridCreated || !component.api) {
            return;
        }
        var changes = {};
        Object.entries(current).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            if (prev[key] === value)
                return;
            changes[key] = value;
        });
        ComponentUtil.processOnChange(changes, component.api);
    };
    var computed = {
        props: function () {
            return createPropsObject(DEEP_CHECK_PROPERTIES, this);
        },
        shallowProps: function () {
            return createPropsObject(SHALLOW_CHECK_PROPERTIES, this);
        }
    };
    var watch = {
        rowDataModel: function (currentValue, previousValue) {
            if (!this.gridCreated || !this.api) {
                return;
            }
            /*
             * Prevents an infinite loop when using v-model for the rowData
             */
            if (currentValue === previousValue) {
                return;
            }
            if (currentValue && previousValue) {
                if (currentValue.length === previousValue.length) {
                    if (currentValue.every(function (item, index) { return item === previousValue[index]; })) {
                        return;
                    }
                }
            }
            ComponentUtil.processOnChange({ rowData: currentValue }, this.api);
        },
        props: {
            handler: function (currentValue, previousValue) {
                processPropsObject(previousValue, currentValue, this);
            },
            deep: true,
        },
        // these props may be cyclic, so we don't deep check them.
        shallowProps: {
            handler: function (currentValue, previousValue) {
                processPropsObject(previousValue, currentValue, this);
            },
            deep: false,
        }
    };
    ComponentUtil.ALL_PROPERTIES.forEach(function (propertyName) {
        props[propertyName] = {
            default: ComponentUtil.VUE_OMITTED_PROPERTY,
        };
    });
    var model = {
        prop: 'rowDataModel',
        event: 'data-model-changed',
    };
    return [props, computed, watch, model];
};
