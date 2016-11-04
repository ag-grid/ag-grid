/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector } from '../di/injector';
import { AppView } from './view';
export declare class ElementInjector extends Injector {
    private _view;
    private _nodeIndex;
    constructor(_view: AppView<any>, _nodeIndex: number);
    get(token: any, notFoundValue?: any): any;
}
