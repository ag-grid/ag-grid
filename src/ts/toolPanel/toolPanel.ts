import _ from '../utils';
import VerticalStack from "../layout/verticalStack";
import PopupService from "../widgets/agPopupService";
import EventService from "../eventService";
import DragAndDropService from "../dragAndDrop/dragAndDropService";
import GridOptionsWrapper from "../gridOptionsWrapper";
import ColumnSelectionPanel from "./columnSelectionPanel";
import ValuesSelectionPanel from "./valuesSelectionPanel";
import GroupSelectionPanel from "./groupSelectionPanel";
import {Bean} from "../context/context";
import {Qualifier} from "../context/context";

@Bean('toolPanel')
export default class ToolPanel {

    layout: any;

    constructor() {
        this.layout = new VerticalStack();
    }

    public agInit(@Qualifier('columnController') columnController: any,
                @Qualifier('inMemoryRowController') inMemoryRowController: any,
                @Qualifier('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper,
                @Qualifier('popupService') popupService: PopupService,
                @Qualifier('eventService') eventService: EventService,
                @Qualifier('dragAndDropService') dragAndDropService: DragAndDropService) {

        var suppressGroupAndValues = gridOptionsWrapper.isToolPanelSuppressGroups();
        var suppressValues = gridOptionsWrapper.isToolPanelSuppressValues();

        var showGroups = !suppressGroupAndValues;
        var showValues = !suppressGroupAndValues && !suppressValues;

        // top list, column reorder and visibility
        var columnSelectionPanel = new ColumnSelectionPanel(columnController, gridOptionsWrapper, eventService, dragAndDropService);
        var heightColumnSelection = suppressGroupAndValues ? '100%' : '50%';
        this.layout.addPanel(columnSelectionPanel.layout, heightColumnSelection);
        var dragSource = columnSelectionPanel.getDragSource();

        if (showValues) {
            var valuesSelectionPanel = new ValuesSelectionPanel(columnController, gridOptionsWrapper,
                popupService, eventService, dragAndDropService);
            this.layout.addPanel(valuesSelectionPanel.getLayout(), '25%');
            valuesSelectionPanel.addDragSource(dragSource);
        }

        if (showGroups) {
            var groupSelectionPanel = new GroupSelectionPanel(columnController, inMemoryRowController,
                gridOptionsWrapper, eventService, dragAndDropService);
            var heightGroupSelection = showValues ? '25%' : '50%';
            this.layout.addPanel(groupSelectionPanel.layout, heightGroupSelection);
            groupSelectionPanel.addDragSource(dragSource);
        }

        var eGui = this.layout.getGui();

        _.addCssClass(eGui, 'ag-tool-panel-container');
    }
}
