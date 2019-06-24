import { AgLabel, IAgLabel } from "./agLabel";
import { RefSelector } from "./componentAnnotations";

interface IAgSelect extends IAgLabel {

}

export class AgSelect extends AgLabel {
    private static TEMPLATE =
        `<div class="ag-select">
            <label ref="eLabel"></label>
            <select ref="eSelect"></select>
        </div>`;

    constructor(config?: IAgSelect) {
        super(AgSelect.TEMPLATE);
    }

    @RefSelector('eLabel') protected eLabel: HTMLElement;
    @RefSelector('eSelect') private eSelect: HTMLSelectElement;
}