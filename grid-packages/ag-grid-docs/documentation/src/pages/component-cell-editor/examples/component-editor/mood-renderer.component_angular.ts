import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "@ag-grid-community/angular";

@Component({
    selector: 'mood-cell',
    template: `<img width="20px" [src]="imgForMood" />`
})
export class MoodRenderer implements ICellRendererAngularComp {
    private params: any;
    private mood: string;
    public imgForMood: string;

    agInit(params: any): void {
        this.params = params;
        this.setMood(params);
    }

    refresh(params: any): boolean {
        this.params = params;
        this.setMood(params);
        return true;
    }

    private setMood(params) {
        this.mood = params.value;
        this.imgForMood = 'https://www.ag-grid.com/example-assets/smileys/' + (this.mood === 'Happy' ? 'happy.png' : 'sad.png');
    };
}

