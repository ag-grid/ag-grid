class CustomTooltip {
    init(params) {
        const eGui = this.eGui = document.createElement('div');
        eGui.classList.add('custom-tooltip');

        const valueToDisplay = params.value.value ? params.value.value : '- Missing -';

        eGui.innerHTML = `<p>Athlete's name:</p><p><span class"name">${valueToDisplay}</span></p>`;
    }

    getGui() {
        return this.eGui;
    }
}

