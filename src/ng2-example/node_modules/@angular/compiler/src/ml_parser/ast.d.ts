/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ParseSourceSpan } from '../parse_util';
export interface Node {
    sourceSpan: ParseSourceSpan;
    visit(visitor: Visitor, context: any): any;
}
export declare class Text implements Node {
    value: string;
    sourceSpan: ParseSourceSpan;
    constructor(value: string, sourceSpan: ParseSourceSpan);
    visit(visitor: Visitor, context: any): any;
}
export declare class Expansion implements Node {
    switchValue: string;
    type: string;
    cases: ExpansionCase[];
    sourceSpan: ParseSourceSpan;
    switchValueSourceSpan: ParseSourceSpan;
    constructor(switchValue: string, type: string, cases: ExpansionCase[], sourceSpan: ParseSourceSpan, switchValueSourceSpan: ParseSourceSpan);
    visit(visitor: Visitor, context: any): any;
}
export declare class ExpansionCase implements Node {
    value: string;
    expression: Node[];
    sourceSpan: ParseSourceSpan;
    valueSourceSpan: ParseSourceSpan;
    expSourceSpan: ParseSourceSpan;
    constructor(value: string, expression: Node[], sourceSpan: ParseSourceSpan, valueSourceSpan: ParseSourceSpan, expSourceSpan: ParseSourceSpan);
    visit(visitor: Visitor, context: any): any;
}
export declare class Attribute implements Node {
    name: string;
    value: string;
    sourceSpan: ParseSourceSpan;
    valueSpan: ParseSourceSpan;
    constructor(name: string, value: string, sourceSpan: ParseSourceSpan, valueSpan?: ParseSourceSpan);
    visit(visitor: Visitor, context: any): any;
}
export declare class Element implements Node {
    name: string;
    attrs: Attribute[];
    children: Node[];
    sourceSpan: ParseSourceSpan;
    startSourceSpan: ParseSourceSpan;
    endSourceSpan: ParseSourceSpan;
    constructor(name: string, attrs: Attribute[], children: Node[], sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan);
    visit(visitor: Visitor, context: any): any;
}
export declare class Comment implements Node {
    value: string;
    sourceSpan: ParseSourceSpan;
    constructor(value: string, sourceSpan: ParseSourceSpan);
    visit(visitor: Visitor, context: any): any;
}
export interface Visitor {
    visit?(node: Node, context: any): any;
    visitElement(element: Element, context: any): any;
    visitAttribute(attribute: Attribute, context: any): any;
    visitText(text: Text, context: any): any;
    visitComment(comment: Comment, context: any): any;
    visitExpansion(expansion: Expansion, context: any): any;
    visitExpansionCase(expansionCase: ExpansionCase, context: any): any;
}
export declare function visitAll(visitor: Visitor, nodes: Node[], context?: any): any[];
