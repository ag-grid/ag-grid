import {ComponentUtil} from 'ag-grid-community';

export const kebabProperty = (property: string) => {
    return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

export const kebabNameToAttrEventName = (kebabName: string) => {
    // grid-ready for example would become onGrid-ready in Vue
    return `on${kebabName.charAt(0).toUpperCase()}${kebabName.substring(1, kebabName.length)}`
};

export interface Properties {
    [propertyName: string]: any;
}

export const getAgGridProperties = (): [Properties, Properties, Properties] => {
    const props: Properties = {};

    // for example, 'grid-ready' would become 'onGrid-ready': undefined
    // without this emitting events results in a warning
    // and adding 'grid-ready' (and variations of this to the emits option in AgGridVue doesn't help either)
    const eventNameAsProps = ComponentUtil.PUBLIC_EVENTS.map((eventName: string) => kebabNameToAttrEventName(kebabProperty(eventName)));
    eventNameAsProps.forEach((eventName: string) => props[eventName] = undefined)

    const computed: Properties = {
        props() {
            const options: { [key: string]: any } = {};
            ComponentUtil.ALL_PROPERTIES.forEach((propertyName: string) => {
                if (this[propertyName] === ComponentUtil.VUE_OMITTED_PROPERTY) { return; }
                if (propertyName in this || propertyName in this.gridOptions) {
                    options[propertyName] = this[propertyName] ?? this.gridOptions[propertyName];
                }
            });
            return options;
        },
    };
    const watch: Properties = {
        modelValue: {
            handler(currentValue: any, previousValue: any) {
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
            deep: true
        },
        props: {
            handler(currentValue: any, previousValue: any) {
                if (!this.gridCreated || !this.api) { return; }
                const changes: any = {};
                Object.entries(currentValue).forEach(([key, value]) => {
                    if (previousValue[key] === value) return;
                    changes[key] = value;
                });
                ComponentUtil.processOnChange(changes, this.api);
            },
            deep: true,
        },
    };
    ComponentUtil.ALL_PROPERTIES
        .filter((propertyName: string) => propertyName != 'gridOptions') // dealt with in AgGridVue itself
        .forEach((propertyName: string) => {
            props[propertyName] = {
                default: ComponentUtil.VUE_OMITTED_PROPERTY,
            };
        });

    return [props, computed, watch];
};

