import { ComponentUtil } from 'ag-grid-community';

export const kebabProperty = (property: string) => {
    return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

export const kebabNameToAttrEventName = (kebabName: string) => {
    // grid-ready for example would become onGrid-ready in Vue
    return `on${kebabName.charAt(0).toUpperCase()}${kebabName.substring(1, kebabName.length)}`;
};

export interface Properties {
    [propertyName: string]: any;
}

export const getAgGridProperties = (): [Properties, Properties, Properties] => {
    const props: Properties = {};

    // for example, 'grid-ready' would become 'onGrid-ready': undefined
    // without this emitting events results in a warning
    // and adding 'grid-ready' (and variations of this to the emits option in AgGridVue doesn't help either)
    const eventNameAsProps = ComponentUtil.PUBLIC_EVENTS.map((eventName: string) =>
        kebabNameToAttrEventName(kebabProperty(eventName))
    );
    eventNameAsProps.forEach((eventName: string) => (props[eventName] = undefined));

    const computed: Properties = {};

    const watch: Properties = {
        modelValue: {
            handler(currentValue: any, previousValue: any) {
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
                        if (currentValue.every((item: any, index: number) => item === previousValue[index])) {
                            return;
                        }
                    }
                }

                ComponentUtil.processOnChange({ rowData: currentValue }, this.api, true);
            },
            deep: true,
        },
    };
    let timeout: number | null = null;
    let changes: { [key: string]: any } = {};
    ComponentUtil.ALL_PROPERTIES.filter((propertyName: string) => propertyName != 'gridOptions') // dealt with in AgGridVue itself
        .forEach((propertyName: string) => {
            props[propertyName] = {
                default: ComponentUtil.VUE_OMITTED_PROPERTY,
            };

            watch[propertyName] = {
                handler(currentValue: any, previousValue: any) {
                    changes[propertyName] =
                        currentValue === ComponentUtil.VUE_OMITTED_PROPERTY ? undefined : currentValue;
                    if (timeout == null) {
                        timeout = setTimeout(() => {
                            ComponentUtil.processOnChange(changes, this.api, true);
                            timeout = null;
                            changes = {};
                        }, 0);
                    }
                },
                deep: true,
            };
        });

    return [props, computed, watch];
};
