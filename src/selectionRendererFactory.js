define([], function () {

    function SelectionRendererFactory(angularGrid, selectionController) {
        this.angularGrid = angularGrid;
        this.selectionController = selectionController;
    }

    SelectionRendererFactory.prototype.createCheckboxColDef = function () {
        return {
            width: 30,
            suppressMenu: true,
            suppressSorting: true,
            headerCellRenderer: function() {
                var eCheckbox = document.createElement('input');
                eCheckbox.type = 'checkbox';
                eCheckbox.name = 'name';
                return eCheckbox;
            },
            cellRenderer: this.createCheckboxRenderer()
        };
    };

    SelectionRendererFactory.prototype.createCheckboxRenderer = function () {
        var that = this;
        return function(params) {
            return that.createSelectionCheckbox(params.node, params.rowIndex);
        };
    };

    SelectionRendererFactory.prototype.createSelectionCheckbox = function (node, rowIndex) {

        var eCheckbox = document.createElement('input');
        eCheckbox.type = "checkbox";
        eCheckbox.name = "name";
        eCheckbox.checked = this.selectionController.isNodeSelected(node);

        var that = this;
        eCheckbox.onclick = function (event) {
            event.stopPropagation();
        };

        eCheckbox.onchange = function () {
            var newValue = eCheckbox.checked;
            if (newValue) {
                that.selectionController.selectIndex(rowIndex, true);
            } else {
                that.selectionController.deselectIndex(rowIndex);
            }
        };

        this.angularGrid.addVirtualRowListener(rowIndex, {
            rowSelected: function (selected) {
                eCheckbox.checked = selected;
            },
            rowRemoved: function () {
            }
        });

        return eCheckbox;

    };

    return SelectionRendererFactory;
});