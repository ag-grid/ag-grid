/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector } from '../di';
import { RenderDebugInfo } from '../render/api';
import { DebugAppView } from './view';
export declare class StaticNodeDebugInfo {
    providerTokens: any[];
    componentToken: any;
    refTokens: {
        [key: string]: any;
    };
    constructor(providerTokens: any[], componentToken: any, refTokens: {
        [key: string]: any;
    });
}
export declare class DebugContext implements RenderDebugInfo {
    private _view;
    private _nodeIndex;
    private _tplRow;
    private _tplCol;
    constructor(_view: DebugAppView<any>, _nodeIndex: number, _tplRow: number, _tplCol: number);
    private _staticNodeInfo;
    context: any;
    component: any;
    componentRenderElement: any;
    injector: Injector;
    renderNode: any;
    providerTokens: any[];
    source: string;
    references: {
        [key: string]: any;
    };
}
