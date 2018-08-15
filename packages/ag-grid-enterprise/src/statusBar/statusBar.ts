import {
    _,
    Autowired,
    Component,
    ComponentProvider,
    ComponentResolver,
    Context,
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

    @RefSelector('panelComponents') private ePanelComponents: HTMLElement;

    // used to determine if we show or hide the status bar (assuming isEnableStatusBar is set)
    // we can't readily determine if a user supplied component is actually visible, so if a user supplied component exists
    // we'll show the status bar regardless
    private userSuppliedComponents = false;

    constructor() {
        super(StatusBar.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        const statusPanelComponents: any[] = [];
        if (this.gridOptions.statusPanel && this.gridOptions.statusPanel.components) {
            statusPanelComponents.push(...this.gridOptions.statusPanel.components);

            this.userSuppliedComponents = this.gridOptions.statusPanel.components.map((componentConfig) => componentConfig.component)
                .filter((componentName) => componentName !== 'agAggregationComponent')
                .length > 0;
        } else {
            // if no components specified, we automatically include the aggregation panel
            statusPanelComponents.push({component: 'agAggregationComponent'})
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

                        if (component.addEventListener && !this.userSuppliedComponents) {
                            component.addEventListener(Component.EVENT_VISIBLE_CHANGED, this.onChildComponentChanged.bind(this));
                        }
                        this.ePanelComponents.appendChild(component.getGui());
                    }
                })
            });

        this.setVisible(this.gridOptionsWrapper.isEnableStatusBar());
    }

    private onChildComponentChanged(params: { type: string, visible: boolean}) {
        this.setVisible(this.gridOptionsWrapper.isEnableStatusBar() &&
            (this.userSuppliedComponents || params.visible)
        );
    }
}
