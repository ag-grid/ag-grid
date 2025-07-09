import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    styleUrls: ['./app.component.css'],
    template: `
        <h1>Grid Wrapper</h1>
        <router-outlet></router-outlet>
    `,
})
export class AppComponent {}
