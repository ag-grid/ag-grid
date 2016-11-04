/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Observable } from '../facade/async';
import { AbstractControl } from '../model';
/**
 * Base class for control directives.
 *
 * Only used internally in the forms module.
 *
 * @stable
 */
export declare abstract class AbstractControlDirective {
    control: AbstractControl;
    value: any;
    valid: boolean;
    invalid: boolean;
    pending: boolean;
    errors: {
        [key: string]: any;
    };
    pristine: boolean;
    dirty: boolean;
    touched: boolean;
    untouched: boolean;
    disabled: boolean;
    enabled: boolean;
    statusChanges: Observable<any>;
    valueChanges: Observable<any>;
    path: string[];
    reset(value?: any): void;
}
