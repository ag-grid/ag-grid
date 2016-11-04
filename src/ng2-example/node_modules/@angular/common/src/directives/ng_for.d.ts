/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, DoCheck, IterableDiffers, OnChanges, SimpleChanges, TemplateRef, TrackByFn, ViewContainerRef } from '@angular/core';
export declare class NgForRow {
    $implicit: any;
    index: number;
    count: number;
    constructor($implicit: any, index: number, count: number);
    first: boolean;
    last: boolean;
    even: boolean;
    odd: boolean;
}
/**
 * The `NgFor` directive instantiates a template once per item from an iterable. The context for
 * each instantiated template inherits from the outer context with the given loop variable set
 * to the current item from the iterable.
 *
 * ### Local Variables
 *
 * `NgFor` provides several exported values that can be aliased to local variables:
 *
 * * `index` will be set to the current loop iteration for each template context.
 * * `first` will be set to a boolean value indicating whether the item is the first one in the
 *   iteration.
 * * `last` will be set to a boolean value indicating whether the item is the last one in the
 *   iteration.
 * * `even` will be set to a boolean value indicating whether this item has an even index.
 * * `odd` will be set to a boolean value indicating whether this item has an odd index.
 *
 * ### Change Propagation
 *
 * When the contents of the iterator changes, `NgFor` makes the corresponding changes to the DOM:
 *
 * * When an item is added, a new instance of the template is added to the DOM.
 * * When an item is removed, its template instance is removed from the DOM.
 * * When items are reordered, their respective templates are reordered in the DOM.
 * * Otherwise, the DOM element for that item will remain the same.
 *
 * Angular uses object identity to track insertions and deletions within the iterator and reproduce
 * those changes in the DOM. This has important implications for animations and any stateful
 * controls
 * (such as `<input>` elements which accept user input) that are present. Inserted rows can be
 * animated in, deleted rows can be animated out, and unchanged rows retain any unsaved state such
 * as user input.
 *
 * It is possible for the identities of elements in the iterator to change while the data does not.
 * This can happen, for example, if the iterator produced from an RPC to the server, and that
 * RPC is re-run. Even if the data hasn't changed, the second response will produce objects with
 * different identities, and Angular will tear down the entire DOM and rebuild it (as if all old
 * elements were deleted and all new elements inserted). This is an expensive operation and should
 * be avoided if possible.
 *
 * To customize the default tracking algorithm, `NgFor` supports `trackBy` option.
 * `trackBy` takes a function which has two arguments: `index` and `item`.
 * If `trackBy` is given, Angular tracks changes by the return value of the function.
 *
 * ### Syntax
 *
 * - `<li *ngFor="let item of items; let i = index; trackBy: trackByFn">...</li>`
 * - `<li template="ngFor let item of items; let i = index; trackBy: trackByFn">...</li>`
 *
 * With `<template>` element:
 *
 * ```
 * <template ngFor let-item [ngForOf]="items" let-i="index" [ngForTrackBy]="trackByFn">
 *   <li>...</li>
 * </template>
 * ```
 *
 * ### Example
 *
 * See a [live demo](http://plnkr.co/edit/KVuXxDp0qinGDyo307QW?p=preview) for a more detailed
 * example.
 *
 * @stable
 */
export declare class NgFor implements DoCheck, OnChanges {
    private _viewContainer;
    private _template;
    private _differs;
    private _cdr;
    ngForOf: any;
    ngForTrackBy: TrackByFn;
    private _differ;
    constructor(_viewContainer: ViewContainerRef, _template: TemplateRef<NgForRow>, _differs: IterableDiffers, _cdr: ChangeDetectorRef);
    ngForTemplate: TemplateRef<NgForRow>;
    ngOnChanges(changes: SimpleChanges): void;
    ngDoCheck(): void;
    private _applyChanges(changes);
    private _perViewChange(view, record);
}
