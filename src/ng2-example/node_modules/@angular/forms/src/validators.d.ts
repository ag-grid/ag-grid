/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OpaqueToken } from '@angular/core';
import { AsyncValidatorFn, ValidatorFn } from './directives/validators';
import { AbstractControl } from './model';
/**
 * Providers for validators to be used for {@link FormControl}s in a form.
 *
 * Provide this using `multi: true` to add validators.
 *
 * ### Example
 *
 * {@example core/forms/ts/ng_validators/ng_validators.ts region='ng_validators'}
 * @stable
 */
export declare const NG_VALIDATORS: OpaqueToken;
/**
 * Providers for asynchronous validators to be used for {@link FormControl}s
 * in a form.
 *
 * Provide this using `multi: true` to add validators.
 *
 * See {@link NG_VALIDATORS} for more details.
 *
 * @stable
 */
export declare const NG_ASYNC_VALIDATORS: OpaqueToken;
/**
 * Provides a set of validators used by form controls.
 *
 * A validator is a function that processes a {@link FormControl} or collection of
 * controls and returns a map of errors. A null map means that validation has passed.
 *
 * ### Example
 *
 * ```typescript
 * var loginControl = new FormControl("", Validators.required)
 * ```
 *
 * @stable
 */
export declare class Validators {
    /**
     * Validator that requires controls to have a non-empty value.
     */
    static required(control: AbstractControl): {
        [key: string]: boolean;
    };
    /**
     * Validator that requires controls to have a value of a minimum length.
     */
    static minLength(minLength: number): ValidatorFn;
    /**
     * Validator that requires controls to have a value of a maximum length.
     */
    static maxLength(maxLength: number): ValidatorFn;
    /**
     * Validator that requires a control to match a regex to its value.
     */
    static pattern(pattern: string): ValidatorFn;
    /**
     * No-op validator.
     */
    static nullValidator(c: AbstractControl): {
        [key: string]: boolean;
    };
    /**
     * Compose multiple validators into a single function that returns the union
     * of the individual error maps.
     */
    static compose(validators: ValidatorFn[]): ValidatorFn;
    static composeAsync(validators: AsyncValidatorFn[]): AsyncValidatorFn;
}
