import type { ICellEditorComp, ICellEditorParams } from 'ag-grid-community';

export class MoodEditor implements ICellEditorComp {
    mood!: string;
    container: any;
    happyImg: any;
    sadImg: any;

    onKeyDown(event: any) {
        const key = event.key;
        if (
            key === 'ArrowLeft' || // left
            key == 'ArrowRight'
        ) {
            // right
            this.toggleMood();
            event.stopPropagation();
        }
    }

    toggleMood() {
        this.selectMood(this.mood === 'Happy' ? 'Sad' : 'Happy');
    }

    init(params: ICellEditorParams) {
        this.container = document.createElement('div');
        this.container.className = 'mood';
        this.container.tabIndex = '0'; // to allow the div to capture events

        this.happyImg = document.createElement('img');
        this.happyImg.src = 'https://www.ag-grid.com/example-assets/smileys/happy.png';

        this.sadImg = document.createElement('img');
        this.sadImg.src = 'https://www.ag-grid.com/example-assets/smileys/sad.png';

        this.container.appendChild(this.happyImg);
        this.container.appendChild(this.sadImg);

        this.happyImg.addEventListener('click', () => {
            this.selectMood('Happy');
            params.stopEditing();
        });
        this.sadImg.addEventListener('click', () => {
            this.selectMood('Sad');
            params.stopEditing();
        });
        this.container.addEventListener('keydown', (event: any) => {
            this.onKeyDown(event);
        });

        this.selectMood(params.value);
    }

    selectMood(mood: string) {
        this.mood = mood;
        this.happyImg.className = mood === 'Happy' ? 'selected' : 'default';
        this.sadImg.className = mood === 'Sad' ? 'selected' : 'default';
    }

    // gets called once when grid ready to insert the element
    getGui() {
        return this.container;
    }

    afterGuiAttached() {
        this.container.focus();
    }

    getValue() {
        return this.mood;
    }

    // any cleanup we need to be done here
    destroy() {}
}
