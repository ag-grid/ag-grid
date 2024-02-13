export interface Attribute {
    type?: string;
    name: string;
    value: any;
}

export const getAttributeValue = ({ attributes, name }: { attributes: Attribute[]; name: string }) =>
    attributes.find((attr) => attr.name === name)?.value;
