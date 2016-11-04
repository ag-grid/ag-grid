import {Component} from '@angular/core';
import {URLSearchParams} from "@angular/http";

@Component({
    selector: 'my-app',
    templateUrl: 'app/app.component.html'
})
export class AppComponent {
    public example:string = 'rich-grid';

    constructor() {
        let searchParams = new URLSearchParams(window.location.search.replace("?",""));
        this.example = searchParams.get("example") ? searchParams.get("example") : 'rich-grid';
    }
}
