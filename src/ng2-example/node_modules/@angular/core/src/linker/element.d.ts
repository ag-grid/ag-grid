/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector } from '../di/injector';
import { ElementRef } from './element_ref';
import { QueryList } from './query_list';
import { AppView } from './view';
import { ViewContainerRef_ } from './view_container_ref';
/**
 * An AppElement is created for elements that have a ViewContainerRef,
 * a nested component or a <template> element to keep data around
 * that is needed for later instantiations.
 */
export declare class AppElement {
    index: number;
    parentIndex: number;
    parentView: AppView<any>;
    nativeElement: any;
    nestedViews: AppView<any>[];
    componentView: AppView<any>;
    component: any;
    componentConstructorViewQueries: QueryList<any>[];
    constructor(index: number, parentIndex: number, parentView: AppView<any>, nativeElement: any);
    elementRef: ElementRef;
    vcRef: ViewContainerRef_;
    initComponent(component: any, componentConstructorViewQueries: QueryList<any>[], view: AppView<any>): void;
    parentInjector: Injector;
    injector: Injector;
    mapNestedViews(nestedViewClass: any, callback: Function): any[];
    moveView(view: AppView<any>, currentIndex: number): void;
    attachView(view: AppView<any>, viewIndex: number): void;
    detachView(viewIndex: number): AppView<any>;
}
