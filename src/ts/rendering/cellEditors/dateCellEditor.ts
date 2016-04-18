
import {Component} from "../../widgets/component";
import {ICellEditor} from "./iCellEditor";
import {Autowired} from "../../context/context";
import {PopupService} from "../../widgets/popupService";
import {Utils as _} from '../../utils';

export class DateCellEditor extends Component implements ICellEditor {

    @Autowired('popupService') private popupService: PopupService;

    private static TEMPLATE =
        '<span>' +
        '<input type="text" style="width: 80%"/>' +
        '<button style="width: 20%">+</button>' +
        '</span>';

    private eText: HTMLInputElement;
    private eButton: HTMLElement;

    constructor() {
        super(DateCellEditor.TEMPLATE);
        this.eText = this.queryForHtmlInputElement('input');
        this.eButton = this.queryForHtmlElement('button');

        this.eButton.addEventListener('click', this.onBtPush.bind(this));
    }

    public getValue(): any {
        return this.eText.value;
    }

    public onBtPush(): void {
        var ePopup = _.loadTemplate(
            '<div style="position: absolute; border: 1px solid darkgreen; background: lightcyan">' +
            '<div>This is the popup</div>' +
            '<div><input/></div>' +
            '<div>Under the input</div>' +
            '</div>');

        this.popupService.addAsModalPopup(ePopup, true, ()=> {
            console.log('popup was closed');
        });

        this.popupService.positionPopupUnderComponent({
            eventSource: this.getGui(),
            ePopup: ePopup
        });

        var eText = <HTMLElement> ePopup.querySelector('input');
        eText.focus();
    }

    public afterGuiAttached(): void  {
        this.eText.focus();
    }

}
