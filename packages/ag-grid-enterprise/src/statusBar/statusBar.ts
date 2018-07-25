import {
    _,
    Autowired,
    Component,
    ComponentProvider,
    ComponentResolver,
    Context,
    GridOptions,
    GridOptionsWrapper,
    Promise,
    PostConstruct,
    RefSelector
} from 'ag-grid';
import {AggregationComponent} from "./aggregationComponent";

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

    constructor() {
        super(StatusBar.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        const statusPanelComponents: any[] = [];
        if (this.gridOptions.statusPanel && this.gridOptions.statusPanel.components) {
            statusPanelComponents.push(...this.gridOptions.statusPanel.components);
        } else {
            // if no components specified, we automatically include the aggregation panel
            statusPanelComponents.push({component: 'agAggregationComponent'})
        }

        const componentPromises: Promise<Component>[] = [];
        _.forEach(statusPanelComponents, (componentConfig) => {

                // spl todo: can we find a common params interface
                let params = {
                    api: this.gridOptionsWrapper.getApi(),
                    columnApi: this.gridOptionsWrapper.getColumnApi(),
                    context: this.gridOptionsWrapper.getContext()
                };

                componentPromises.push(
                    this.componentResolver.createAgGridComponent(null,
                        params,
                        componentConfig.component,
                        componentConfig.componentParams,
                        componentConfig.component)
                );
            }
        );

        // we only add the child components on completion to retain the order supplied by the user
        Promise.all(componentPromises)
            .then((resolvedPromises) => {
                _.forEach(resolvedPromises, (component: Component) => {
                    if(_.exists(component)) {
                        this.ePanelComponents.appendChild(component.getGui());
                    }
                })
            });

        this.setVisible(this.gridOptionsWrapper.isEnableStatusBar());
    }
}
