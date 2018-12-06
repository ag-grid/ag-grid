import {ComponentUtil} from 'ag-grid-community';

export interface Properties {
    [propertyName: string]: any;
}

export const getAgGridProperties = (): [Properties, Properties] => {

// spl for later
// const data: Properties = {};
// ComponentUtil.BOOLEAN_PROPERTIES
//     .concat(ComponentUtil.STRING_PROPERTIES)
//     .concat(ComponentUtil.ARRAY_PROPERTIES)
//     .concat(ComponentUtil.OBJECT_PROPERTIES)
//     .concat(ComponentUtil.NUMBER_PROPERTIES)
//     .forEach((property) => {
//         data[`vue${property}`] = 'x';
//     });

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
    ComponentUtil.EVENTS.forEach((eventName) => {
        props[eventName] = {};
    });

    return [props, watch];
};

