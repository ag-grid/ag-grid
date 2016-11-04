/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Directive, Inject, Input, Optional, Output, Self, forwardRef } from '@angular/core';
import { EventEmitter } from '../../facade/async';
import { NG_ASYNC_VALIDATORS, NG_VALIDATORS } from '../../validators';
import { NG_VALUE_ACCESSOR } from '../control_value_accessor';
import { NgControl } from '../ng_control';
import { ReactiveErrors } from '../reactive_errors';
import { composeAsyncValidators, composeValidators, isPropertyUpdated, selectValueAccessor, setUpControl } from '../shared';
export var formControlBinding = {
    provide: NgControl,
    useExisting: forwardRef(function () { return FormControlDirective; })
};
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
export var FormControlDirective = (function (_super) {
    __extends(FormControlDirective, _super);
    function FormControlDirective(validators, asyncValidators, valueAccessors) {
        _super.call(this);
        this.update = new EventEmitter();
        this._rawValidators = validators || [];
        this._rawAsyncValidators = asyncValidators || [];
        this.valueAccessor = selectValueAccessor(this, valueAccessors);
    }
    Object.defineProperty(FormControlDirective.prototype, "isDisabled", {
        set: function (isDisabled) { ReactiveErrors.disabledAttrWarning(); },
        enumerable: true,
        configurable: true
    });
    FormControlDirective.prototype.ngOnChanges = function (changes) {
        if (this._isControlChanged(changes)) {
            setUpControl(this.form, this);
            if (this.control.disabled && this.valueAccessor.setDisabledState) {
                this.valueAccessor.setDisabledState(true);
            }
            this.form.updateValueAndValidity({ emitEvent: false });
        }
        if (isPropertyUpdated(changes, this.viewModel)) {
            this.form.setValue(this.model);
            this.viewModel = this.model;
        }
    };
    Object.defineProperty(FormControlDirective.prototype, "path", {
        get: function () { return []; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormControlDirective.prototype, "validator", {
        get: function () { return composeValidators(this._rawValidators); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormControlDirective.prototype, "asyncValidator", {
        get: function () {
            return composeAsyncValidators(this._rawAsyncValidators);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormControlDirective.prototype, "control", {
        get: function () { return this.form; },
        enumerable: true,
        configurable: true
    });
    FormControlDirective.prototype.viewToModelUpdate = function (newValue) {
        this.viewModel = newValue;
        this.update.emit(newValue);
    };
    FormControlDirective.prototype._isControlChanged = function (changes) {
        return changes.hasOwnProperty('form');
    };
    FormControlDirective.decorators = [
        { type: Directive, args: [{ selector: '[formControl]', providers: [formControlBinding], exportAs: 'ngForm' },] },
    ];
    /** @nocollapse */
    FormControlDirective.ctorParameters = [
        { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALIDATORS,] },] },
        { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_ASYNC_VALIDATORS,] },] },
        { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALUE_ACCESSOR,] },] },
    ];
    FormControlDirective.propDecorators = {
        'form': [{ type: Input, args: ['formControl',] },],
        'model': [{ type: Input, args: ['ngModel',] },],
        'update': [{ type: Output, args: ['ngModelChange',] },],
        'isDisabled': [{ type: Input, args: ['disabled',] },],
    };
    return FormControlDirective;
}(NgControl));
//# sourceMappingURL=form_control_directive.js.map