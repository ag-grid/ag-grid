/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector } from '../di';
import { Predicate } from '../facade/collection';
import { RenderDebugInfo } from '../render/api';
export declare class EventListener {
    name: string;
    callback: Function;
    constructor(name: string, callback: Function);
}
/**
 * @experimental All debugging apis are currently experimental.
 */
export declare class DebugNode {
    private _debugInfo;
    nativeNode: any;
    listeners: EventListener[];
    parent: DebugElement;
    constructor(nativeNode: any, parent: DebugNode, _debugInfo: RenderDebugInfo);
    injector: Injector;
    componentInstance: any;
    context: any;
    references: {
        [key: string]: any;
    };
    providerTokens: any[];
    source: string;
}
/**
 * @experimental All debugging apis are currently experimental.
 */
export declare class DebugElement extends DebugNode {
    name: string;
    properties: {
        [key: string]: any;
    };
    attributes: {
        [key: string]: string;
    };
    classes: {
        [key: string]: boolean;
    };
    styles: {
        [key: string]: string;
    };
    childNodes: DebugNode[];
    nativeElement: any;
    constructor(nativeNode: any, parent: any, _debugInfo: RenderDebugInfo);
    addChild(child: DebugNode): void;
    removeChild(child: DebugNode): void;
    insertChildrenAfter(child: DebugNode, newChildren: DebugNode[]): void;
    query(predicate: Predicate<DebugElement>): DebugElement;
    queryAll(predicate: Predicate<DebugElement>): DebugElement[];
    queryAllNodes(predicate: Predicate<DebugNode>): DebugNode[];
    children: DebugElement[];
    triggerEventHandler(eventName: string, eventObj: any): void;
}
/**
 * @experimental
 */
export declare function asNativeElements(debugEls: DebugElement[]): any;
/**
 * @experimental
 */
export declare function getDebugNode(nativeNode: any): DebugNode;
export declare function getAllDebugNodes(): DebugNode[];
export declare function indexDebugNode(node: DebugNode): void;
export declare function removeDebugNodeFromIndex(node: DebugNode): void;
