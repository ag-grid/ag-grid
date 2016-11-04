/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { EventEmitter } from '../../facade/async';
import { FormControl } from '../../model';
import { ControlContainer } from '../control_container';
import { ControlValueAccessor } from '../control_value_accessor';
import { NgControl } from '../ng_control';
import { AsyncValidatorFn, Validator, ValidatorFn } from '../validators';
export declare const controlNameBinding: any;
/**
 * @whatItDoes  Syncs a {@link FormControl} in an existing {@link FormGroup} to a form control
 * element by name.
 *
 * In other words, this directive ensures that any values written to the {@link FormControl}
 * instance programmatically will be written to the DOM element (model -> view). Conversely,
 * any values written to the DOM element through user input will be reflected in the
 * {@link FormControl} instance (view -> model).
 *
 * @howToUse
 *
 * This directive is designed to be used with a parent {@link FormGroupDirective} (selector:
 * `[formGroup]`).
 *
 * It accepts the string name of the {@link FormControl} instance you want to
 * link, and will look for a {@link FormControl} registered with that name in the
 * closest {@link FormGroup} or {@link FormArray} above it.
 *
 * **Access the control**: You can access the {@link FormControl} associated with
 * this directive by using the {@link AbstractControl.get} method.
 * Ex: `this.form.get('first');`
 *
 * **Get value**: the `value` property is always synced and available on the {@link FormControl}.
 * See a full list of available properties in {@link AbstractControl}.
 *
 *  **Set value**: You can set an initial value for the control when instantiating the
 *  {@link FormControl}, or you can set it programmatically later using
 *  {@link AbstractControl.setValue} or {@link AbstractControl.patchValue}.
 *
 * **Listen to value**: If you want to listen to changes in the value of the control, you can
 * subscribe to the {@link AbstractControl.valueChanges} event.  You can also listen to
 * {@link AbstractControl.statusChanges} to be notified when the validation status is
 * re-calculated.
 *
 * ### Example
 *
 * In this example, we create form controls for first name and last name.
 *
 * {@example forms/ts/simpleFormGroup/simple_form_group_example.ts region='Component'}
 *
 * To see `formControlName` examples with different form control types, see:
 *
 * * Radio buttons: {@link RadioControlValueAccessor}
 * * Selects: {@link SelectControlValueAccessor}
 *
 * **npm package**: `@angular/forms`
 *
 * **NgModule**: {@link ReactiveFormsModule}
 *
 *  @stable
 */
export declare class FormControlName extends NgControl implements OnChanges, OnDestroy {
    private _added;
    name: string;
    model: any;
    update: EventEmitter<{}>;
    isDisabled: boolean;
    constructor(parent: ControlContainer, validators: Array<Validator | ValidatorFn>, asyncValidators: Array<Validator | AsyncValidatorFn>, valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    viewToModelUpdate(newValue: any): void;
    path: string[];
    formDirective: any;
    validator: ValidatorFn;
    asyncValidator: AsyncValidatorFn;
    control: FormControl;
    private _checkParentType();
    private _setUpControl();
}
