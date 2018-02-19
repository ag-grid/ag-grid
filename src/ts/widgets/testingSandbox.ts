import {IDoesFilterPassParams, IFilterComp, IFilterParams} from "../interfaces/iFilter";
import {Promise} from "../utils";
import {Component} from "./component";
import {Autowired, Context, PostConstruct} from "../context/context";
import {Listener, Method, RefSelector} from "./componentAnnotations";

export class TestingSandbox extends Component implements IFilterComp {

    private static TEMPLATE =
        `<div>
          <ag-checkbox ref="eCheckbox" label="Select Me"></ag-checkbox>
          <ag-small-component ref="eSmallComponent" [bag]="bag" some-string="bananas"></ag-small-component>
        </div>`;

    @Autowired('context') private context: Context;

    @RefSelector('eSmallComponent') private smallComponent: SmallComponent;

    private bag: any = {
        a: 23, b: 42
    };

    constructor() {
        super(TestingSandbox.TEMPLATE);
    }

    @PostConstruct
    public postConstruct(): void {
        this.instantiate(this.context);

        this.smallComponent.doSomething();
    }

    public isFilterActive(): boolean {
        return false;
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        return true;
    }

    public getModel(): any {
        return null;
    }

    public setModel(model: any): void {
    }

    public init(params: IFilterParams): Promise<void> | void {
    }

}

export class SmallComponent extends Component {

    private attributes: any;

    constructor() {
        super(`<div>
                    <div>
                        Small Component
                    </div>
                    <div>
                        <ag-checkbox label="My Checkbox" (change)="onMyCheckboxChanged"/>
                    </div>
                    <div>
                        <button (click)="clickBtOk">OK</button>
                        <button (click)="onBtCancel">Cancel</button>
                    </div>
            </div>`);
    }

    private onMyCheckboxChanged(event: any): void {
        console.log('onMyCheckboxChanged', event);
    }

    @Method('clickBtOk')
    private onBtOk(event: MouseEvent): void {
        console.log('smallComponent.onBtOK', event);
        console.log('attributes', this.attributes);
    }

    private onBtCancel(event: MouseEvent): void {
        console.log('smallComponent.onBtCancel', event);
        console.log('attributes', this.attributes);
    }

    public doSomething(): void {
        console.log('SmallComponent.doSomething()');
        console.log('attributes', this.attributes);
    }

}
