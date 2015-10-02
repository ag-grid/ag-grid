/// <reference path="../utils.ts" />
/// <reference path="./columnSelectionPanel.ts" />
/// <reference path="./groupSelectionPanel.ts" />
/// <reference path="./valuesSelectionPanel.ts" />
/// <reference path="../layout/verticalStack.ts" />

module ag.grid {

    var utils = Utils;

    export class ToolPanel {

        layout: any;

        constructor() {
            this.layout = new VerticalStack();
        }

        public init(columnController: any, inMemoryRowController: any, gridOptionsWrapper: GridOptionsWrapper,
             popupService: PopupService, eventService: EventService, dragAndDropService: DragAndDropService) {

            var suppressPivotAndValues = gridOptionsWrapper.isToolPanelSuppressPivot();
            var suppressValues = gridOptionsWrapper.isToolPanelSuppressValues();

            var showPivot = !suppressPivotAndValues;
            var showValues = !suppressPivotAndValues && !suppressValues;

            // top list, column reorder and visibility
            var columnSelectionPanel = new ColumnSelectionPanel(columnController, gridOptionsWrapper, eventService, dragAndDropService);
            var heightColumnSelection = suppressPivotAndValues ? '100%' : '50%';
            this.layout.addPanel(columnSelectionPanel.layout, heightColumnSelection);
            var dragSource = columnSelectionPanel.getDragSource();

            if (showValues) {
                var valuesSelectionPanel = new ValuesSelectionPanel(columnController, gridOptionsWrapper,
                    popupService, eventService, dragAndDropService);
                this.layout.addPanel(valuesSelectionPanel.getLayout(), '25%');
                valuesSelectionPanel.addDragSource(dragSource);
            }

            if (showPivot) {
                var groupSelectionPanel = new GroupSelectionPanel(columnController, inMemoryRowController,
                    gridOptionsWrapper, eventService, dragAndDropService);
                var heightPivotSelection = showValues ? '25%' : '50%';
                this.layout.addPanel(groupSelectionPanel.layout, heightPivotSelection);
                groupSelectionPanel.addDragSource(dragSource);
            }

            var eGui = this.layout.getGui();

            utils.addCssClass(eGui, 'ag-tool-panel-container');
        }
    }
}
