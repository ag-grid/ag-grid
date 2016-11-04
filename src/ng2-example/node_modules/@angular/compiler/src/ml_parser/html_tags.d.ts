/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TagContentType, TagDefinition } from './tags';
export declare class HtmlTagDefinition implements TagDefinition {
    private closedByChildren;
    closedByParent: boolean;
    requiredParents: {
        [key: string]: boolean;
    };
    parentToAdd: string;
    implicitNamespacePrefix: string;
    contentType: TagContentType;
    isVoid: boolean;
    ignoreFirstLf: boolean;
    canSelfClose: boolean;
    constructor({closedByChildren, requiredParents, implicitNamespacePrefix, contentType, closedByParent, isVoid, ignoreFirstLf}?: {
        closedByChildren?: string[];
        closedByParent?: boolean;
        requiredParents?: string[];
        implicitNamespacePrefix?: string;
        contentType?: TagContentType;
        isVoid?: boolean;
        ignoreFirstLf?: boolean;
    });
    requireExtraParent(currentParent: string): boolean;
    isClosedByChild(name: string): boolean;
}
export declare function getHtmlTagDefinition(tagName: string): HtmlTagDefinition;
