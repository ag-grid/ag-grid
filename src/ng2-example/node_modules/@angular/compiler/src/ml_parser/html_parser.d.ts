import { InterpolationConfig } from './interpolation_config';
import { ParseTreeResult, Parser } from './parser';
export { ParseTreeResult, TreeError } from './parser';
export declare class HtmlParser extends Parser {
    constructor();
    parse(source: string, url: string, parseExpansionForms?: boolean, interpolationConfig?: InterpolationConfig): ParseTreeResult;
}
