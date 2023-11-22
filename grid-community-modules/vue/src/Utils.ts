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

    const SHALLOW_CHECK_PROPERTIES = ['context', 'popupParent'];
    const DEEP_CHECK_PROPERTIES = ComponentUtil.ALL_PROPERTIES.filter((propertyName: string) => !SHALLOW_CHECK_PROPERTIES.includes(propertyName));

    const createPropsObject = (properties: string[], component: any) => {
        const props: { [key: string]: any } = {};
        properties.forEach((propertyName: string) => {
            if (component[propertyName] === ComponentUtil.VUE_OMITTED_PROPERTY) { return; }
            props[propertyName] = component[propertyName];
        });
        return props;
    };

    const processPropsObject = (prev: any, current: any, component: any) => {
        if (!component.gridCreated || !component.api) { return; }
        const changes: any = {};
        Object.entries(current).forEach(([key, value]) => {
            if (prev[key] === value) return;
            changes[key] = value;
        });
        ComponentUtil.processOnChange(changes, component.api);
    }

    const computed: Properties = {
        props() {
            return createPropsObject(DEEP_CHECK_PROPERTIES, this);
        },
        shallowProps() {
            return createPropsObject(SHALLOW_CHECK_PROPERTIES, this);
        }
    };

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
                processPropsObject(previousValue, currentValue, this);
            },
            deep: true,
        },
        // these props may be cyclic, so we don't deep check them.
        shallowProps: {
            handler(currentValue: any, previousValue: any) {
                processPropsObject(previousValue, currentValue, this);
            },
            deep: false,
        }
    };

    ComponentUtil.ALL_PROPERTIES.forEach((propertyName: string) => {
        props[propertyName] = {
            default: ComponentUtil.VUE_OMITTED_PROPERTY,
        };
    });

    const model: { prop: string, event: string } = {
        prop: 'rowDataModel',
        event: 'data-model-changed',
    };

    return [props, computed, watch, model];
};

