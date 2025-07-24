import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class MoodRenderer implements ICellRendererComp {
    eGui!: HTMLSpanElement;
    mood?: string;

    init(params: ICellRendererParams) {
        const div = (this.eGui = document.createElement('div'));
        div.className = 'mood-renderer';

        this.refresh(params);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        if (params.value === this.mood) {
            return true;
        }

        this.mood = params.value;

        if (this.mood !== '' || this.mood !== undefined) {
            const imgUrl =
                'https://www.ag-grid.com/example-assets/smileys/' +
                (params.value === 'Happy' ? 'happy.png' : 'sad.png');
            this.eGui.innerHTML = `<img width="20px" src="${imgUrl}" />`;
            return true;
        }

        return false;
    }
}
