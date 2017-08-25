import {Component} from "@angular/core";
import {URLSearchParams} from "@angular/http";

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html'
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
        {key: 'pinned-row', title: "Pinned Row Renderer Example"},
        {key: 'full-width', title: "Full Width Renderer Example"},
        {key: 'simple-group-row', title: "Simple grouping example"},
        {key: 'group-row', title: "Grouped Row Inner Renderer Example"},
        {key: 'filter', title: "Filters Component Example"},
        {key: 'master-detail', title: "Master Detail Example"},
        {key: 'floating-filter', title: "Floating Filters"},
        {key: 'infinite-pagination', title: "Infinite Pagination"},
        {key: 'rxjs-by-row', title: "RxJs - Single Row Update Example"},
        {key: 'rxjs-by-dataset', title: "RxJs - Full DataSet Update Example"}
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
