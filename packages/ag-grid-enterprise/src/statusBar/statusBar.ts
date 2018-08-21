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
} from 'ag-grid';

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

    @RefSelector('leftPanelComponents') private eLeftPanelComponents: HTMLElement;
    @RefSelector('centerPanelComponents') private eCenterPanelComponents: HTMLElement;
    @RefSelector('rightPanelComponents') private eRightPanelComponents: HTMLElement;

    constructor() {
        super(StatusBar.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        if (this.gridOptions.statusPanel && this.gridOptions.statusPanel.components) {
            let leftStatusPanelComponents = this.gridOptions.statusPanel.components
                .filter((componentConfig) => componentConfig.align === 'left');
            this.createAndRenderComponents(leftStatusPanelComponents, this.eLeftPanelComponents);

            let centerStatusPanelComponents = this.gridOptions.statusPanel.components
                .filter((componentConfig) => componentConfig.align === 'center');
            this.createAndRenderComponents(centerStatusPanelComponents, this.eCenterPanelComponents);

            let rightStatusPanelComponents = this.gridOptions.statusPanel.components
                .filter((componentConfig) => (!componentConfig.align || componentConfig.align === 'right'));
            this.createAndRenderComponents(rightStatusPanelComponents, this.eRightPanelComponents);
        }
    }

    private createAndRenderComponents(statusPanelComponents: any[], ePanelComponent: HTMLElement) {
        const componentPromises: Promise<Component>[] = [];
        _.forEach(statusPanelComponents, (componentConfig) => {

                let params = {
                    api: this.gridOptionsWrapper.getApi(),
                    columnApi: this.gridOptionsWrapper.getColumnApi(),
                    context: this.gridOptionsWrapper.getContext()
                };

                componentPromises.push(
                    this.componentResolver.createAgGridComponent(null,
                        params,
                        'statusBarComponent',
                        componentConfig.componentParams,
                        componentConfig.component)
                );
            }
        );

        // we only add the child components on completion to retain the order supplied by the user
        Promise.all(componentPromises)
            .then((resolvedPromises) => {
                _.forEach(resolvedPromises, (component: Component) => {
                    if (_.exists(component)) {
                        ePanelComponent.appendChild(component.getGui());
                    }
                })
            });
    }
}
