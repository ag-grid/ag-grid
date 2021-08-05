interface MetaTag {
    displayName: string;
    description: string;
    page: {
        url: string;
        name: string;
    };
    type?: string;
}
export type DocEntryMap = {
    meta?: MetaTag;
} & {
        [key in string]: DocEntry | ChildDocEntry;
    };
type DocEntry = {
    meta?: MetaTag;
    relevantTo?: never;
    options?: never;
    more?: never;
    type?: never;
} & {
    [key: string]: DocEntryMap | ChildDocEntry;
};
export interface PropertyType {
    parameters?: {
        [key in string]: string;
    };
    arguments?: {
        [key in string]: string;
    };
    returnType?: string;
}
interface ChildDocEntry {
    meta?: never;
    relevantTo?: string[];
    more?: {
        name: string;
        url: string;
    };
    description?: string;
    isRequired?: boolean;
    options?: string[];
    default?: string;
    type: PropertyType | string;
}
export interface ObjectCode {
    framework?: string;
    id?: string;
    breadcrumbs?: {
        [key in string]: string;
    };
    properties: DocEntryMap;
}
interface CodeEntry {
    description?: string;
    type: PropertyType;
}
export type InterfaceEntry = IEntry | ICallSignature | ITypeAlias | IEnum | IEvent;
export interface IEvent {
    meta: {
        isTypeAlias?: never;
        isEnum?: never;
        isCallSignature?: never;
        isEvent: true;
    };
    name: string;
    type?: never;
}
interface IEntry {
    meta: {
        isTypeAlias?: never;
        isEnum?: never;
        isCallSignature?: never;
        isEvent?: never;
    };
    type: {
        [key in string]: string;
    };
}
interface IEnum {
    meta: {
        isTypeAlias?: never;
        isEnum: true;
        isCallSignature?: never;
        isEvent?: never;
    };
    type: string[];
}
interface ITypeAlias {
    meta: {
        isTypeAlias: true;
        isEnum?: never;
        isCallSignature?: never;
        isEvent?: never;
    };
    type: string;
}
export interface ICallSignature {
    meta: {
        isTypeAlias?: never;
        isEnum?: never;
        isCallSignature: true;
        isEvent?: never;
    };
    type: {
        arguments: {
            [key in string]: string;
        };
        returnType: string;
    };
}
export interface Config {
    isSubset?: boolean;
    isApi?: boolean;
    showSnippets?: boolean;
    lookups?: {
        codeLookup: {
            [key: string]: CodeEntry;
        };
        interfaces: {
            [key: string]: InterfaceEntry;
        };
    };
    gridOpProp?: InterfaceEntry;
}
export type SectionProps = {
    framework: string;
    title: string;
    properties: DocEntryMap | DocEntry | ChildDocEntry;
    config: Config;
    breadcrumbs?: {
        [key in string]: string;
    };
    names?: string[];
};
export type PropertyCall = {
    framework: string;
    id: string;
    name: string;
    definition: DocEntry | ChildDocEntry;
    config: Config;
};
export type FunctionCode = {
    framework: string;
    name: string;
    type: PropertyType | string;
    config: Config;
};
interface ApiProps {
    pageName?: string;
    framework?: string;
    source?: string;
    sources?: string[];
    section?: string;
    names?: string;
    config?: {};
}
