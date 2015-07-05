
module awk.grid {

    export class SelectionRendererFactory {

        angularGrid: any;
        selectionController: any;

        init(angularGrid: any, selectionController: any) {
            this.angularGrid = angularGrid;
            this.selectionController = selectionController;
        }

        createCheckboxColDef() {
            return {
                width: 30,
                suppressMenu: true,
                suppressSorting: true,
                headerCellRenderer: function () {
                    var eCheckbox = document.createElement('input');
                    eCheckbox.type = 'checkbox';
                    eCheckbox.name = 'name';
                    return eCheckbox;
                },
                cellRenderer: this.createCheckboxRenderer()
            };
        }

        createCheckboxRenderer() {
            var that = this;
            return function (params: any) {
                return that.createSelectionCheckbox(params.node, params.rowIndex);
            };
        }

        createSelectionCheckbox(node: any, rowIndex: any) {

            var eCheckbox = document.createElement('input');
            eCheckbox.type = "checkbox";
            eCheckbox.name = "name";
            eCheckbox.className = 'ag-selection-checkbox';
            setCheckboxState(eCheckbox, this.selectionController.isNodeSelected(node));

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
                rowSelected: function (selected: any) {
                    setCheckboxState(eCheckbox, selected);
                },
                rowRemoved: function () {
                }
            });

            return eCheckbox;
        }
    }

    function setCheckboxState(eCheckbox: any, state: any) {
        if (typeof state === 'boolean') {
            eCheckbox.checked = state;
            eCheckbox.indeterminate = false;
        } else {
            // isNodeSelected returns back undefined if it's a group and the children
            // are a mix of selected and unselected
            eCheckbox.indeterminate = true;
        }
    }

}

