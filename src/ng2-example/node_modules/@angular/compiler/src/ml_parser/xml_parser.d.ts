/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ParseTreeResult, Parser } from './parser';
export { ParseTreeResult, TreeError } from './parser';
export declare class XmlParser extends Parser {
    constructor();
    parse(source: string, url: string, parseExpansionForms?: boolean): ParseTreeResult;
}
