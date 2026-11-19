import { RefPlaceholder } from 'ag-stack';

import type {
    AgColumn,
    ElementParams,
    FilterHandler,
    FloatingFilterDisplayParams,
    GridInputTextField,
    IFloatingFilter,
    IFloatingFilterParams,
    SetFilterModel,
} from 'ag-grid-community';
import {
    AgInputTextFieldSelector,
    Component,
    _addFloatingFilterValueTooltip,
    _getFloatingFilterAriaLabel,
} from 'ag-grid-community';

import { SetFilter } from './setFilter';

const SetFloatingFilterElement: ElementParams = {
    tag: 'div',
    cls: 'ag-floating-filter-input ag-set-floating-filter-input',
    role: 'presentation',
    children: [
        {
            tag: 'ag-input-text-field',
            ref: 'eFloatingFilterText',
        },
    ],
};

export class SetFloatingFilterComp<V = string> extends Component implements IFloatingFilter {
    private readonly eFloatingFilterText: GridInputTextField = RefPlaceholder;

    private params: IFloatingFilterParams;
    private getTooltipValue?: () => string;
    private refreshValueTooltip?: () => void;

    constructor() {
        super(SetFloatingFilterElement, [AgInputTextFieldSelector]);
    }

    public init(params: IFloatingFilterParams): void {
        this.params = params;

        this.eFloatingFilterText.setDisabled(true).addGuiEventListener('click', () => this.params.showParentFilter());

        this.setParams(params);
        this.addManagedListeners(params.column as AgColumn, { headerNameChanged: () => this.refreshAriaLabel() });
        this.refreshValueTooltip = _addFloatingFilterValueTooltip(
            this,
            this.beans,
            () => this.params.column,
            this.eFloatingFilterText,
            () => this.getTooltipValue?.()
        );
    }

    private setParams(params: IFloatingFilterParams): void {
        this.refreshAriaLabel();

        if (this.gos.get('enableFilterHandlers')) {
            const reactiveParams = params as unknown as FloatingFilterDisplayParams;
            this.updateFloatingFilterText(reactiveParams.model);
        }
    }

    private refreshAriaLabel(): void {
        this.eFloatingFilterText.setInputAriaLabel(
            _getFloatingFilterAriaLabel(this.beans, this.params.column as AgColumn, this.getLocaleTextFunc())
        );
    }

    public refresh(params: IFloatingFilterParams): void {
        this.params = params;
        this.setParams(params);
    }

    public onParentModelChanged(parentModel: SetFilterModel | null): void {
        this.updateFloatingFilterText(parentModel);
    }

    private parentSetFilterInstance(cb: (instance: SetFilter<V>) => void): void {
        this.params.parentFilterInstance((filter) => {
            if (!(filter instanceof SetFilter)) {
                this.beans.log.error(248);
                return;
            }

            cb(filter);
        });
    }

    private updateFloatingFilterText(parentModel: SetFilterModel | null): void {
        const updateText = (filterOrHandler?: Pick<FilterHandler, 'getModelAsString'>) => {
            this.getTooltipValue = () => filterOrHandler?.getModelAsString?.(parentModel, 'floatingTooltip') ?? '';
            this.eFloatingFilterText.setValue(filterOrHandler?.getModelAsString?.(parentModel) ?? '');
            this.refreshValueTooltip?.();
        };
        if (parentModel == null) {
            updateText();
        } else if (this.gos.get('enableFilterHandlers')) {
            updateText((this.params as unknown as FloatingFilterDisplayParams).getHandler());
        } else {
            this.parentSetFilterInstance(updateText);
        }
    }
}
