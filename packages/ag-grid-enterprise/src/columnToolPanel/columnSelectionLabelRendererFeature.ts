import type {
    Column,
    ColumnSelectionPanelSource,
    ComponentType,
    IColumnSelectionLabelRendererComp,
    IColumnSelectionLabelRendererParams,
    IColumnSelectionPanelParams,
    ProvidedColumnGroup,
    UserCompDetails,
} from 'ag-grid-community';
import { BeanStub, _addGridCommonParams } from 'ag-grid-community';

const ColumnLabelRendererComponent: ComponentType<IColumnSelectionLabelRendererComp> = {
    name: 'columnLabelRenderer',
    optionalMethods: ['refresh'],
    supportsJsFunction: true,
};

export function isColumnSelectionLabelRendererEnabled(definition: IColumnSelectionPanelParams): boolean {
    return definition.columnLabelRenderer != null || definition.columnLabelRendererSelector != null;
}

export class ColumnSelectionLabelRendererFeature extends BeanStub {
    private renderer: IColumnSelectionLabelRendererComp | null = null;
    private rendererClass: any = null;
    private rendererVersion = 0;

    constructor(
        private readonly eLabel: HTMLElement,
        private readonly definition: IColumnSelectionPanelParams,
        private readonly source: ColumnSelectionPanelSource,
        private readonly column: Column | null,
        private readonly columnGroup: ProvidedColumnGroup | null,
        private readonly getDisplayName: () => string | null
    ) {
        super();
    }

    public postConstruct(): void {
        this.refresh();
    }

    public refresh(): void {
        const params = this.getParams();
        if (this.renderer == null) {
            this.setFallback(params.displayName);
        }

        const details = this.beans.userCompFactory.getCompDetails<
            IColumnSelectionPanelParams,
            IColumnSelectionLabelRendererComp
        >(this.definition, ColumnLabelRendererComponent, undefined, params);

        if (!details) {
            this.destroyRenderer(params.displayName);
            return;
        }

        const { renderer } = this;
        if (
            renderer != null &&
            this.rendererClass === details.componentClass &&
            renderer.refresh?.(details.params) === true
        ) {
            // Cancel any replacement still initialising with older parameters.
            this.rendererVersion++;
            return;
        }

        this.createRenderer(details);
    }

    private createRenderer(details: UserCompDetails<IColumnSelectionLabelRendererComp>): void {
        const version = ++this.rendererVersion;

        details.newAgStackInstance().then((renderer) => {
            if (version !== this.rendererVersion || !this.isAlive()) {
                this.destroyBean(renderer);
                return;
            }

            if (renderer == null) {
                return;
            }

            const oldRenderer = this.renderer;
            this.renderer = renderer;
            this.rendererClass = details.componentClass;
            this.eLabel.replaceChildren(renderer.getGui());
            this.destroyBean(oldRenderer);
        });
    }

    private getParams(): IColumnSelectionLabelRendererParams {
        const { gos, column, columnGroup, source } = this;
        return _addGridCommonParams(gos, {
            displayName: this.getDisplayName(),
            column,
            columnGroup,
            source,
        });
    }

    private setFallback(displayName: string | null): void {
        this.eLabel.textContent = displayName ?? '';
    }

    private destroyRenderer(displayName?: string | null): void {
        this.rendererVersion++;
        this.destroyBean(this.renderer);
        this.renderer = null;
        this.rendererClass = null;
        if (displayName === undefined) {
            this.eLabel.replaceChildren();
        } else {
            this.setFallback(displayName);
        }
    }

    public override destroy(): void {
        this.destroyRenderer();
        super.destroy();
    }
}
