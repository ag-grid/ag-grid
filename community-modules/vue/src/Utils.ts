import { ComponentUtil } from '@ag-grid-community/core';

export interface Properties {
    [propertyName: string]: any;
}

export const getAgGridProperties = (): [Properties, Properties, {}] => {
    const props: Properties = {
        gridOptions: {
            default() {
                return {};
            },
        },
        rowDataModel: undefined,
    };
    const watch: Properties = {
        rowDataModel(currentValue: any, previousValue: any) {
            this.processChanges('rowData', currentValue, previousValue);
        },
    };

    ComponentUtil.ALL_PROPERTIES.forEach((propertyName) => {
        props[propertyName] = {};

        watch[propertyName] = function(currentValue: any, previousValue: any) {
            this.processChanges(propertyName, currentValue, previousValue);
        };
    });

    const model: { prop: string, event: string } = {
        prop: 'rowDataModel',
        event: 'data-model-changed',
    };

    return [props, watch, model];
};

