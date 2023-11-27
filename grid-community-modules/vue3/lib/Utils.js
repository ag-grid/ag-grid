import { ComponentUtil } from '@ag-grid-community/core';
export const kebabProperty = (property) => {
    return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};
export const kebabNameToAttrEventName = (kebabName) => {
    // grid-ready for example would become onGrid-ready in Vue
    return `on${kebabName.charAt(0).toUpperCase()}${kebabName.substring(1, kebabName.length)}`;
};
export const getAgGridProperties = () => {
    const props = {};
    // for example, 'grid-ready' would become 'onGrid-ready': undefined
    // without this emitting events results in a warning
    // and adding 'grid-ready' (and variations of this to the emits option in AgGridVue doesn't help either)
    const eventNameAsProps = ComponentUtil.PUBLIC_EVENTS.map((eventName) => kebabNameToAttrEventName(kebabProperty(eventName)));
    eventNameAsProps.forEach((eventName) => props[eventName] = undefined);
    const computed = {
        props() {
            const options = {};
            ComponentUtil.ALL_PROPERTIES.forEach((propertyName) => {
                var _a;
                if (this[propertyName] === ComponentUtil.VUE_OMITTED_PROPERTY) {
                    return;
                }
                if (propertyName in this || propertyName in this.gridOptions) {
                    options[propertyName] = (_a = this[propertyName]) !== null && _a !== void 0 ? _a : this.gridOptions[propertyName];
                }
            });
            return options;
        },
    };
    const watch = {
        modelValue: {
            handler(currentValue, previousValue) {
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
            deep: true
        },
        props: {
            handler(currentValue, previousValue) {
                if (!this.gridCreated || !this.api) {
                    return;
                }
                const changes = {};
                Object.entries(currentValue).forEach(([key, value]) => {
                    if (previousValue[key] === value)
                        return;
                    changes[key] = value;
                });
                ComponentUtil.processOnChange(changes, this.api);
            },
            deep: true,
        },
    };
    ComponentUtil.ALL_PROPERTIES
        .filter((propertyName) => propertyName != 'gridOptions') // dealt with in AgGridVue itself
        .forEach((propertyName) => {
        props[propertyName] = {
            default: ComponentUtil.VUE_OMITTED_PROPERTY,
        };
    });
    return [props, computed, watch];
};
