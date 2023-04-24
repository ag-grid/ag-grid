class CustomTooltip {

    init(params) {
        var eGui = (this.eGui = document.createElement('div'));

        eGui.classList.add('custom-tooltip');

        if (params.location === 'setFilterValue') {
            eGui.innerHTML = '<strong>Full value:</strong> ' + params.value;
        } else {
            eGui.innerHTML = params.value;
        }
    };

    getGui() {
        return this.eGui;
    };
}