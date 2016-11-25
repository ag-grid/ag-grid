import {Component} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import "rxjs/add/operator/map";

@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    showNav: boolean = true;

    constructor(private router: Router,
                private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route
            .queryParams
            .map(params => params['fromDocs'] !== undefined || false)
            .subscribe((fromDocs) => {
                this.showNav = !fromDocs;
            });
    }
}
