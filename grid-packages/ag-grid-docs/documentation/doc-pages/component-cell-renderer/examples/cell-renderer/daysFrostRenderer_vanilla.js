class DaysFrostRenderer {
    /**
     * Demonstrating Component Cell Renderer
     */
    constructor() {
        this.eGui = document.createElement("span");
    }

    init(params) {
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

    refresh(params) {
        this.value = params.value;

        this.eGui.innerHTML = '';
        this.updateImages();
    }
}
