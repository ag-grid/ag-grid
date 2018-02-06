import {
  Component,
  GridApi,
  GridOptionsWrapper,
  PostConstruct,
  Bean,
  Autowired,
  Context
} from "ag-grid/main";
import { ColumnSelectComp } from "./columnsSelect/columnSelectComp";
import { RowGroupColumnsPanel } from "./columnDrop/rowGroupColumnsPanel";
import { PivotColumnsPanel } from "./columnDrop/pivotColumnsPanel";
import { PivotModePanel } from "./columnDrop/pivotModePanel";
import { ValuesColumnPanel } from "./columnDrop/valueColumnsPanel";
import { _, IToolPanel } from "ag-grid";

class PanelContainer extends Component {
  constructor() {
    super('<div ref="panel-container" class="ag-panel-container"></div>');
  }
}

class ToolPanelWithSideButton extends Component {
  panelContainer: PanelContainer;

  private static BUTTON_TEMPLATE = `<div class="ag-tool-panel-wrapper">
        <div class="side-buttons"><button type="button" ref="toggle-button">Tool Panel</button></div>
    </div>`;

  private static NO_BUTTON_TEMPLATE = `<div class="ag-tool-panel-wrapper full-width"></div>`;

  constructor(showSideButton: boolean) {
    super(showSideButton ? ToolPanelWithSideButton.BUTTON_TEMPLATE : ToolPanelWithSideButton.NO_BUTTON_TEMPLATE);
    this.panelContainer = new PanelContainer();
    this.appendChild(this.panelContainer);
  }

  public appendPanel(component: Component) {
    this.panelContainer.getGui().appendChild(component.getGui());
  }

  public setVisible(visible: boolean): void {
    this.panelContainer.setVisible(visible);
  }
}

@Bean("toolPanel")
export class ToolPanelComp extends Component implements IToolPanel {
  private static TEMPLATE = '<div class="ag-tool-panel"></div>';

  @Autowired("context") private context: Context;
  @Autowired("gridOptionsWrapper")
  private gridOptionsWrapper: GridOptionsWrapper;

  @Autowired("gridApi") private gridApi: GridApi;

  private initialised = false;

  private childDestroyFuncs: Function[] = [];

  private toolPanelWithSideButton: ToolPanelWithSideButton;

  constructor() {
    super(ToolPanelComp.TEMPLATE);
  }

  // lazy initialise the toolPanel
  public setVisible(visible: boolean): void {
    if (visible && !this.initialised) {
      this.init();
    }

    this.toolPanelWithSideButton.setVisible(visible);
  }

  public init(): void {
    const showSideButton = this.gridOptionsWrapper.isToolPanelUsingSideButton();
    this.toolPanelWithSideButton = new ToolPanelWithSideButton(showSideButton);
    this.getGui().appendChild(this.toolPanelWithSideButton.getGui());

    if (showSideButton) {
      const button = this.getRefElement("toggle-button")
      button.firstChild.nodeValue = this.gridOptionsWrapper.getLocaleTextFunc()('toolPanelButton', 'Tool Panel');
      button.addEventListener("click", e => {
        this.gridApi.showToolPanel(!this.gridApi.isToolPanelShowing());
        e.preventDefault();
      });
    }

    if (!this.gridOptionsWrapper.isToolPanelSuppressPivotMode()) {
      this.addComponent(new PivotModePanel());
    }

    this.addComponent(new ColumnSelectComp(true));

    if (!this.gridOptionsWrapper.isToolPanelSuppressRowGroups()) {
      this.addComponent(new RowGroupColumnsPanel(false));
    }

    if (!this.gridOptionsWrapper.isToolPanelSuppressValues()) {
      this.addComponent(new ValuesColumnPanel(false));
    }

    if (!this.gridOptionsWrapper.isToolPanelSuppressPivots()) {
      this.addComponent(new PivotColumnsPanel(false));
    }

    this.initialised = true;
  }

  private addComponent(component: Component): void {
    this.context.wireBean(component);
    this.toolPanelWithSideButton.appendPanel(component);
    // this.getGui().appendChild(component.getGui());
    this.childDestroyFuncs.push(component.destroy.bind(component));
  }

  public destroyChildren(): void {
    this.childDestroyFuncs.forEach(func => func());
    this.childDestroyFuncs.length = 0;
    _.removeAllChildren(this.getGui());
  }

  public refresh(): void {
    this.destroyChildren();
    this.init();
  }

  public destroy(): void {
    this.destroyChildren();
    super.destroy();
  }
}
