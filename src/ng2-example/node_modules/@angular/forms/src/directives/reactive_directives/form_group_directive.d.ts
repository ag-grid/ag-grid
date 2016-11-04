/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OnChanges, SimpleChanges } from '@angular/core';
import { EventEmitter } from '../../facade/async';
import { FormArray, FormControl, FormGroup } from '../../model';
import { ControlContainer } from '../control_container';
import { Form } from '../form_interface';
import { FormControlName } from './form_control_name';
import { FormArrayName, FormGroupName } from './form_group_name';
export declare const formDirectiveProvider: any;
/**
 * @whatItDoes Binds an existing {@link FormGroup} to a DOM element.
 *
 * @howToUse
 *
 * This directive accepts an existing {@link FormGroup} instance. It will then use this
 * {@link FormGroup} instance to match any child {@link FormControl}, {@link FormGroup},
 * and {@link FormArray} instances to child {@link FormControlName}, {@link FormGroupName},
 * and {@link FormArrayName} directives.
 *
 * **Set value**: You can set the form's initial value when instantiating the
 * {@link FormGroup}, or you can set it programmatically later using the {@link FormGroup}'s
 * {@link AbstractControl.setValue} or {@link AbstractControl.patchValue} methods.
 *
 * **Listen to value**: If you want to listen to changes in the value of the form, you can subscribe
 * to the {@link FormGroup}'s {@link AbstractControl.valueChanges} event.  You can also listen to
 * its {@link AbstractControl.statusChanges} event to be notified when the validation status is
 * re-calculated.
 *
 * Furthermore, you can listen to the directive's `ngSubmit` event to be notified when the user has
 * triggered a form submission. The `ngSubmit` event will be emitted with the original form
 * submission event.
 *
 * ### Example
 *
 * In this example, we create form controls for first name and last name.
 *
 * {@example forms/ts/simpleFormGroup/simple_form_group_example.ts region='Component'}
 *
 * **npm package**: `@angular/forms`
 *
 * **NgModule**: {@link ReactiveFormsModule}
 *
 *  @stable
 */
export declare class FormGroupDirective extends ControlContainer implements Form, OnChanges {
    private _validators;
    private _asyncValidators;
    private _submitted;
    private _oldForm;
    directives: FormControlName[];
    form: FormGroup;
    ngSubmit: EventEmitter<{}>;
    constructor(_validators: any[], _asyncValidators: any[]);
    ngOnChanges(changes: SimpleChanges): void;
    submitted: boolean;
    formDirective: Form;
    control: FormGroup;
    path: string[];
    addControl(dir: FormControlName): FormControl;
    getControl(dir: FormControlName): FormControl;
    removeControl(dir: FormControlName): void;
    addFormGroup(dir: FormGroupName): void;
    removeFormGroup(dir: FormGroupName): void;
    getFormGroup(dir: FormGroupName): FormGroup;
    addFormArray(dir: FormArrayName): void;
    removeFormArray(dir: FormArrayName): void;
    getFormArray(dir: FormArrayName): FormArray;
    updateModel(dir: FormControlName, value: any): void;
    onSubmit($event: Event): boolean;
    onReset(): void;
    resetForm(value?: any): void;
    private _updateRegistrations();
    private _updateValidators();
    private _checkFormPresent();
}
