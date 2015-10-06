/// <reference path="../utils.ts" />
/// <reference path="../dragAndDrop/dragAndDropService" />
/// <amd-dependency path="text!agList.html"/>

module ag.grid {

    var utils = Utils;
    var template =
        '<div class="ag-list-selection">'+
            '<div>'+
                '<div ag-repeat class="ag-list-item">'+
                '</div>'+
            '</div>'+
        '</div>';

    enum DropTargetLocation {NOT_DROP_TARGET, DROP_TARGET_ABOVE, DROP_TARGET_BELOW};

    export class AgList {

        private eGui: any;
        private uniqueId: any;
        private modelChangedListeners: any;
        private itemSelectedListeners: any;
        private beforeDropListeners: any;
        private itemMovedListeners: any;
        private dragSources: any;
        private emptyMessage: any;
        private eFilterValueTemplate: any;
        private eListParent: any;
        private model: any;
        private cellRenderer: any;
        private readOnly = false;

        private dragAndDropService: DragAndDropService;

        constructor(dragAndDropService: DragAndDropService) {
            this.dragAndDropService = dragAndDropService;
            this.setupComponents();
            this.uniqueId = 'CheckboxSelection-' + Math.random();
            this.modelChangedListeners = [];
            this.itemSelectedListeners = [];
            this.itemMovedListeners = [];
            this.beforeDropListeners = [];
            this.dragSources = [];
            this.setupAsDropTarget();
        }

        public setReadOnly(readOnly: boolean): void {
            this.readOnly = readOnly;
        }

        public setEmptyMessage(emptyMessage: any) {
            this.emptyMessage = emptyMessage;
            this.refreshView();
        }

        public getUniqueId() {
            return this.uniqueId;
        }

        public addStyles(styles: any) {
            utils.addStylesToElement(this.eGui, styles);
        }

        public addCssClass(cssClass: any) {
            utils.addCssClass(this.eGui, cssClass);
        }

        public addDragSource(dragSource: any) {
            this.dragSources.push(dragSource);
        }

        public addModelChangedListener(listener: Function) {
            this.modelChangedListeners.push(listener);
        }

        public addItemSelectedListener(listener: any) {
            this.itemSelectedListeners.push(listener);
        }

        public addItemMovedListener(listener: any) {
            this.itemMovedListeners.push(listener);
        }

        public addBeforeDropListener(listener: any) {
            this.beforeDropListeners.push(listener);
        }

        private fireItemMoved(fromIndex: number, toIndex: number) {
            for (var i = 0; i < this.itemMovedListeners.length; i++) {
                this.itemMovedListeners[i](fromIndex, toIndex);
            }
        }

        private fireModelChanged() {
            for (var i = 0; i < this.modelChangedListeners.length; i++) {
                this.modelChangedListeners[i](this.model);
            }
        }

        private fireItemSelected(item: any) {
            for (var i = 0; i < this.itemSelectedListeners.length; i++) {
                this.itemSelectedListeners[i](item);
            }
        }

        private fireBeforeDrop(item: any) {
            for (var i = 0; i < this.beforeDropListeners.length; i++) {
                this.beforeDropListeners[i](item);
            }
        }

        private setupComponents() {

            this.eGui = utils.loadTemplate(template);
            this.eFilterValueTemplate = this.eGui.querySelector("[ag-repeat]");

            this.eListParent = this.eFilterValueTemplate.parentNode;
            utils.removeAllChildren(this.eListParent);
        }

        public setModel(model: any) {
            this.model = model;
            this.refreshView();
        }

        public getModel() {
            return this.model;
        }

        public setCellRenderer(cellRenderer: any) {
            this.cellRenderer = cellRenderer;
        }

        public refreshView() {
            utils.removeAllChildren(this.eListParent);

            if (this.model && this.model.length > 0) {
                this.insertRows();
            } else {
                this.insertBlankMessage();
            }
        }

        private insertRows() {
            for (var i = 0; i < this.model.length; i++) {
                var item = this.model[i];
                //var text = this.getText(item);
                //var selected = this.isSelected(item);
                var eListItem = this.eFilterValueTemplate.cloneNode(true);

                if (this.cellRenderer) {
                    var params = {value: item};
                    utils.useRenderer(eListItem, this.cellRenderer, params);
                } else {
                    eListItem.innerHTML = item;
                }

                eListItem.addEventListener('click', this.fireItemSelected.bind(this, item));

                this.addDragAndDropToListItem(eListItem, item);
                this.eListParent.appendChild(eListItem);
            }
        }

