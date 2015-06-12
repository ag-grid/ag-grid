var template = require('./checkboxSelection.html');
var utils = require('../utils');

function CheckboxSelection() {
    this.setupComponents();
}

CheckboxSelection.prototype.setItemProxy = function(itemProxy) {
    this.itemProxy = itemProxy;
};

CheckboxSelection.prototype.setupComponents = function() {

    this.eGui = utils.loadTemplate(template);
    this.eFilterValueTemplate = this.eGui.querySelector("[ag-repeat]");

    this.eListParent = this.eFilterValueTemplate.parentNode;
    utils.removeAllChildren(this.eListParent);
};

CheckboxSelection.prototype.setModel = function(model) {
    this.model = model;
    utils.removeAllChildren(this.eListParent);

    if (!model) {
        return;
    }

    for (var i = 0; i<model.length; i++) {
        var item = model[i];
        var text = this.getText(item);
        var selected = this.isSelected(item);
        var eItemValue = this.eFilterValueTemplate.cloneNode(true);

        var eCheckbox = eItemValue.querySelector('.ag-checkbox-selection-checkbox');
        eCheckbox.checked = selected;
        this.addChangeListener(eCheckbox, item);

        var eValue = eItemValue.querySelector(".ag-checkbox-selection-value");
        eValue.innerHTML = text;

        this.eListParent.appendChild(eItemValue);
    }
};

CheckboxSelection.prototype.addChangeListener = function(eCheckbox, item) {
    var that = this;
    eCheckbox.addEventListener('change', function() {
        that.itemProxy.setSelected(item, eCheckbox.checked);
    });
};

CheckboxSelection.prototype.setSelected = function(item, selected) {
    return this.itemProxy.setSelected(item, selected);
};

CheckboxSelection.prototype.isSelected = function(item) {
    return this.itemProxy.isSelected(item);
};

CheckboxSelection.prototype.getText = function(item) {
    return this.itemProxy.getText(item);
};

CheckboxSelection.prototype.getGui = function() {
    return this.eGui;
};

module.exports = CheckboxSelection;
