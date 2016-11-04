/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { EventEmitter } from '../facade/async';
import { FormControl } from '../model';
import { ControlContainer } from './control_container';
import { ControlValueAccessor } from './control_value_accessor';
import { NgControl } from './ng_control';
import { AsyncValidatorFn, Validator, ValidatorFn } from './validators';
export declare const formControlBinding: any;
/**
 * @whatItDoes Creates a {@link FormControl} instance from a domain model and binds it
 * to a form control element.
 *
 * The {@link FormControl} instance will track the value, user interaction, and
 * validation status of the control and keep the view synced with the model. If used
 * within a parent form, the directive will also register itself with the form as a child
 * control.
 *
 * @howToUse
 *
 * This directive can be used by itself or as part of a larger form. All you need is the
 * `ngModel` selector to activate it.
 *
 * It accepts a domain model as an optional {@link @Input}. If you have a one-way binding
 * to `ngModel` with `[]` syntax, changing the value of the domain model in the component
 * class will set the value in the view. If you have a two-way binding with `[()]` syntax
 * (also known as 'banana-box syntax'), the value in the UI will always be synced back to
 * the domain model in your class as well.
 *
 * If you wish to inspect the properties of the associated {@link FormControl} (like
 * validity state), you can also export the directive into a local template variable using
 * `ngModel` as the key (ex: `#myVar="ngModel"`). You can then access the control using the
 * directive's `control` property, but most properties you'll need (like `valid` and `dirty`)
 * will fall through to the control anyway, so you can access them directly. You can see a
 * full list of properties directly available in {@link AbstractControlDirective}.
 *
 * The following is an example of a simple standalone control using `ngModel`:
 *
 * {@example forms/ts/simpleNgModel/simple_ng_model_example.ts region='Component'}
 *
 * When using the `ngModel` within `<form>` tags, you'll also need to supply a `name` attribute
 * so that the control can be registered with the parent form under that name.
 *
 * It's worth noting that in the context of a parent form, you often can skip one-way or
 * two-way binding because the parent form will sync the value for you. You can access
 * its properties by exporting it into a local template variable using `ngForm` (ex:
 * `#f="ngForm"`). Then you can pass it where it needs to go on submit.
 *
 * If you do need to populate initial values into your form, using a one-way binding for
 * `ngModel` tends to be sufficient as long as you use the exported form's value rather
 * than the domain model's value on submit.
 *
 * Take a look at an example of using `ngModel` within a form:
 *
 * {@example forms/ts/simpleForm/simple_form_example.ts region='Component'}
 *
 * To see `ngModel` examples with different form control types, see:
 *
 * * Radio buttons: {@link RadioControlValueAccessor}
 * * Selects: {@link SelectControlValueAccessor}
 *
 * **npm package**: `@angular/forms`
 *
 * **NgModule**: `FormsModule`
 *
 *  @stable
 */
export declare class NgModel extends NgControl implements OnChanges, OnDestroy {
    viewModel: any;
    name: string;
    isDisabled: boolean;
    model: any;
    options: {
        name?: string;
        standalone?: boolean;
    };
    update: EventEmitter<{}>;
    constructor(parent: ControlContainer, validators: Array<Validator | ValidatorFn>, asyncValidators: Array<Validator | AsyncValidatorFn>, valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    control: FormControl;
    path: string[];
    formDirective: any;
    validator: ValidatorFn;
    asyncValidator: AsyncValidatorFn;
    viewToModelUpdate(newValue: any): void;
    private _setUpControl();
    private _isStandalone();
    private _setUpStandalone();
    private _checkForErrors();
    private _checkParentType();
    private _checkName();
    private _updateValue(value);
    private _updateDisabled(changes);
}
