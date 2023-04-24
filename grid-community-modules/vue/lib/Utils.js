import { ComponentUtil } from '@ag-grid-community/core';
export const getAgGridProperties = () => {
    const props = {
        gridOptions: {
            default() {
                return {};
            },
        },
        rowDataModel: undefined,
    };
    const watch = {
        rowDataModel(currentValue, previousValue) {
            this.processChanges('rowData', currentValue, previousValue);
        },
    };
    ComponentUtil.ALL_PROPERTIES.forEach((propertyName) => {
        props[propertyName] = {};
        watch[propertyName] = function (currentValue, previousValue) {
            this.processChanges(propertyName, currentValue, previousValue);
        };
    });
    const model = {
        prop: 'rowDataModel',
        event: 'data-model-changed',
    };
    return [props, watch, model];
};
