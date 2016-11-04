/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OnChanges, SimpleChanges } from '@angular/core';
import { EventEmitter } from '../../facade/async';
import { FormControl } from '../../model';
import { ControlValueAccessor } from '../control_value_accessor';
import { NgControl } from '../ng_control';
import { AsyncValidatorFn, Validator, ValidatorFn } from '../validators';
export declare const formControlBinding: any;
/**
 * @whatItDoes Syncs a standalone {@link FormControl} instance to a form control element.
 *
 * In other words, this directive ensures that any values written to the {@link FormControl}
 * instance programmatically will be written to the DOM element (model -> view). Conversely,
 * any values written to the DOM element through user input will be reflected in the
 * {@link FormControl} instance (view -> model).
 *
 * @howToUse
 *
 * Use this directive if you'd like to create and manage a {@link FormControl} instance directly.
 * Simply create a {@link FormControl}, save it to your component class, and pass it into the
 * {@link FormControlDirective}.
 *
 * This directive is designed to be used as a standalone control.  Unlike {@link FormControlName},
 * it does not require that your {@link FormControl} instance be part of any parent
 * {@link FormGroup}, and it won't be registered to any {@link FormGroupDirective} that
 * exists above it.
 *
 * **Get the value**: the `value` property is always synced and available on the
 * {@link FormControl} instance. See a full list of available properties in
 * {@link AbstractControl}.
 *
 * **Set the value**: You can pass in an initial value when instantiating the {@link FormControl},
 * or you can set it programmatically later using {@link AbstractControl.setValue} or
 * {@link AbstractControl.patchValue}.
 *
 * **Listen to value**: If you want to listen to changes in the value of the control, you can
 * subscribe to the {@link AbstractControl.valueChanges} event.  You can also listen to
 * {@link AbstractControl.statusChanges} to be notified when the validation status is
 * re-calculated.
 *
 * ### Example
 *
 * {@example forms/ts/simpleFormControl/simple_form_control_example.ts region='Component'}
 *
 * * **npm package**: `@angular/forms`
 *
 * * **NgModule**: `ReactiveFormsModule`
 *
 *  @stable
 */
export declare class FormControlDirective extends NgControl implements OnChanges {
    viewModel: any;
    form: FormControl;
    model: any;
    update: EventEmitter<{}>;
    isDisabled: boolean;
    constructor(validators: Array<Validator | ValidatorFn>, asyncValidators: Array<Validator | AsyncValidatorFn>, valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    path: string[];
    validator: ValidatorFn;
    asyncValidator: AsyncValidatorFn;
    control: FormControl;
    viewToModelUpdate(newValue: any): void;
    private _isControlChanged(changes);
}
