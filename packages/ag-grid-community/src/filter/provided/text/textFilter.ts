import { _makeNull } from '../../../agStack/utils/generic';
import { AgInputTextField } from '../../../agStack/widgets/agInputTextField';
import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import { _createElement } from '../../../utils/element';
import type { GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { ICombinedSimpleModel, Tuple } from '../iSimpleFilter';
import { SimpleFilter } from '../simpleFilter';
import type { ITextFilterParams, TextFilterModel } from './iTextFilter';
import { DEFAULT_TEXT_FILTER_OPTIONS } from './textFilterConstants';
import { mapValuesFromTextFilterModel } from './textFilterUtils';

/** temporary type until `TextFilterParams` is updated as breaking change */
type TextFilterDisplayParams = ITextFilterParams &
    FilterDisplayParams<any, any, TextFilterModel | ICombinedSimpleModel<TextFilterModel>>;

export class TextFilter extends SimpleFilter<TextFilterModel, string, GridInputTextField, TextFilterDisplayParams> {
    public readonly filterType = 'text' as const;

    private readonly eValuesFrom: GridInputTextField[] = [];
    private readonly eValuesTo: GridInputTextField[] = [];

    constructor() {
        super('textFilter', mapValuesFromTextFilterModel, DEFAULT_TEXT_FILTER_OPTIONS);
    }

    protected override defaultDebounceMs: number = 500;

    protected createCondition(position: number): TextFilterModel {
        const type = this.getConditionType(position);

        const model: TextFilterModel = {
            filterType: this.filterType,
            type,
        };

        const values = this.getValues(position);
        if (values.length > 0) {
            model.filter = values[0];
        }
        if (values.length > 1) {
            model.filterTo = values[1];
        }

        return model;
    }

    protected areSimpleModelsEqual(aSimple: TextFilterModel, bSimple: TextFilterModel): boolean {
        return (
            aSimple.filter === bSimple.filter && aSimple.filterTo === bSimple.filterTo && aSimple.type === bSimple.type
        );
    }

    protected getInputs(position: number): Tuple<GridInputTextField> {
        const { eValuesFrom, eValuesTo } = this;
        if (position >= eValuesFrom.length) {
            return [null, null];
        }
        return [eValuesFrom[position], eValuesTo[position]];
    }

    protected getValues(position: number): Tuple<string> {
        const result: Tuple<string> = [];
        this.forEachPositionInput(position, (element, index, _elPosition, numberOfInputs) => {
            if (index < numberOfInputs) {
                result.push(_makeNull(element.getValue()));
            }
        });

        return result;
    }

    protected createEValue(): HTMLElement {
        const eCondition = _createElement({ tag: 'div', cls: 'ag-filter-body', role: 'presentation' });

        const { eValuesFrom, eValuesTo } = this;
        this.createFromToElement(eCondition, eValuesFrom, 'from');
        this.createFromToElement(eCondition, eValuesTo, 'to');

        return eCondition;
    }

    private createFromToElement(eCondition: HTMLElement, eValues: GridInputTextField[], fromTo: string): void {
        const eValue = this.createManagedBean<GridInputTextField>(new AgInputTextField());
        eValue.addCss(`ag-filter-${fromTo}`);
        eValue.addCss('ag-filter-filter');
        eValues.push(eValue);
        eCondition.appendChild(eValue.getGui());
    }

    protected removeEValues(startPosition: number, deleteCount?: number): void {
        const removeComps = (eGui: GridInputTextField[]) => this.removeComponents(eGui, startPosition, deleteCount);
        const { eValuesFrom, eValuesTo } = this;
        removeComps(eValuesFrom);
        removeComps(eValuesTo);
    }
}
