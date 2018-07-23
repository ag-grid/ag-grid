import {Component} from 'ag-grid';

export class InfoStatusBarComponent extends Component {
    private static TEMPLATE = `<div class="ag-status-bar-info-label"></div>`;

    constructor() {
        super(InfoStatusBarComponent.TEMPLATE);
    }
}