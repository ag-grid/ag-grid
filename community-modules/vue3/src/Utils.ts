import { ComponentUtil, _processOnChange } from '@ag-grid-community/core';

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

                _processOnChange({ rowData: currentValue }, this.api);
            },
            deep: true,
        },
    };

    ComponentUtil.ALL_PROPERTIES.filter((propertyName: string) => propertyName != 'gridOptions') // dealt with in AgGridVue itself
        .forEach((propertyName: string) => {
            props[propertyName] = {
                default: ComponentUtil.VUE_OMITTED_PROPERTY,
            };

            watch[propertyName] = {
                handler(currentValue: any, previousValue: any) {
                    this.batchChanges[propertyName] =
                        currentValue === ComponentUtil.VUE_OMITTED_PROPERTY ? undefined : currentValue;
                    if (this.batchTimeout == null) {
                        this.batchTimeout = setTimeout(() => {
                            // Clear the timeout before processing the changes in case processChanges triggers another change.
                            this.batchTimeout = null;
                            _processOnChange(this.batchChanges, this.api);
                            this.batchChanges = {};
                        }, 0);
                    }
                },
                deep: true,
            };
        });

    return [props, computed, watch];
};
