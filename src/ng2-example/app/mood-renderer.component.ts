import {Component} from '@angular/core';

import {AgRendererComponent} from 'ag-grid-ng2/main';

@Component({
    selector: 'mood-cell',
    template: `<img width="20px" [src]="imgForMood" />`
})
export class MoodRendererComponent implements AgRendererComponent {
    private params: any;
    private mood: string;
    public imgForMood: string;

    agInit(params: any): void {
        this.params = params;
        this.setMood(params);
    }

    refresh(params: any): void {
        this.params = params;
        this.setMood(params);
    }

    private setMood(params) {
        this.mood = params.value;
        this.imgForMood = this.mood === 'Happy' ? 'images/smiley.png' : 'images/smiley-sad.png';
    };
}

