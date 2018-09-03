import {
    _,
    Autowired,
    Component,
    ComponentProvider,
    ComponentResolver,
    Context,
    GridApi,
    GridOptions,
    GridOptionsWrapper,
    PostConstruct,
    RefSelector
} from 'ag-grid-community';
import {StatusBarService} from "./statusBarService";

export class StatusBar extends Component {

    private static TEMPLATE = `<div class="ag-status-bar">
        <div ref="leftPanelComponents" class="ag-status-left-bar-comps"></div>
        <div ref="centerPanelComponents" class="ag-status-center-bar-comps"></div>
        <div ref="rightPanelComponents" class="ag-status-right-bar-comps"></div>
    </div>`;

    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('componentProvider') private componentProvider: ComponentProvider;
    @Autowired('componentResolver') private componentResolver: ComponentResolver;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('statusBarService') private statusBarService: StatusBarService;

    @RefSelector('leftPanelComponents') private eLeftPanelComponents: HTMLElement;
    @RefSelector('centerPanelComponents') private eCenterPanelComponents: HTMLElement;
    @RefSelector('rightPanelComponents') private eRightPanelComponents: HTMLElement;

    constructor() {
        super(StatusBar.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        if (this.gridOptions.statusBar && this.gridOptions.statusBar.panels) {
            let leftStatusPanelComponents = this.gridOptions.statusBar.panels
                .filter((componentConfig) => componentConfig.align === 'left');
            this.createAndRenderComponents(leftStatusPanelComponents, this.eLeftPanelComponents);

            let centerStatusPanelComponents = this.gridOptions.statusBar.panels
                .filter((componentConfig) => componentConfig.align === 'center');
            this.createAndRenderComponents(centerStatusPanelComponents, this.eCenterPanelComponents);

            let rightStatusPanelComponents = this.gridOptions.statusBar.panels
                .filter((componentConfig) => (!componentConfig.align || componentConfig.align === 'right'));
            this.createAndRenderComponents(rightStatusPanelComponents, this.eRightPanelComponents);
        }
    }

    private createAndRenderComponents(statusBarComponents: any[], ePanelComponent: HTMLElement) {
        _.forEach(statusBarComponents, (componentConfig) => {
                let params = {
                    api: this.gridOptionsWrapper.getApi(),
                    columnApi: this.gridOptionsWrapper.getColumnApi(),
                    context: this.gridOptionsWrapper.getContext()
                };

                this.componentResolver.createAgGridComponent(null,
                    params,
                    'statusBarComponent',
                    componentConfig.componentParams,
                    componentConfig.component)
                    .then((component: Component) => {
                        // default to the component name if no key supplied
                        let key = componentConfig.key || componentConfig.component;
                        this.statusBarService.registerStatusPanelComponent(key, component);

                        ePanelComponent.appendChild(component.getGui());
                    })
            }
        );
    }
}
