import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import { _createElement } from '../../../utils/dom';
import { _makeNull } from '../../../utils/generic';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import type { ICombinedSimpleModel, Tuple } from '../iSimpleFilter';
import { SimpleFilter } from '../simpleFilter';
import type { ITextFilterParams, TextFilterModel } from './iTextFilter';
import { TextFilterHelper } from './textFilterHelper';
import { trimInputForFilter } from './textFilterUtils';

/** temporary type until `TextFilterParams` is updated as breaking change */
type TextFilterDisplayParams = ITextFilterParams &
    FilterDisplayParams<any, any, TextFilterModel | ICombinedSimpleModel<TextFilterModel>>;

export class TextFilter extends SimpleFilter<TextFilterModel, string, AgInputTextField, TextFilterDisplayParams> {
    public readonly filterType = 'text' as const;

    private readonly eValuesFrom: AgInputTextField[] = [];
    private readonly eValuesTo: AgInputTextField[] = [];

    constructor() {
        super('textFilter', new TextFilterHelper());
    }

    protected override defaultDebounceMs: number = 500;

    protected createCondition(position: number): TextFilterModel {
        const type = this.getConditionType(position);

        const model: TextFilterModel = {
            filterType: this.filterType,
            type,
        };

        const values = this.getValuesWithSideEffects(position, true);
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

    protected getInputs(position: number): Tuple<AgInputTextField> {
        const { eValuesFrom, eValuesTo } = this;
        if (position >= eValuesFrom.length) {
            return [null, null];
        }
        return [eValuesFrom[position], eValuesTo[position]];
    }

    protected getValues(position: number): Tuple<string> {
        return this.getValuesWithSideEffects(position, false);
    }

    private getValuesWithSideEffects(position: number, applySideEffects: boolean): Tuple<string> {
        const result: Tuple<string> = [];
        this.forEachPositionInput(position, (element, index, _elPosition, numberOfInputs) => {
            if (index < numberOfInputs) {
                let value = _makeNull(element.getValue());
                if (applySideEffects && this.params.trimInput) {
                    value = trimInputForFilter(value) ?? null;
                    element.setValue(value, true); // ensure clean value is visible
                }
                result.push(value);
            }
        });

        return result;
    }

    protected createValueElement(): HTMLElement {
        const eCondition = _createElement({ tag: 'div', cls: 'ag-filter-body', role: 'presentation' });

        this.createFromToElement(eCondition, this.eValuesFrom, 'from');
        this.createFromToElement(eCondition, this.eValuesTo, 'to');

        return eCondition;
    }

    private createFromToElement(eCondition: HTMLElement, eValues: AgInputTextField[], fromTo: string): void {
        const eValue = this.createManagedBean(new AgInputTextField());
        eValue.addCss(`ag-filter-${fromTo}`);
        eValue.addCss('ag-filter-filter');
        eValues.push(eValue);
        eCondition.appendChild(eValue.getGui());
    }

    protected removeValueElements(startPosition: number, deleteCount?: number): void {
        const removeComps = (eGui: AgInputTextField[]) => this.removeComponents(eGui, startPosition, deleteCount);
        removeComps(this.eValuesFrom);
        removeComps(this.eValuesTo);
    }
}
