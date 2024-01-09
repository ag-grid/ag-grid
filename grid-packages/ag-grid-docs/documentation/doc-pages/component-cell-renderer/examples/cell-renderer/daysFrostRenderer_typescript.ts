import { ICellRendererComp, ICellRendererParams } from "@ag-grid-community/core";
export interface ImageCellRendererParams extends ICellRendererParams {
    rendererImage: string;
    showPrefix: boolean;
}
export class DaysFrostRenderer implements ICellRendererComp {
    eGui: HTMLSpanElement;
    params!: ImageCellRendererParams;
    /**
     * Demonstrating Component Cell Renderer
     */
    constructor() {
        this.eGui = document.createElement("span");
    }

    init(params: ImageCellRendererParams) {
        this.params = params;
        this.updateImages();
    }

    updateImages() {
        const daysFrost = this.params.value;
        if (this.params.showPrefix) {
            const prefixElement = document.createElement('span');
            prefixElement.innerText = 'Days: ';
            this.eGui.appendChild(prefixElement);
        }
        for (let i = 0; i < daysFrost; i++) {
            const imageElement = document.createElement("img");
            imageElement.src = "https://www.ag-grid.com/example-assets/weather/" + this.params.rendererImage;
            this.eGui.appendChild(imageElement);
        }
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ImageCellRendererParams) {
        this.params = params;

        this.eGui.textContent = '';
        this.updateImages();

        return true;
    }
}
