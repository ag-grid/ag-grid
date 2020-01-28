function GenderCellRenderer() {
}

GenderCellRenderer.prototype.init = function (params) {
    this.eGui = document.createElement('span');
    var img = params.value === 'Male' ? 'male.png' : 'female.png';
    this.eGui.innerHTML = '<img src="../images/' + img + '"/> ' + params.value;
};

GenderCellRenderer.prototype.getGui = function () {
    return this.eGui;
};
