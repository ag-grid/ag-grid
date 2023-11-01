import { ComponentUtil } from '@ag-grid-community/core';

export interface Properties {
    [propertyName: string]: any;
}

export const getAgGridProperties = (): [Properties, Properties, Properties, {}] => {
    const props: Properties = {
        gridOptions: {
            default() {
                return {};
            },
        },
        rowDataModel: undefined,
    };

    const computed: Properties = {
        props() {
            const props: { [key: string]: any } = {};
            ComponentUtil.ALL_PROPERTIES.forEach((propertyName: string) => {
                props[propertyName] = this[propertyName];
            });
            return props;
        }
    }

    const watch: Properties = {
        rowDataModel(currentValue: any, previousValue: any) {
            if (!this.gridCreated || !this.api) { return; }

            /*
             * Prevents an infinite loop when using v-model for the rowData
             */
            if (currentValue === previousValue) { return; }
            if (currentValue && previousValue) {
                if (currentValue.length === previousValue.length) {
                    if (currentValue.every((item: any, index: number) => item === previousValue[index])) {
                        return;
                    }
                }
            }

            ComponentUtil.processOnChange({ rowData: currentValue }, this.api);
        },
        props: {
            handler(currentValue: any, previousValue: any) {
                if (!this.gridCreated || !this.api) { return; }
                ComponentUtil.processOnChange(currentValue, this.api);
            },
            deep: true,
        }
    };

    ComponentUtil.ALL_PROPERTIES.forEach((propertyName: string) => {
        props[propertyName] = {};
    });

    const model: { prop: string, event: string } = {
        prop: 'rowDataModel',
        event: 'data-model-changed',
    };

    return [props, computed, watch, model];
};

