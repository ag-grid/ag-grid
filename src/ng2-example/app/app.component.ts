import {Component} from "@angular/core";
import {URLSearchParams} from "@angular/http";

@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    fromDocs: boolean = false;

    currentExample: string = 'rich-grid';
    examples: any = [
        {key: 'rich-grid', title: "Rich Grid Example"},
        {key: 'rich-grid-declarative', title: "Rich Grid with Declarative Markup"},
        {key: 'from-component', title: "Dynamic Angular Component Example"},
        {key: 'from-rich-component', title: "Dynamic Angular Components - Richer Example"},
        {key: 'editor-component', title: "Cell Editor Component Example"},
        {key: 'floating-row', title: "Floating Row Renderer Example"},
        {key: 'full-width', title: "Full Width Renderer Example"},
        {key: 'group-row', title: "Group Row Renderer Example"},
        {key: 'filter', title: "Filters Component Example"},
        {key: 'master-detail', title: "Master Detail Example"},
    ];

    constructor() {
        let params = new URLSearchParams(window.location.search.replace("?", ""));
        this.currentExample = params.has('example') ? params.get("example") : 'rich-grid';
        this.fromDocs = params.has('fromDocs') ? params.get("fromDocs") === 'true' : false;
    }

    public setCurrentExample(currentExample) : void {
        this.currentExample = currentExample;
    }
}
