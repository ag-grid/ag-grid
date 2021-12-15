import { Component, RefSelector, _, CustomExpression, Autowired, UserComponentFactory, StateManager, ColumnModel, ExpressionComponentParams, AgPromise } from "@ag-grid-community/core";
import { ExpressionComponent } from "./interfaces";

export class CustomExpressionComponent<E extends CustomExpression<string>> extends Component implements ExpressionComponent<E> {
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;
    @Autowired('columnModel') private columnModel: ColumnModel;

    @RefSelector('eCustomFilterWrapper') private readonly refCustomFilterWrapper: HTMLElement;
    private childComponent: AgPromise<Component> | null;
    private stateManager: StateManager<E>;

    public constructor() {
        super(/* html */`
            <div class="ag-filter-wrapper" role="presentation" ref="eCustomFilterWrapper">
            </div>
        `);
    }

    public setParameters(params: ExpressionComponentParams<E>) {
        this.stateManager = params.stateManager;

        const expr = this.stateManager.getTransientExpression();
        if (expr == null) { return; }

        this.childComponent = this.createCustomComponent(expr.operation || 'unknown', params);
        this.childComponent?.then((child) => {
            const childElement = child?.getGui();
            if (childElement) {
                this.refCustomFilterWrapper.appendChild(childElement);
            }

            this.addDestroyFunc(() => this.destroyBean(child))
        });
    }

    private createCustomComponent(name: string, params: ExpressionComponentParams<E>): AgPromise<Component> | null {
        const compDetails = this.userComponentFactory.getFilterV2Details({ filter: name }, params);
        if (!compDetails) { return null; }
        
        return compDetails.newAgStackInstance();
    }
}
