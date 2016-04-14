
import {Component} from "../../../widgets/component";
import {Utils as _} from '../../../utils';

export class RichSelectRow extends Component {

    // public static EVENT_CLICK = 'click';
    // public static EVENT_MOUSE_MOVE = 'mousemove';

    private renderer: Function;

    constructor(renderer: Function) {
        super('<div class="ag-rich-select-row"></div>');
        this.renderer = renderer;

        // this.addGuiEventListener('click', this.onClick.bind(this));
        // this.addGuiEventListener('mousemove', this.onMouseMove.bind(this));
    }

    // private onMouseMove(): void {
    //     this.dispatchEvent(RichSelectRow.EVENT_MOUSE_MOVE);
    // }
    //
    // private onClick(): void {
    //     this.dispatchEvent(RichSelectRow.EVENT_CLICK);
    // }
    
    public setState(value: any, selected: boolean): void {

        this.renderer(this.getGui(), value);

        _.addOrRemoveCssClass(this.getGui(), 'ag-rich-select-row-selected', selected);
    }

}