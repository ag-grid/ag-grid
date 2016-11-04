/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export declare enum TagContentType {
    RAW_TEXT = 0,
    ESCAPABLE_RAW_TEXT = 1,
    PARSABLE_DATA = 2,
}
export interface TagDefinition {
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
export declare function splitNsName(elementName: string): [string, string];
export declare function getNsPrefix(fullName: string): string;
export declare function mergeNsAndName(prefix: string, localName: string): string;
export declare const NAMED_ENTITIES: {
    [k: string]: string;
};
