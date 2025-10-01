import type { ICellEditorComp, ICellEditorParams } from 'ag-grid-community';

export class MoodEditor implements ICellEditorComp {
    defaultImgStyle: string;
    selectedImgStyle: string;
    mood!: string;
    container!: any;
    happyImg: any;
    sadImg: any;

    constructor() {
        this.defaultImgStyle = 'padding-left:10px; padding-right:10px;  border: 1px solid transparent; padding: 4px;';
        this.selectedImgStyle = 'padding-left:10px; padding-right:10px; border: 1px solid lightgreen; padding: 4px;';
    }

    onKeyDown(event: any) {
        const key = event.key;
        if (
            key === 'ArrowLeft' || // left
            key === 'ArrowRight'
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
        this.container.style =
            'border-radius: 15px; border: 1px solid grey;background-color: #e6e6e6;padding: 15px; text-align:center;display:inline-block;outline:none';
        this.container.tabIndex = '0'; // to allow the div to capture events

        this.happyImg = document.createElement('img');
        this.happyImg.src = 'https://www.ag-grid.com/example-assets/smileys/happy.png';
        this.happyImg.style = this.defaultImgStyle;

        this.sadImg = document.createElement('img');
        this.sadImg.src = 'https://www.ag-grid.com/example-assets/smileys/sad.png';
        this.sadImg.style = this.defaultImgStyle;

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
        this.happyImg.style = mood === 'Happy' ? this.selectedImgStyle : this.defaultImgStyle;
        this.sadImg.style = mood === 'Sad' ? this.selectedImgStyle : this.defaultImgStyle;
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

    isPopup() {
        return true;
    }
}
