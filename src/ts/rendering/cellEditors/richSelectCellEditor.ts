
import {ICellEditor} from "./iCellEditor";
import {Component} from "../../widgets/component";

export class RichSelectCellEditor extends Component implements ICellEditor {

    constructor() {
        super(null);
    }

    public init(params: any): void {
        
    }

    public getGui(): HTMLElement {
        return null;
    }

    public getValue(): any {
        return 'sugar';
    }

}