        private insertBlankMessage() {
            if (this.emptyMessage) {
                var eMessage = document.createElement('div');
                eMessage.style.color = 'grey';
                eMessage.style.padding = '4px';
                eMessage.style.textAlign = 'center';
                eMessage.innerHTML = this.emptyMessage;
                this.eListParent.appendChild(eMessage);
            }
        }

        private setupAsDropTarget() {
            this.dragAndDropService.addDropTarget(this.eGui, {
                acceptDrag: this.externalAcceptDrag.bind(this),
                drop: this.externalDrop.bind(this),
                noDrop: this.externalNoDrop.bind(this)
            });
        }

        private externalAcceptDrag(dragEvent: any) {
            var allowedSource = this.dragSources.indexOf(dragEvent.containerId) >= 0;
            if (!allowedSource) {
                return false;
            }
            var alreadyHaveCol = this.model.indexOf(dragEvent.data) >= 0;
            if (alreadyHaveCol) {
                return false;
            }
            this.eGui.style.backgroundColor = 'lightgreen';
            return true;
        }

        private externalDrop(dragEvent: any) {
            var newListItem = dragEvent.data;
            this.fireBeforeDrop(newListItem);
            if (!this.readOnly) {
                this.addItemToList(newListItem);
            }
            this.eGui.style.backgroundColor = '';
        }

        private externalNoDrop() {
            this.eGui.style.backgroundColor = '';
        }

        private addItemToList(newItem: any) {
            this.model.push(newItem);
            this.refreshView();
            this.fireModelChanged();
        }

        private addDragAndDropToListItem(eListItem: any, item: any) {
            var that = this;
            this.dragAndDropService.addDragSource(eListItem, {
                getData: function () {
                    return item;
                },
                getContainerId: function () {
                    return that.uniqueId;
                }
            });
            this.dragAndDropService.addDropTarget(eListItem, {
                acceptDrag: function (dragItem: any) {
                    return that.internalAcceptDrag(item, dragItem, eListItem);
                },
                drop: function (dragItem: any) {
                    that.internalDrop(item, dragItem.data);
                },
                noDrop: function () {
                    that.internalNoDrop(eListItem);
                }
            });
        }

        private internalAcceptDrag(targetColumn: any, dragItem: any, eListItem: any) {
            var result = dragItem.data !== targetColumn && dragItem.containerId === this.uniqueId;
            if (result) {
                if (this.dragAfterThisItem(targetColumn, dragItem.data)) {
                    this.setDropCssClasses(eListItem, DropTargetLocation.DROP_TARGET_ABOVE);
                } else {
                    this.setDropCssClasses(eListItem, DropTargetLocation.DROP_TARGET_BELOW);
                }
            }
            return result;
        }

        private internalDrop(targetColumn: any, draggedColumn: any) {
            var oldIndex = this.model.indexOf(draggedColumn);
            var newIndex = this.model.indexOf(targetColumn);

            if (this.readOnly) {
                this.fireItemMoved(oldIndex, newIndex);
            } else {
                this.model.splice(oldIndex, 1);
                this.model.splice(newIndex, 0, draggedColumn);

                this.refreshView();
                this.fireModelChanged();
            }
        }

        private internalNoDrop(eListItem: any) {
            this.setDropCssClasses(eListItem, DropTargetLocation.NOT_DROP_TARGET);
        }

        private dragAfterThisItem(targetColumn: any, draggedColumn: any) {
            return this.model.indexOf(targetColumn) < this.model.indexOf(draggedColumn);
        }

        private setDropCssClasses(eListItem: any, state: any) {
            utils.addOrRemoveCssClass(eListItem, 'ag-not-drop-target', state === DropTargetLocation.NOT_DROP_TARGET);
            utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-above', state === DropTargetLocation.DROP_TARGET_ABOVE);
            utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-below', state === DropTargetLocation.DROP_TARGET_BELOW);
        }

        public getGui() {
            return this.eGui;
        }
    }

}

