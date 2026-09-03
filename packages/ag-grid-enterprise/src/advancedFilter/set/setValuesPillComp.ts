import type { AgComponentPopupPositionParams } from 'ag-stack';

import type {
    AgColumn,
    BeanCollection,
    Component,
    PopupPositionParams,
    PopupService,
    SetFilterModel,
    SetFilterModelValue,
    SharedFilterUi,
} from 'ag-grid-community';

import { PillComp } from '../builder/pillComp';
import type { AdvancedFilterSetService } from './advancedFilterSetService';
import { joinSetPath } from './setOperandsParser';

const MAX_SUMMARY_VALUES = 3;

/** The value list of a set option in the Builder, opening the column's own Set Filter to change it. */
export class SetValuesPillComp extends PillComp {
    private popupSvc: PopupService;
    private advFilterSetSvc: AdvancedFilterSetService;
    private values: SetFilterModelValue;
    private filterUi?: SharedFilterUi & Component;
    /** The instance arrives asynchronously, so a second click before it does must not open a second popup. */
    private opening = false;
    private hidePopup?: () => void;

    public override wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.popupSvc = beans.popupSvc!;
        this.advFilterSetSvc = beans.advFilterSetSvc as AdvancedFilterSetService;
    }

    constructor(
        private readonly params: {
            column: AgColumn;
            values: SetFilterModelValue;
            update: (values: SetFilterModelValue) => void;
            cssClass: string;
            ariaLabel: string;
        }
    ) {
        super(params);
        this.values = params.values;
    }

    public override postConstruct(): void {
        super.postConstruct();
        this.addDestroyFunc(() => this.hidePicker());
    }

    protected override renderValue(): void {
        const values = this.values;
        this.writeLabel(values.length ? this.summarise(values, this.params.column) : null);
    }

    /** A long value list shortened for display: `[a, b, c, +4 more]`. Only the values shown are formatted. */
    private summarise(values: SetFilterModelValue, column: AgColumn): string {
        const total = values.length;
        const shown: string[] = [];
        for (let i = 0, len = Math.min(total, MAX_SUMMARY_VALUES); i < len; ++i) {
            const key = values[i];
            const path = this.advFilterSetSvc.getPath(column, key);
            shown.push(path ? joinSetPath(path) : String(key ?? ''));
        }
        if (total > MAX_SUMMARY_VALUES) {
            shown.push(this.advFilterExpSvc.translate('advancedFilterSetMore', [String(total - MAX_SUMMARY_VALUES)]));
        }
        return `[${shown.join(', ')}]`;
    }

    protected override open(): void {
        if (this.filterUi || this.opening) {
            return;
        }
        const { column, update } = this.params;
        // Never null: to the Set Filter that is "everything selected", which is the opposite of no values.
        const model: SetFilterModel = { filterType: 'set', values: this.values };
        const compDetails = this.advFilterSetSvc.createFilterUi(column, model, (newModel) => {
            this.values = newModel?.values ?? this.advFilterSetSvc.getAllKeys(column) ?? this.values;
            this.renderValue();
            update(this.values);
        });
        if (!compDetails) {
            return;
        }
        this.opening = true;
        compDetails.newAgStackInstance().then((comp) => {
            this.opening = false;
            if (!this.isAlive()) {
                this.destroyBean(comp);
                return;
            }
            this.filterUi = comp as SharedFilterUi & Component;
            const ePopupGui = comp.getGui();
            ePopupGui.classList.add('ag-advanced-filter-builder-set-picker');
            const positionParams: AgComponentPopupPositionParams<PopupPositionParams> = {
                ePopup: ePopupGui,
                type: 'advancedFilterBuilderSet',
                eventSource: this.ePill,
                position: 'under',
                alignSide: this.gos.get('enableRtl') ? 'right' : 'left',
                keepWithinBounds: true,
            };
            const addPopupRes = this.popupSvc.addPopup({
                eChild: ePopupGui,
                closeOnEsc: true,
                closedCallback: (event) => this.hidePicker(event instanceof KeyboardEvent),
                anchorToElement: this.ePill,
                positionCallback: () => this.popupSvc.positionPopupByComponent(positionParams),
                ariaLabel: this.params.ariaLabel,
            });
            this.hidePopup = addPopupRes.hideFunc;
            this.filterUi.afterGuiAttached?.({ container: 'columnFilter' });
        });
    }

    /** Escape leaves focus nowhere, so the pill takes it back; a click outside already chose where to go. */
    private hidePicker(keepFocus?: boolean): void {
        const { filterUi, hidePopup } = this;
        if (!filterUi) {
            return;
        }
        this.filterUi = undefined;
        this.hidePopup = undefined;
        hidePopup?.();
        this.destroyBean(filterUi);
        if (keepFocus) {
            this.ePill.focus();
        }
    }
}
