/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AbstractControlDirective } from './abstract_control_directive';
import { ControlValueAccessor } from './control_value_accessor';
import { AsyncValidatorFn, ValidatorFn } from './validators';
/**
 * A base class that all control directive extend.
 * It binds a {@link FormControl} object to a DOM element.
 *
 * Used internally by Angular forms.
 *
 * @stable
 */
export declare abstract class NgControl extends AbstractControlDirective {
    name: string;
    valueAccessor: ControlValueAccessor;
    validator: ValidatorFn;
    asyncValidator: AsyncValidatorFn;
    abstract viewToModelUpdate(newValue: any): void;
}
