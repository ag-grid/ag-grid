/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Type } from '@angular/core';
export { CheckboxControlValueAccessor } from './directives/checkbox_value_accessor';
export { ControlValueAccessor } from './directives/control_value_accessor';
export { DefaultValueAccessor } from './directives/default_value_accessor';
export { NgControl } from './directives/ng_control';
export { NgControlStatus, NgControlStatusGroup } from './directives/ng_control_status';
export { NgForm } from './directives/ng_form';
export { NgModel } from './directives/ng_model';
export { NgModelGroup } from './directives/ng_model_group';
export { NumberValueAccessor } from './directives/number_value_accessor';
export { RadioControlValueAccessor } from './directives/radio_control_value_accessor';
export { FormControlDirective } from './directives/reactive_directives/form_control_directive';
export { FormControlName } from './directives/reactive_directives/form_control_name';
export { FormGroupDirective } from './directives/reactive_directives/form_group_directive';
export { FormArrayName, FormGroupName } from './directives/reactive_directives/form_group_name';
export { NgSelectOption, SelectControlValueAccessor } from './directives/select_control_value_accessor';
export { NgSelectMultipleOption, SelectMultipleControlValueAccessor } from './directives/select_multiple_control_value_accessor';
export { MaxLengthValidator, MinLengthValidator, PatternValidator, RequiredValidator } from './directives/validators';
export declare const SHARED_FORM_DIRECTIVES: Type<any>[];
export declare const TEMPLATE_DRIVEN_DIRECTIVES: Type<any>[];
export declare const REACTIVE_DRIVEN_DIRECTIVES: Type<any>[];
/**
 * A list of all the form directives.
 *
 * @stable
 */
export declare const FORM_DIRECTIVES: Type<any>[][];
/**
 * @stable
 */
export declare const REACTIVE_FORM_DIRECTIVES: Type<any>[][];
/**
 * Internal module used for sharing directives between FormsModule and ReactiveFormsModule
 */
export declare class InternalFormsSharedModule {
}
