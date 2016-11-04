/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ParseError, ParseSourceSpan } from '../parse_util';
import * as html from './ast';
/**
 * Expands special forms into elements.
 *
 * For example,
 *
 * ```
 * { messages.length, plural,
 *   =0 {zero}
 *   =1 {one}
 *   other {more than one}
 * }
 * ```
 *
 * will be expanded into
 *
 * ```
 * <ng-container [ngPlural]="messages.length">
 *   <template ngPluralCase="=0">zero</ng-container>
 *   <template ngPluralCase="=1">one</ng-container>
 *   <template ngPluralCase="other">more than one</ng-container>
 * </ng-container>
 * ```
 */
export declare function expandNodes(nodes: html.Node[]): ExpansionResult;
export declare class ExpansionResult {
    nodes: html.Node[];
    expanded: boolean;
    errors: ParseError[];
    constructor(nodes: html.Node[], expanded: boolean, errors: ParseError[]);
}
export declare class ExpansionError extends ParseError {
    constructor(span: ParseSourceSpan, errorMsg: string);
}
