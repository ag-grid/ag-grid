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
        <div ref="panelComponents" class="ag-status-bar-comps"></div>
    </div>`;

    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('componentProvider') private componentProvider: ComponentProvider;
    @Autowired('componentResolver') private componentResolver: ComponentResolver;
    @Autowired('gridApi') private gridApi: GridApi;

    @RefSelector('panelComponents') private ePanelComponents: HTMLElement;

    constructor() {
        super(StatusBar.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        const statusPanelComponents: any[] = [];
        if (this.gridOptions.statusPanel && this.gridOptions.statusPanel.components) {
            statusPanelComponents.push(...this.gridOptions.statusPanel.components);
        }

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
                        this.ePanelComponents.appendChild(component.getGui());
                    }
                })
            });

        this.setVisible(statusPanelComponents.length > 0);
    }
}
