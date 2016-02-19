import {Bean} from "../context/context";
import {Qualifier} from "../context/context";
import {ColumnSelectPanel} from "../enterprise/columnSelect/columnSelectPanel";
import {Context} from "../context/context";
import {Autowired} from "../context/context";
import _ from '../utils';

@Bean('toolPanel')
export default class ToolPanel {

    private static TEMPLATE = '<div class="ag-tool-panel"></div>';

    @Autowired('context') private context: Context;

    private eGui: HTMLElement;
    private columnSelectPanel: ColumnSelectPanel;

    public agWire(): void {
        this.columnSelectPanel = new ColumnSelectPanel(true);
        this.eGui = _.loadTemplate(ToolPanel.TEMPLATE);
    }

    public agPostWire(): void {
        this.context.wireBean(this.columnSelectPanel);
        this.eGui.appendChild(this.columnSelectPanel.getGui());
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }
}


/*
export default class ToolPanel {

    private layout: any;

    constructor() {
        this.layout = new VerticalStack();
    }

    public agWire(@Qualifier('columnController') columnController: any,
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
}*/
