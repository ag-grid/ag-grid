/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ParseSourceSpan } from '../parse_util';
export declare class Message {
    nodes: Node[];
    placeholders: {
        [name: string]: string;
    };
    placeholderToMsgIds: {
        [name: string]: string;
    };
    meaning: string;
    description: string;
    /**
     * @param nodes message AST
     * @param placeholders maps placeholder names to static content
     * @param placeholderToMsgIds maps placeholder names to translatable message IDs (used for ICU
     *                            messages)
     * @param meaning
     * @param description
     */
    constructor(nodes: Node[], placeholders: {
        [name: string]: string;
    }, placeholderToMsgIds: {
        [name: string]: string;
    }, meaning: string, description: string);
}
export interface Node {
    visit(visitor: Visitor, context?: any): any;
}
export declare class Text implements Node {
    value: string;
    sourceSpan: ParseSourceSpan;
    constructor(value: string, sourceSpan: ParseSourceSpan);
    visit(visitor: Visitor, context?: any): any;
}
export declare class Container implements Node {
    children: Node[];
    sourceSpan: ParseSourceSpan;
    constructor(children: Node[], sourceSpan: ParseSourceSpan);
    visit(visitor: Visitor, context?: any): any;
}
export declare class Icu implements Node {
    expression: string;
    type: string;
    cases: {
        [k: string]: Node;
    };
    sourceSpan: ParseSourceSpan;
    constructor(expression: string, type: string, cases: {
        [k: string]: Node;
    }, sourceSpan: ParseSourceSpan);
    visit(visitor: Visitor, context?: any): any;
}
export declare class TagPlaceholder implements Node {
    tag: string;
    attrs: {
        [k: string]: string;
    };
    startName: string;
    closeName: string;
    children: Node[];
    isVoid: boolean;
    sourceSpan: ParseSourceSpan;
    constructor(tag: string, attrs: {
        [k: string]: string;
    }, startName: string, closeName: string, children: Node[], isVoid: boolean, sourceSpan: ParseSourceSpan);
    visit(visitor: Visitor, context?: any): any;
}
export declare class Placeholder implements Node {
    value: string;
    name: string;
    sourceSpan: ParseSourceSpan;
    constructor(value: string, name: string, sourceSpan: ParseSourceSpan);
    visit(visitor: Visitor, context?: any): any;
}
export declare class IcuPlaceholder implements Node {
    value: Icu;
    name: string;
    sourceSpan: ParseSourceSpan;
    constructor(value: Icu, name: string, sourceSpan: ParseSourceSpan);
    visit(visitor: Visitor, context?: any): any;
}
export interface Visitor {
    visitText(text: Text, context?: any): any;
    visitContainer(container: Container, context?: any): any;
    visitIcu(icu: Icu, context?: any): any;
    visitTagPlaceholder(ph: TagPlaceholder, context?: any): any;
    visitPlaceholder(ph: Placeholder, context?: any): any;
    visitIcuPlaceholder(ph: IcuPlaceholder, context?: any): any;
}
