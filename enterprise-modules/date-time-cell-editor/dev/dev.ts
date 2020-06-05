import { Grid, Autowired, GridOptions } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import { Component, PostConstruct, _ } from '@ag-grid-community/core';

import './dev.scss';
import { DateTimeList } from '../src/dateTimeList/dateTimeList';
import { DateTimeCellEditorModule } from '../src/main';

export class DevHarness extends Component {
    private static TEMPLATE = `<div class="ag-dev-harness"></div>`;

    @Autowired('eGridDiv') private eGridDiv: HTMLElement;

    constructor() {
        super(DevHarness.TEMPLATE);
    }

    @PostConstruct
    private init(): void {
        this.eGridDiv.appendChild(this.getGui());
        const component = new DateTimeList({
            onValueSelect: value => console.log(value),
        });
        this.getContext().createBean(component);
        this.getGui().appendChild(component.getGui());
        component.focus();
    }
}

const gridOptions: GridOptions = {};

document.addEventListener('DOMContentLoaded', function() {
    const eDemoDiv = document.createElement('div');
    document.body.appendChild(eDemoDiv);
    eDemoDiv.id = 'component-demo';
    eDemoDiv.className = 'ag-theme-alpine';
    document.body.parentElement.style.height = '100%';
    document.body.parentElement.style.width = '200px';
    document.body.style.height = '100%';
    eDemoDiv.style.height = '100%';
    new Grid(eDemoDiv, gridOptions, {
        rootComponent: DevHarness,
        modules: [ClientSideRowModelModule, DateTimeCellEditorModule],
    });
});
