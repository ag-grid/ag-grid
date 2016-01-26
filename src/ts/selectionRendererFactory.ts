
module ag.grid {

    export class SelectionRendererFactory {

        private grid: Grid;
        private selectionController: any;

        public init(grid: Grid, selectionController: any) {
            this.grid = grid;
            this.selectionController = selectionController;
        }

        public createSelectionCheckbox(node: any, rowIndex: any) {

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

            this.grid.addVirtualRowListener(Grid.VIRTUAL_ROW_SELECTED, rowIndex, (selected: boolean) => {
                setCheckboxState(eCheckbox, selected);
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

