import { ICellRendererComp, ICellRendererParams } from "@ag-grid-community/core";
export interface ImageCellRendererParams extends ICellRendererParams {
    rendererImage: string
}
export class DaysFrostRenderer implements ICellRendererComp {
    eGui: HTMLSpanElement;
    value: any;
    rendererImage!: string;
    /**
     * Demonstrating Component Cell Renderer
     */
    constructor() {
        this.eGui = document.createElement("span");
    }

    init(params: ImageCellRendererParams) {
        this.rendererImage = params.rendererImage;
        this.value = params.value;
        this.updateImages();
    }

    updateImages() {
        const daysFrost = this.value;
        for (let i = 0; i < daysFrost; i++) {
            const imageElement = document.createElement("img");
            imageElement.src = "https://www.ag-grid.com/example-assets/weather/" + this.rendererImage;
            this.eGui.appendChild(imageElement);
        }
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ImageCellRendererParams) {
        this.value = params.value;

        this.eGui.innerHTML = '';
        this.updateImages();

        return true;
    }
}
