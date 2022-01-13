import { Component, KeyCode, PostConstruct, RefSelector, _ } from "@ag-grid-community/core";
import { FilterExpression, StateManager, ExpressionComponentParams, PartialStateType } from "../interfaces";
import { ExpressionComponent } from "./interfaces";
import { initialiseAndAttachChildren } from "./filterComponentUtils";
import { RootComponent } from "./rootComponent";

export abstract class RootFloatingComponent<F extends FilterExpression> extends Component implements ExpressionComponent {
    protected stateManager: StateManager<F>;

    @RefSelector('eRoot') private readonly refRoot: HTMLElement;
    @RefSelector('eChildren') protected readonly refChildren: HTMLElement;

    protected constructor(
        protected readonly childComponents: (ExpressionComponent<F> & Component)[],
        protected readonly exprType: F['type'],
    ) {
        super(/* html */`
            <div class="ag-floating-filter-input ag-filter-v2" ref="eRoot" role="presentation">
                <div ref="eChildren" role="presentation">
                </div>
            </div>
        `);
    }

    public setParameters(params: ExpressionComponentParams<F>) {
        this.stateManager = params.stateManager;

        this.childComponents.forEach((comp) => {
            comp.setParameters({ ...params });

            this.addDestroyFunc(() => this.destroyBean(comp));
        });

        [
            this.stateManager.addUpdateListener(this, (u) => {
                this.checkCompatibleUpdate(u);
            }),
            this.stateManager.addTransientUpdateListener(this, (u) => {
                this.checkCompatibleUpdate(u);
            }),
        ].forEach(f => this.addDestroyFunc(f));

        RootComponent.setRootEventHandlers(this, this.refRoot, this.stateManager);
    }

    private checkCompatibleUpdate(u: F | PartialStateType<F> | null) {
        if (u != null && u.type !== this.exprType) {
            throw new Error("AG Grid - changing root expression type is not supported!");
        }
    }

    @PostConstruct
    private rootPostConstruct() {
        initialiseAndAttachChildren(
            { createBean: (b) => this.createBean(b), destroyBean: (b) => this.destroyBean(b), addDestroyFunc: (f) => this.addDestroyFunc(f) },
            this.refChildren,
            this.childComponents
        );
    }
}
