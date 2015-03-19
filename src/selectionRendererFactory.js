define([], function () {

    function SelectionRendererFactory(angularGrid) {
        this.angularGrid = angularGrid;
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
            cellRenderer: this.createCheckboxRenderer(this.angularGrid)
        };
    };

    SelectionRendererFactory.prototype.createCheckboxRenderer = function () {
        var that = this;
        return function(params) {
            return that.createSelectionCheckbox(params.data, params.rowIndex);
        };
    };

    SelectionRendererFactory.prototype.createSelectionCheckbox = function (data, rowIndex) {

        var eCheckbox = document.createElement('input');
        eCheckbox.type = "checkbox";
        eCheckbox.name = "name";
        eCheckbox.checked = this.angularGrid.isNodeSelected(data);

        var that = this;
        eCheckbox.onclick = function (event) {
            event.stopPropagation();
        };

        eCheckbox.onchange = function () {
            var newValue = eCheckbox.checked;
            if (newValue) {
                that.angularGrid.selectIndex(rowIndex, true);
            } else {
                that.angularGrid.unselectIndex(rowIndex);
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