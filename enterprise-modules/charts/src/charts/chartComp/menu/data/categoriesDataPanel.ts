import {
    AgCheckbox,
    AgCheckboxParams,
    AgGroupComponent,
    AgRadioButton,
    AgSelect,
    AgToggleButton,
    AutoScrollService,
    Autowired,
    DragAndDropService,
    DropTarget,
    IAggFunc,
    PostConstruct,
    _
} from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { ChartDataModel, ColState } from "../../model/chartDataModel";
import { ChartMenuService } from "../../services/chartMenuService";
import { DragDataPanel } from "./dragDataPanel";

type AggFuncPreset = 'count' | 'sum' | 'min' | 'max' | 'avg' | 'first' | 'last';

const DEFAULT_AGG_FUNC: AggFuncPreset = 'sum'

export class CategoriesDataPanel extends DragDataPanel {
    private static TEMPLATE = /* html */`<div id="categoriesGroup"></div>`;

    @Autowired('chartMenuService') private readonly chartMenuService: ChartMenuService;

    private aggFuncToggle?: AgToggleButton;
    private aggFuncSelect?: AgSelect;

    constructor(
        chartController: ChartController,
        autoScrollService: AutoScrollService,
        private readonly title: string,
        allowMultipleSelection: boolean,
        private dimensionCols: ColState[],
        private isOpen?: boolean
    ) {
        const maxSelection = undefined;
        super(chartController, autoScrollService, allowMultipleSelection, maxSelection, CategoriesDataPanel.TEMPLATE);
    }

    @PostConstruct
    private init() {
        this.groupComp = this.createBean(new AgGroupComponent({
            title: this.title,
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data',
            expanded: this.isOpen
        }));
        if (this.chartMenuService.isLegacyFormat()) {
            this.createLegacyCategoriesGroup(this.dimensionCols);
            this.clearAggFuncControls();
        } else {
            this.createCategoriesGroup(this.dimensionCols);
            this.createAggFuncControls(this.dimensionCols);
        }
        this.getGui().appendChild(this.groupComp.getGui());
    }

    public refresh(dimensionCols: ColState[]): void {
        if (this.chartMenuService.isLegacyFormat()) {
            if (!this.refreshColumnComps(dimensionCols)) {
                this.recreate(dimensionCols);
            }
        } else {
            this.valuePillSelect?.setValues(dimensionCols, dimensionCols.filter(col => col.selected));
            this.refreshValueSelect(dimensionCols);
            this.refreshAggFuncControls(dimensionCols, this.chartController.getAggFunc());
        }
    }

    private recreate(dimensionCols: ColState[]): void {
        this.isOpen = this.groupComp.isExpanded();
        _.clearElement(this.getGui());
        this.destroyBean(this.groupComp);
        this.dimensionCols = dimensionCols;
        this.init();
    }

    private createCategoriesGroup(columns: ColState[]): void {
        this.createGroup(columns, col => col.displayName ?? '', 'categoryAdd', 'categorySelect', () => !this.chartController.getAggFunc());
    }

    private createLegacyCategoriesGroup(columns: ColState[]): void {
        const inputName = `chartDimension${this.groupComp.getCompId()}`;

        // Display either radio buttons or checkboxes
        // depending on whether the current chart type supports multiple category columns
        const supportsMultipleCategoryColumns = this.allowMultipleSelection;

        columns.forEach(col => {
            const params: AgCheckboxParams = {
                label: col.displayName ?? '',
                value: col.selected,
                inputName
            };
            const comp: AgCheckbox | AgRadioButton = this.groupComp!.createManagedBean(
                supportsMultipleCategoryColumns
                    ? (() => {
                        const checkboxComp = new AgCheckbox(params);
                        checkboxComp.addCssClass('ag-data-select-checkbox');
                        return checkboxComp;
                    })()
                    : new AgRadioButton(params)
            );

            this.addChangeListener(comp, col);
            this.groupComp!.addItem(comp);
            this.columnComps.set(col.colId, comp);

            if (supportsMultipleCategoryColumns) this.addDragHandle(comp, col);
        });

        if (supportsMultipleCategoryColumns) {
            const categoriesGroupGui = this.groupComp.getGui();
            
            const dropTarget: DropTarget = {
                getIconName: () => DragAndDropService.ICON_MOVE,
                getContainer: () => categoriesGroupGui,
                onDragging: (params) => this.onDragging(params),
                onDragLeave: () => this.onDragLeave(),
                isInterestedIn: this.isInterestedIn.bind(this),
                targetContainsSource: true
            };

            this.dragAndDropService.addDropTarget(dropTarget);
            this.addDestroyFunc(() => this.dragAndDropService.removeDropTarget(dropTarget));
        }
    }

    private createAggFuncControls(dimensionCols: ColState[]): void {
        const aggFunc = this.chartController.getAggFunc();
        this.groupComp.addItem(this.aggFuncToggle = this.createBean(new AgToggleButton({
            label: this.chartTranslationService.translate('aggregate'),
            labelAlignment: 'left',
            labelWidth: 'flex',
            inputWidth: 'flex',
            value: aggFunc != undefined,
            onValueChange: (value) => {
                const aggFunc = value ? DEFAULT_AGG_FUNC : undefined;
                this.chartController.setAggFunc(aggFunc);
                this.aggFuncSelect?.setValue(aggFunc, true);
                this.aggFuncSelect?.setDisplayed(aggFunc != undefined);
            },
        })));
        this.groupComp.addItem(this.aggFuncSelect = this.createBean(new AgSelect<AggFuncPreset>({
            options: [
                { value: 'sum', text: this.chartTranslationService.translate('sum') },
                { value: 'first', text: this.chartTranslationService.translate('first') },
                { value: 'last', text: this.chartTranslationService.translate('last') },
                { value: 'min', text: this.chartTranslationService.translate('min') },
                { value: 'max', text: this.chartTranslationService.translate('max') },
                { value: 'count', text: this.chartTranslationService.translate('count') },
                { value: 'avg', text: this.chartTranslationService.translate('avg') },
            ],
            value: typeof aggFunc === 'string' ? aggFunc : undefined,
            onValueChange: (value) => {
                this.chartController.setAggFunc(value);
            },
        })));
        this.refreshAggFuncControls(dimensionCols, aggFunc);
    }

    private refreshAggFuncControls(dimensionCols: ColState[], aggFunc: string | IAggFunc | undefined): void {
        const selectedDimensions = dimensionCols.filter(col => col.selected);
        const supportsAggregation = selectedDimensions.some(col => col.colId !== ChartDataModel.DEFAULT_CATEGORY);
        this.aggFuncToggle?.setValue(aggFunc != undefined);
        this.aggFuncSelect?.setValue(typeof aggFunc === 'string' ? aggFunc : undefined, true);
        this.aggFuncToggle?.setDisplayed(supportsAggregation);
        this.aggFuncSelect?.setDisplayed(supportsAggregation && (aggFunc != undefined));
    }

    private clearAggFuncControls(): void {
        this.aggFuncToggle = this.aggFuncToggle && this.destroyBean(this.aggFuncToggle);
        this.aggFuncSelect = this.aggFuncSelect && this.destroyBean(this.aggFuncSelect);
    }

    protected destroy(): void {
        this.clearAggFuncControls();
        this.groupComp = this.destroyBean(this.groupComp)!;
        super.destroy();
    }
}
