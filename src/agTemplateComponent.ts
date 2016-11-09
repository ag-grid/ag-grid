import {Component, ViewContainerRef, ViewChild} from "@angular/core";

import {AgRendererComponent} from 'agRendererComponent';

@Component({
    selector: 'ag-template-component',
    template: '<div #agTemplateContent></div>'
})
export class AgTemplateComponent implements AgRendererComponent {
    private params: any;

    @ViewChild('myNgIncludeContent', { read: ViewContainerRef })
    protected contentTarget: ViewContainerRef;

    agInit(params: any): void {
        this.params = params;
    }

    public setTemplate(template:string) {
    }
}

