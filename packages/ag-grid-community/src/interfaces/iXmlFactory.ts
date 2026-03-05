/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface XmlElement {
    name: string;
    properties?: XmlAttributes;
    children?: XmlElement[];
    textNode?: string | null;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface HeaderElement {
    [key: string]: string | undefined;
    version?: string;
    standalone?: string;
    encoding?: string;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface XmlAttributes {
    prefixedAttributes?: PrefixedXmlAttributes[];
    rawMap?: any;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface PrefixedXmlAttributes {
    prefix: string;
    map: any;
}
