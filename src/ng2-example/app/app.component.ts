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
        {key: 'rich-grid', title: "Rich Grid with Pure JavaScript"},
        {key: 'rich-grid-declarative', title: "Rich Grid with Declarative Markup"},
        {key: 'from-component', title: "Using Dynamic Components"},
        {key: 'from-rich-component', title: "Using Dynamic Components - Richer Example"},
        {key: 'editor-component', title: "Using Cell Editor Components"},
        {key: 'floating-row', title: "Using Floating Row Renderers"},
        {key: 'full-width', title: "Using Full Width Renderers"},
        {key: 'group-row', title: "Using Group Row Renderers"},
        {key: 'filter', title: "With Filters Components"},
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
