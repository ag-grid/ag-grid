import { ComponentUtil } from 'ag-grid-community';

export interface Properties {
    [propertyName: string]: any;
}

export const getAgGridProperties = (): [Properties, Properties] => {
    const watch: Properties = {};
    const props: Properties = {
        gridOptions: {
            default() {
                return {};
            },
        },
    };
    ComponentUtil.ALL_PROPERTIES.forEach((propertyName) => {
        props[propertyName] = {};

        watch[propertyName] = function(currentValue: any, previousValue: any) {
            this.processChanges(propertyName, currentValue, previousValue);
        };
    });

    return [props, watch];
};

