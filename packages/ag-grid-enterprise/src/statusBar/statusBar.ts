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
    Promise,
    RefSelector
} from 'ag-grid-community';
import {StatusBarService} from "./statusBarService";

export class StatusBar extends Component {

    private static TEMPLATE = `<div class="ag-status-bar">
        <div ref="leftPanelComponents" class="ag-status-bar-left"></div>
        <div ref="centerPanelComponents" class="ag-status-bar-center"></div>
        <div ref="rightPanelComponents" class="ag-status-bar-right"></div>
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
        if (this.gridOptions.statusBar && this.gridOptions.statusBar.statusPanels) {
            let leftStatusPanelComponents = this.gridOptions.statusBar.statusPanels
                .filter((componentConfig) => componentConfig.align === 'left');
            this.createAndRenderComponents(leftStatusPanelComponents, this.eLeftPanelComponents);

            let centerStatusPanelComponents = this.gridOptions.statusBar.statusPanels
                .filter((componentConfig) => componentConfig.align === 'center');
            this.createAndRenderComponents(centerStatusPanelComponents, this.eCenterPanelComponents);

            let rightStatusPanelComponents = this.gridOptions.statusBar.statusPanels
                .filter((componentConfig) => (!componentConfig.align || componentConfig.align === 'right'));
            this.createAndRenderComponents(rightStatusPanelComponents, this.eRightPanelComponents);
        }
    }

    private createAndRenderComponents(statusBarComponents: any[], ePanelComponent: HTMLElement) {
        let componentDetails: { key: string; promise: Promise<any> }[] = [];

        _.forEach(statusBarComponents, (componentConfig) => {
                let params = {
                    api: this.gridOptionsWrapper.getApi(),
                    columnApi: this.gridOptionsWrapper.getColumnApi(),
                    context: this.gridOptionsWrapper.getContext()
                };

                const promise = this.componentResolver.createAgGridComponent(componentConfig,
                    params,
                    'statusPanel',
                    componentConfig.statusPanelParams);

                componentDetails.push({
                    // default to the component name if no key supplied
                    key: componentConfig.key || componentConfig.statusPanel,
                    promise
                })
            }
        );

        Promise.all(componentDetails.map((details) => details.promise))
            .then((ignored: any) => {
                _.forEach(componentDetails, (componentDetail) => {
                    componentDetail.promise.then((component: Component) => {
                        this.statusBarService.registerStatusPanel(componentDetail.key, component);
                        ePanelComponent.appendChild(component.getGui());
                    })
                });
            });
    }
}
