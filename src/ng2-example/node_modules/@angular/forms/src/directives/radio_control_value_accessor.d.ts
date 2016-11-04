/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, Injector, OnDestroy, OnInit, Renderer } from '@angular/core';
import { ControlValueAccessor } from './control_value_accessor';
import { NgControl } from './ng_control';
export declare const RADIO_VALUE_ACCESSOR: any;
/**
 * Internal class used by Angular to uncheck radio buttons with the matching name.
 */
export declare class RadioControlRegistry {
    private _accessors;
    add(control: NgControl, accessor: RadioControlValueAccessor): void;
    remove(accessor: RadioControlValueAccessor): void;
    select(accessor: RadioControlValueAccessor): void;
    private _isSameGroup(controlPair, accessor);
}
/**
 * @whatItDoes  Writes radio control values and listens to radio control changes.
 *
 * Used by {@link NgModel}, {@link FormControlDirective}, and {@link FormControlName}
 * to keep the view synced with the {@link FormControl} model.
 *
 * @howToUse
 *
 * If you have imported the {@link FormsModule} or the {@link ReactiveFormsModule}, this
 * value accessor will be active on any radio control that has a form directive. You do
 * **not** need to add a special selector to activate it.
 *
 * ### How to use radio buttons with form directives
 *
 * To use radio buttons in a template-driven form, you'll want to ensure that radio buttons
 * in the same group have the same `name` attribute.  Radio buttons with different `name`
 * attributes do not affect each other.
 *
 * {@example forms/ts/radioButtons/radio_button_example.ts region='TemplateDriven'}
 *
 * When using radio buttons in a reactive form, radio buttons in the same group should have the
 * same `formControlName`. You can also add a `name` attribute, but it's optional.
 *
 * {@example forms/ts/reactiveRadioButtons/reactive_radio_button_example.ts region='Reactive'}
 *
 *  * **npm package**: `@angular/forms`
 *
 *  @stable
 */
export declare class RadioControlValueAccessor implements ControlValueAccessor, OnDestroy, OnInit {
    private _renderer;
    private _elementRef;
    private _registry;
    private _injector;
    onChange: () => void;
    onTouched: () => void;
    name: string;
    formControlName: string;
    value: any;
    constructor(_renderer: Renderer, _elementRef: ElementRef, _registry: RadioControlRegistry, _injector: Injector);
    ngOnInit(): void;
    ngOnDestroy(): void;
    writeValue(value: any): void;
    registerOnChange(fn: (_: any) => {}): void;
    fireUncheck(value: any): void;
    registerOnTouched(fn: () => {}): void;
    setDisabledState(isDisabled: boolean): void;
    private _checkName();
    private _throwNameError();
}
