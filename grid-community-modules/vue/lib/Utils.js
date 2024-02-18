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
    const SHALLOW_CHECK_PROPERTIES = ['context', 'popupParent'];
    const DEEP_CHECK_PROPERTIES = ComponentUtil.ALL_PROPERTIES.filter((propertyName) => !SHALLOW_CHECK_PROPERTIES.includes(propertyName));
    const createPropsObject = (properties, component) => {
        const props = {};
        properties.forEach((propertyName) => {
            if (component[propertyName] === ComponentUtil.VUE_OMITTED_PROPERTY) {
                return;
            }
            props[propertyName] = component[propertyName];
        });
        return props;
    };
    const processPropsObject = (prev, current, component) => {
        if (!component.gridCreated || !component.api) {
            return;
        }
        const changes = {};
        Object.entries(current).forEach(([key, value]) => {
            if (prev[key] === value)
                return;
            changes[key] = value;
        });
        ComponentUtil.processOnChange(changes, component.api);
    };
    const computed = {
        props() {
            return createPropsObject(DEEP_CHECK_PROPERTIES, this);
        },
        shallowProps() {
            return createPropsObject(SHALLOW_CHECK_PROPERTIES, this);
        }
    };
    const watch = {
        rowDataModel(currentValue, previousValue) {
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
                    if (currentValue.every((item, index) => item === previousValue[index])) {
                        return;
                    }
                }
            }
            ComponentUtil.processOnChange({ rowData: currentValue }, this.api);
        },
        props: {
            handler(currentValue, previousValue) {
                processPropsObject(previousValue, currentValue, this);
            },
            deep: true,
        },
        // these props may be cyclic, so we don't deep check them.
        shallowProps: {
            handler(currentValue, previousValue) {
                processPropsObject(previousValue, currentValue, this);
            },
            deep: false,
        }
    };
    ComponentUtil.ALL_PROPERTIES.forEach((propertyName) => {
        props[propertyName] = {
            default: ComponentUtil.VUE_OMITTED_PROPERTY,
        };
    });
    const model = {
        prop: 'rowDataModel',
        event: 'data-model-changed',
    };
    return [props, computed, watch, model];
};
