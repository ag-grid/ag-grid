import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PortfolioExample } from './portfolio-example/portfolio-example.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, PortfolioExample],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
    title = 'ag-grid-showcase-example-angular';
}
