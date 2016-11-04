import { EventEmitter } from '../facade/async';
import { AbstractControl, FormControl, FormGroup } from '../model';
import { ControlContainer } from './control_container';
import { Form } from './form_interface';
import { NgControl } from './ng_control';
import { NgModel } from './ng_model';
import { NgModelGroup } from './ng_model_group';
export declare const formDirectiveProvider: any;
/**
 * @whatItDoes Creates a top-level {@link FormGroup} instance and binds it to a form
 * to track aggregate form value and validation status.
 *
 * @howToUse
 *
 * As soon as you import the `FormsModule`, this directive becomes active by default on
 * all `<form>` tags.  You don't need to add a special selector.
 *
 * You can export the directive into a local template variable using `ngForm` as the key
 * (ex: `#myForm="ngForm"`). This is optional, but useful.  Many properties from the underlying
 * {@link FormGroup} instance are duplicated on the directive itself, so a reference to it
 * will give you access to the aggregate value and validity status of the form, as well as
 * user interaction properties like `dirty` and `touched`.
 *
 * To register child controls with the form, you'll want to use {@link NgModel} with a
 * `name` attribute.  You can also use {@link NgModelGroup} if you'd like to create
 * sub-groups within the form.
 *
 * You can listen to the directive's `ngSubmit` event to be notified when the user has
 * triggered a form submission. The `ngSubmit` event will be emitted with the original form
 * submission event.
 *
 * {@example forms/ts/simpleForm/simple_form_example.ts region='Component'}
 *
 * * **npm package**: `@angular/forms`
 *
 * * **NgModule**: `FormsModule`
 *
 *  @stable
 */
export declare class NgForm extends ControlContainer implements Form {
    private _submitted;
    form: FormGroup;
    ngSubmit: EventEmitter<{}>;
    constructor(validators: any[], asyncValidators: any[]);
    submitted: boolean;
    formDirective: Form;
    control: FormGroup;
    path: string[];
    controls: {
        [key: string]: AbstractControl;
    };
    addControl(dir: NgModel): void;
    getControl(dir: NgModel): FormControl;
    removeControl(dir: NgModel): void;
    addFormGroup(dir: NgModelGroup): void;
    removeFormGroup(dir: NgModelGroup): void;
    getFormGroup(dir: NgModelGroup): FormGroup;
    updateModel(dir: NgControl, value: any): void;
    setValue(value: {
        [key: string]: any;
    }): void;
    onSubmit($event: Event): boolean;
    onReset(): void;
    resetForm(value?: any): void;
}
