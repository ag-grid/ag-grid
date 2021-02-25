class GenderRenderer {
    init(params) {
        this.eGui = document.createElement('span');
        var img = params.value === 'Male' ? 'male.png' : 'female.png';
        this.eGui.innerHTML = `<img src="https://www.ag-grid.com/example-assets/genders/${img}"/> ${params.value}`;
    }

    getGui() {
        return this.eGui;
    }
}

