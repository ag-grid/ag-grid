import { JSX_ATTRIBUTE_TYPE } from '../constants';

export interface Attribute {
    type?: string;
    name: string;
    value: any;
}

export const getAttributeValue = ({ attributes = [], name }: { attributes?: Attribute[]; name: string }) => {
    const attr = attributes.find((attr) => attr.name === name);

    if (attr === undefined) {
        return;
    }
    return attr?.value?.type === JSX_ATTRIBUTE_TYPE ? attr.value.value : attr?.value;
};
