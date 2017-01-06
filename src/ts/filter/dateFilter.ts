
import {IFilter, IFilterParams, IDoesFilterPassParams} from "../interfaces/iFilter";
import {Component} from "../widgets/component";
import {QuerySelector, Listener} from "../widgets/componentAnnotations";
import {Autowired, Context} from "../context/context";

export interface IDateFilterParams {
    comparator: (filterDate: Date, valueDate: any)=>number;
}

export class ButtonPanel extends Component {

    @Autowired('context')
    private context: Context;

    constructor() {
        super();
        this.setTemplate(`<div>Click Me!!!</div>`);
    }

    @Listener('click')
    private onClick(): void {
        console.log('button panel was clicked');
    }

    public sayHello(): void {
        console.log('hello');
    }
}

export class DateFilter extends Component implements IFilter {

    @QuerySelector('input')
    private eDateInput: HTMLInputElement;

    @Autowired('context')
    private context: Context;

    @QuerySelector('button-panel')
    private buttonPanel: ButtonPanel;

    constructor() {
        super(`<div><input type="date" placeholder="enter date"/><button-panel/></div>`);
    }

    public init(params: IFilterParams): void {
        this.addDestroyableEventListener(this.eDateInput, 'change', this.onDateChanged.bind(this));
        this.instantiate(this.context);
    }

    private onDateChanged(event: any): void {
        this.buttonPanel.sayHello();
    }

    public isFilterActive(): boolean {
        return false;
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        return false;
    }

    public getModel(): any {
    }

    public setModel(model: any): void {
    }

}