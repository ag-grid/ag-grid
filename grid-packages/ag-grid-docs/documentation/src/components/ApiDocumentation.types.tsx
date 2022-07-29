interface MetaTag {
    displayName: string;
    description: string;
    page: {
        url: string;
        name: string;
    };
    type?: string;
    isEvent?: boolean;
    /** Suppress the missing property check. Needed for events as they are dynamic and so do not appear in src code */
    suppressMissingPropCheck?: true;
}
export type DocEntryMap = {
    meta?: MetaTag;
} & {
        [key in string]: DocEntry | ChildDocEntry;
    };
type DocEntry = {
    meta?: MetaTag;
    options?: never;
    more?: never;
    type?: never;
} & {
    [key: string]: DocEntryMap | ChildDocEntry;
};
export interface PropertyType {
    /** @deprecated This should be removed when all the old json files have been updated to use code types instead of hard coded. */
    parameters?: {
        [key in string]: string;
    };
    arguments?: {
        [key in string]: string;
    };
    returnType?: string;
    /** True if property is defined with ? i.e pinned?: boolean Currently only applied to doc-interfaces.AUTO */
    optional?: boolean;
}
export interface ChildDocEntry {
    meta?: never;
    more?: {
        name: string;
        url: string;
    };
    description?: string;
    isRequired?: boolean;
    strikeThrough?: boolean;
    options?: string[];
    default?: string;
    type: PropertyType | string;
    interfaceHierarchyOverrides: {
        exclude?: string[],
        include?: string[]
    },
    /** We check for properties that are not present in the source code. Set this to true to allow this property to be include
     * even though there is no matching code property for it.
     */
    overrideMissingPropCheck?: true;

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

interface BaseInterface {
    description?: string;
}

export interface IEvent extends BaseInterface {
    meta: {
        isTypeAlias?: never;
        isEnum?: never;
        isCallSignature?: never;
        isEvent: true;
    };
    name: string;
    type?: never;
}
interface IEntry extends BaseInterface {
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
interface IEnum extends BaseInterface {
    meta: {
        isTypeAlias?: never;
        isEnum: true;
        isCallSignature?: never;
        isEvent?: never;
    };
    type: string[];
}
interface ITypeAlias extends BaseInterface {
    meta: {
        isTypeAlias: true;
        isEnum?: never;
        isCallSignature?: never;
        isEvent?: never;
    };
    type: string;
}
export interface ICallSignature extends BaseInterface {
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
    isEvent?: boolean;
    showSnippets?: boolean;
    lookups?: {
        codeLookup: {
            [key: string]: CodeEntry;
        };
        interfaces: {
            [key: string]: InterfaceEntry;
        };
        htmlLookup: {
            [key: string]: Record<string, string>;
        };
    };
    codeSrcProvided: string[];
    gridOpProp?: InterfaceEntry;
    /**
     * Just show the code interfaces without the table entry
     */
    codeOnly?: boolean;
    /**
     * Can be used to have the doc entries expanded by default.
     */
    defaultExpand?: boolean;
    /** Do not sort the sections, list as provided in JSON */
    suppressSort?: boolean;
    /**
     * By default we do not include the "See More" links when api-documentation is used with specific names selected.
     * This is because it is likely the link will be pointing to the same place it is currently being used.
     */
    hideMore?: boolean;
    /**
     * Hide the header to make it easy to just include the sections as part of doc pages
     */
    hideHeader?: boolean;
    /**
     * Override the headerLevel used.
     */
    headerLevel?: number;
    /** Set the margin-bottom value to override the default of 3em */
    overrideBottomMargin?: string;
    /** Suppress the missing property check. Needed for events as they are dynamic and so do not appear in src code */
    suppressMissingPropCheck?: true;

    /** The width of the left column in characters. Names will wrap if there are any longer names. */
    maxLeftColumnWidth: number;

    /** A regular expression limiting the names that should appear */
    namePattern: string;
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
export interface ApiProps {
    pageName?: string;
    framework?: string;
    source?: string;
    sources?: string[];
    section?: string;
    names?: string;
    config?: Config;
}
