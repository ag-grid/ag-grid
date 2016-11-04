import { ParseError, ParseSourceSpan } from '../parse_util';
import * as html from './ast';
import { InterpolationConfig } from './interpolation_config';
import { TagDefinition } from './tags';
export declare class TreeError extends ParseError {
    elementName: string;
    static create(elementName: string, span: ParseSourceSpan, msg: string): TreeError;
    constructor(elementName: string, span: ParseSourceSpan, msg: string);
}
export declare class ParseTreeResult {
    rootNodes: html.Node[];
    errors: ParseError[];
    constructor(rootNodes: html.Node[], errors: ParseError[]);
}
export declare class Parser {
    getTagDefinition: (tagName: string) => TagDefinition;
    constructor(getTagDefinition: (tagName: string) => TagDefinition);
    parse(source: string, url: string, parseExpansionForms?: boolean, interpolationConfig?: InterpolationConfig): ParseTreeResult;
}
