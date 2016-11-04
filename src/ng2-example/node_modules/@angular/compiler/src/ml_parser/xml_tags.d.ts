/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TagContentType, TagDefinition } from './tags';
export declare class XmlTagDefinition implements TagDefinition {
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
    requireExtraParent(currentParent: string): boolean;
    isClosedByChild(name: string): boolean;
}
export declare function getXmlTagDefinition(tagName: string): XmlTagDefinition;
