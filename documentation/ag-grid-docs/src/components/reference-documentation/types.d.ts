import { type Framework } from '@ag-grid-types';

export type Overrides = {
    meta: MetaTag;
    [key: string]: any;
};

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
export type DocEntryMap = Record<string, DocEntry | ChildDocEntry>;
type DocEntry = {
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
export interface InterfaceHierarchyOverrides {
    exclude?: string[];
    include?: string[];
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
    interfaceHierarchyOverrides: InterfaceHierarchyOverrides;
    /** We check for properties that are not present in the source code. Set this to true to allow this property to be include
     * even though there is no matching code property for it.
     */
    overrideMissingPropCheck?: true;
}
export interface ObjectCode {
    framework: Framework;
    id: string;
    breadcrumbs?: Record<string, string>;
    properties: Properties;
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
        tags: { name: string; comment: string }[];
        comment: string;
        all: string;
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
    lookupRoot?: string;
    lookups?: {
        codeLookup: Record<string, CodeEntry>;
        interfaces: Record<string, InterfaceEntry>;
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
    /** Sore the properties alphabetically*/
    sortAlphabetically?: boolean;
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

    /** A regular expression limiting the names that should appear */
    namePattern: string;

    /** Show the description of what an initial property is against initial properties */
    showInitialDescription?: boolean;

    /** Override link shown for initial properties */
    initialLink?: string;
}

export type Properties = DocEntryMap | DocEntry | ChildDocEntry;
export type SectionProps = {
    title: string;
    framework: Framework;
    names?: string[];
    properties: Properties;
    config: Config;
    breadcrumbs?: Record<string, string>;
    meta?: MetaTag;
    isInline?: boolean;
};
export type PropertyCall = {
    framework: Framework;
    id: string;
    name: string;
    definition: DocEntry | ChildDocEntry;
    config: Config;
};
export type FunctionCode = {
    framework: Framework;
    name: string;
    type: PropertyType | string;
    config: Config;
};

export interface DocProperties {
    type: 'properties';
    properties: Properties;
    meta: MetaTag;
}
export interface DocCode {
    type: 'code';
    code: string;
}

export type InterfaceDocumentationModel = DocProperties | DocCode;

export interface SingleApiModel {
    type: 'single';
    title: string;
    properties: Properties;
    config: Config;
    meta: MetaTag;
}

export interface MultipleApiModel {
    type: 'multiple';
    entries: [
        string,
        {
            properties: ChildDocEntry | DocEntry;
            meta: MetaTag;
        },
    ][];
    config: Config;
}

export type ApiDocumentationModel = SingleApiModel | MultipleApiModel;
