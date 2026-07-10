import { RefPlaceholder } from 'ag-stack';

import type {
    AgColumn,
    ElementParams,
    FloatingFilterDisplayParams,
    GridInputTextField,
    IFloatingFilter,
    IFloatingFilterParams,
    SetFilterModel,
} from 'ag-grid-community';
import { AgInputTextFieldSelector, Component } from 'ag-grid-community';

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

    constructor() {
        super(SetFloatingFilterElement, [AgInputTextFieldSelector]);
    }

    public init(params: IFloatingFilterParams): void {
        this.params = params;

        this.eFloatingFilterText.setDisabled(true).addGuiEventListener('click', () => this.params.showParentFilter());

        this.setParams(params);
    }

    private setParams(params: IFloatingFilterParams): void {
        const displayName = this.beans.colNames.getDisplayNameForColumn(params.column as AgColumn, 'header', true);
        const translate = this.getLocaleTextFunc();

        this.eFloatingFilterText.setInputAriaLabel(`${displayName} ${translate('ariaFilterInput', 'Filter Input')}`);

        if (this.gos.get('enableFilterHandlers')) {
            const reactiveParams = params as unknown as FloatingFilterDisplayParams;
            this.updateFloatingFilterText(reactiveParams.model);
        }
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
        if (parentModel == null) {
            this.eFloatingFilterText.setValue('');
        } else if (this.gos.get('enableFilterHandlers')) {
            this.eFloatingFilterText.setValue(
                (this.params as unknown as FloatingFilterDisplayParams).getHandler().getModelAsString?.(parentModel) ??
                    ''
            );
        } else {
            this.parentSetFilterInstance((setFilter) => {
                this.eFloatingFilterText.setValue(setFilter.getModelAsString(parentModel));
            });
        }
    }
}
