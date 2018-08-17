import {Component} from 'ag-grid';

export class BlankStatusBarComponent extends Component {

    private static TEMPLATE = `<div class="ag-blank-status-bar-component">
                <div class="ag-status-bar-comp"></div>
            </div>`;

    constructor() {
        super(BlankStatusBarComponent.TEMPLATE);
    }

    public init() {
    }
}
