import { Component, ExpressionComponentParams, FilterExpression, KeyCode, PartialStateType, PostConstruct, RefSelector, StateManager, _ } from "@ag-grid-community/core";
import { ExpressionComponent } from "./interfaces";
import { initialiseAndAttachChildren } from "./filterComponentUtils";

export abstract class RootComponent<F extends FilterExpression> extends Component implements ExpressionComponent {
    private stateManager: StateManager<F>;

    @RefSelector('eRoot') private readonly refRoot: HTMLElement;
    @RefSelector('eChildren') protected readonly refChildren: HTMLElement;
    @RefSelector('eApplyButton') private readonly refApplyButton: HTMLElement;
    @RefSelector('eClearButton') private readonly refClearButton: HTMLElement;
    @RefSelector('eResetButton') private readonly refResetButton: HTMLElement;

    protected constructor(
        private readonly childComponents: (ExpressionComponent<F> & Component)[],
        private readonly exprType: F['type'],
    ) {
        super(/* html */`
            <div class="ag-filter-wrapper" ref="eRoot" role="presentation">
                <div class="ag-root-filter-body-wrapper"  ref="eChildren" role="presentation">
                </div>
                <button
                    type="button"
                    ref="eApplyButton"
                    class="ag-standard-button ag-filter-apply-panel-button"
                >
                Apply
                </button>
                <button
                    type="button"
                    ref="eClearButton"
                    class="ag-standard-button ag-filter-apply-panel-button"
                >
                Clear
                </button>
                <button
                    type="button"
                    ref="eResetButton"
                    class="ag-standard-button ag-filter-apply-panel-button"
                >
                Reset
                </button>
            </div>
        `);
    }

    public setParameters(params: ExpressionComponentParams<F>) {
        this.stateManager = params.stateManager;

        this.childComponents.forEach((comp) => {
            comp.setParameters({ ...params });

            this.addDestroyFunc(() => this.destroyBean(comp));
        });

        this.stateManager.addUpdateListener(this, (u) => {
            this.checkCompatibleUpdate(u);
            this.updateButtonState()
        });
        this.stateManager.addTransientUpdateListener(this, (u) => {
            this.checkCompatibleUpdate(u);
            this.updateButtonState()
        });

        this.updateButtonState();
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

        this.refApplyButton.addEventListener('click', () => {
            this.stateManager.applyExpression(this);
        });
        this.refResetButton.addEventListener('click', () => {
            this.stateManager.revertToAppliedExpression(this);
        });
        this.refClearButton.addEventListener('click', () => {
            this.stateManager.mutateTransientExpression(this, null);
            this.stateManager.applyExpression(this);
        });

        this.refRoot.addEventListener('keypress', (e) => {
            if (e.key !== KeyCode.ENTER) { return };

            const isValid = this.stateManager.isTransientExpressionValid();
            const isNull = this.stateManager.isTransientExpressionNull();
            if (isValid || isNull) {
                this.stateManager.applyExpression(this);
            }
        });
    }

    private updateButtonState(): void {
        const isValid = this.stateManager.isTransientExpressionValid();
        const isNull = this.stateManager.isTransientExpressionNull();

        _.setDisabled(this.refApplyButton, !isValid && !isNull);
        _.setDisabled(this.refClearButton, !isNull);

        _.setDisplayed(this.refApplyButton, !isNull);
        _.setDisplayed(this.refClearButton, isNull);
    }
}
