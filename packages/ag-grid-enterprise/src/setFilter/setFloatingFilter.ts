import type {
    AgColumn,
    AgInputTextField,
    ElementParams,
    FloatingFilterDisplayParams,
    IFloatingFilter,
    IFloatingFilterParams,
    SetFilterModel,
} from 'ag-grid-community';
import { AgInputTextFieldSelector, Component, RefPlaceholder, _error } from 'ag-grid-community';

import { SetFilter } from './setFilter';
import type { SetFilterHandler } from './setFilterHandler';

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
    private readonly eFloatingFilterText: AgInputTextField = RefPlaceholder;

    private params: IFloatingFilterParams;
    private listenerAdded = false;
    private destroyListeners?: (() => void)[];

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
                _error(248);
                return;
            }

            cb(filter);
        });
    }

    private addAvailableValuesListener(): void {
        const addListener = (handler: SetFilterHandler<V>) => {
            if (handler == null || !handler.isAlive()) {
                return;
            }
            const valueModel = handler.valueModel;
            // unlike other filters, what we show in the floating filter can be different, even
            // if another filter changes. this is due to how set filter restricts its values based
            // on selections in other filters, e.g. if you filter Language to English, then the set filter
            // on Country will only show English speaking countries. Thus the list of items to show
            // in the floating filter can change.
            this.destroyListeners = valueModel.addManagedListeners(valueModel, {
                availableValuesChanged: () => this.updateFloatingFilterText(handler.params.model),
                destroyed: () => {
                    this.listenerAdded = false;
                    this.destroyListeners = undefined;
                },
            });
        };
        if (this.gos.get('enableFilterHandlers')) {
            addListener((this.params as unknown as FloatingFilterDisplayParams).getHandler() as SetFilterHandler<V>);
        } else {
            this.parentSetFilterInstance((setFilter) => {
                addListener(setFilter.handler);
            });
        }

        this.listenerAdded = true;
    }

    private updateFloatingFilterText(parentModel: SetFilterModel | null): void {
        if (!this.listenerAdded) {
            this.addAvailableValuesListener();
        }

        if (parentModel == null) {
            this.eFloatingFilterText.setValue('');
        } else {
            if (this.gos.get('enableFilterHandlers')) {
                this.eFloatingFilterText.setValue(
                    (this.params as unknown as FloatingFilterDisplayParams)
                        .getHandler()
                        .getModelAsString?.(parentModel) ?? ''
                );
            } else {
                this.parentSetFilterInstance((setFilter) => {
                    this.eFloatingFilterText.setValue(setFilter.getModelAsString(parentModel));
                });
            }
        }
    }

    public override destroy(): void {
        const destroyListeners = this.destroyListeners;
        if (destroyListeners) {
            destroyListeners.forEach((destroyFunc) => destroyFunc());
            destroyListeners.length = 0;
        }
        super.destroy();
    }
}
