import {Component} from "@angular/core";
import { URLSearchParams } from '@angular/http';

@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    example : string = 'rich-grid';
    constructor() {
        let params = new URLSearchParams(window.location.search.replace("?",""));
        this.example = params.get('example') ? params.get("example") : 'rich-grid';
    }
}
