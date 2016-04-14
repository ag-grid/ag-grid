
import {Component} from "../../../widgets/component";
import {Utils as _} from '../../../utils';

export class RichSelectRow extends Component {

    public static EVENT_SELECTED = 'selected';

    constructor() {
        super('<div></div>');

        this.addGuiEventListener('click', ()=> {
            this.dispatchEvent(RichSelectRow.EVENT_SELECTED);
        });

    }
    
    public setState(value: any): void {
        if (_.exists(value)) {
            this.getGui().innerHTML = value.toString();
        } else {
            this.getGui().innerHTML = '';
        }
    }

}