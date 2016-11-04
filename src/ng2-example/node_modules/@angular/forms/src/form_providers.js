/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { InternalFormsSharedModule, REACTIVE_DRIVEN_DIRECTIVES, TEMPLATE_DRIVEN_DIRECTIVES } from './directives';
import { RadioControlRegistry } from './directives/radio_control_value_accessor';
import { FormBuilder } from './form_builder';
/**
 * The ng module for forms.
 * @stable
 */
export var FormsModule = (function () {
    function FormsModule() {
    }
    FormsModule.decorators = [
        { type: NgModule, args: [{
                    declarations: TEMPLATE_DRIVEN_DIRECTIVES,
                    providers: [RadioControlRegistry],
                    exports: [InternalFormsSharedModule, TEMPLATE_DRIVEN_DIRECTIVES]
                },] },
    ];
    /** @nocollapse */
    FormsModule.ctorParameters = [];
    return FormsModule;
}());
/**
 * The ng module for reactive forms.
 * @stable
 */
export var ReactiveFormsModule = (function () {
    function ReactiveFormsModule() {
    }
    ReactiveFormsModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [REACTIVE_DRIVEN_DIRECTIVES],
                    providers: [FormBuilder, RadioControlRegistry],
                    exports: [InternalFormsSharedModule, REACTIVE_DRIVEN_DIRECTIVES]
                },] },
    ];
    /** @nocollapse */
    ReactiveFormsModule.ctorParameters = [];
    return ReactiveFormsModule;
}());
//# sourceMappingURL=form_providers.js.map