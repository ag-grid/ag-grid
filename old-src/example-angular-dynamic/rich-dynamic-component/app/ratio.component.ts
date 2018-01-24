import {Component, Input} from "@angular/core";

@Component({
    selector: 'ag-ratio',
    template: `
        <svg viewBox="0 0 300 100" preserveAspectRatio="none">
            <rect x="0" y="0" [attr.width]="topRatio * 300" height="50" rx="4" ry="4" class="topBar"/>
            <rect x="0" y="50" [attr.width]="bottomRatio * 300" height="50" rx="4" ry="4" class="bottomBar"/>
        </svg>
    `,
    styles: [`
        svg {
            width: 100%;
            height: 100%;
            pointer-events: none;
        }

        .topBar {
            fill: #ff9933;
        }

        .bottomBar {
            fill: #6699ff;
        }
    `]
})
export class RatioComponent {
    @Input() topRatio: number = 0.67;
    @Input() bottomRatio: number = 0.50;
}
