import { markRaw, toRaw } from 'vue';

import { _ALL_GRID_OPTIONS, _BOOLEAN_GRID_OPTIONS, _PUBLIC_EVENTS, _processOnChange } from 'ag-grid-community';

export const kebabProperty = (property: string) => {
    return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

export const kebabNameToAttrEventName = (kebabName: string) => {
    // grid-ready for example would become onGrid-ready in Vue
    return `on${kebabName.charAt(0).toUpperCase()}${kebabName.substring(1, kebabName.length)}`;
};

export const convertToRaw = (value: any) => (value ? (Object.isFrozen(value) ? value : markRaw(toRaw(value))) : value);

export interface Properties {
    [propertyName: string]: any;
}

export const getAgGridProperties = (): [Properties, Properties, Properties] => {
    const props: Properties = {};

    // for example, 'grid-ready' would become 'onGrid-ready': undefined
    // without this emitting events results in a warning
    // and adding 'grid-ready' (and variations of this to the emits option in AgGridVue doesn't help either)
    const eventNameAsProps = _PUBLIC_EVENTS.map((eventName: string) =>
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

    _ALL_GRID_OPTIONS
        .filter((propertyName: string) => propertyName != 'gridOptions') // dealt with in AgGridVue itself
        .forEach((propertyName: string) => {
            // https://vuejs.org/guide/components/props.html#prop-validation
            // The Boolean absent props will be cast to false. You can change this by setting a default for it — i.e.: default: undefined to behave as a non-Boolean prop.
            props[propertyName] = {
                default: undefined,
                type: _BOOLEAN_GRID_OPTIONS.includes(propertyName as any) ? Boolean : undefined,
            };

            watch[propertyName] = {
                handler(currentValue: any, previousValue: any) {
                    let currValue = currentValue;

                    if (propertyName === 'rowData' && currentValue != undefined) {
                        // Prevent the grids internal edits from being reactive
                        currValue = convertToRaw(currentValue);
                    }

                    this.batchChanges[propertyName] = currValue;
                    if (this.batchTimeout == null) {
                        this.batchTimeout = setTimeout(() => {
                            // Clear the timeout before processing the changes in case processChanges triggers another change.
                            this.batchTimeout = null;
                            _processOnChange(this.batchChanges, this.api);
                            this.batchChanges = markRaw({});
                        }, 0);
                    }
                },
                deep: true,
            };
        });

    return [props, computed, watch];
};
