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
