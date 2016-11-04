/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnDestroy, OpaqueToken, Renderer, Type } from '@angular/core';
import { ControlValueAccessor } from './control_value_accessor';
export declare const SELECT_MULTIPLE_VALUE_ACCESSOR: {
    provide: OpaqueToken;
    useExisting: Type<any>;
    multi: boolean;
};
/**
 * The accessor for writing a value and listening to changes on a select element.
 *
 * @stable
 */
export declare class SelectMultipleControlValueAccessor implements ControlValueAccessor {
    private _renderer;
    private _elementRef;
    value: any;
    onChange: (_: any) => void;
    onTouched: () => void;
    constructor(_renderer: Renderer, _elementRef: ElementRef);
    writeValue(value: any): void;
    registerOnChange(fn: (value: any) => any): void;
    registerOnTouched(fn: () => any): void;
    setDisabledState(isDisabled: boolean): void;
}
/**
 * Marks `<option>` as dynamic, so Angular can be notified when options change.
 *
 * ### Example
 *
 * ```
 * <select multiple name="city" ngModel>
 *   <option *ngFor="let c of cities" [value]="c"></option>
 * </select>
 * ```
 */
export declare class NgSelectMultipleOption implements OnDestroy {
    private _element;
    private _renderer;
    private _select;
    id: string;
    constructor(_element: ElementRef, _renderer: Renderer, _select: SelectMultipleControlValueAccessor);
    ngValue: any;
    value: any;
    ngOnDestroy(): void;
}
export declare const SELECT_DIRECTIVES: (typeof SelectMultipleControlValueAccessor | typeof NgSelectMultipleOption)[];
