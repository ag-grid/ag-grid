import { Component } from "../../widgets/component";
import { Autowired, PostConstruct } from "../../context/context";
import { LocaleService } from "../../localeService";
import { GridOptionsService } from "../../gridOptionsService";
import { AgSelect } from "../../main";
import { clearElement } from "../../utils/dom";
import { warnOnce } from "../../utils/function";

export class PageSizeSelectorComp extends Component {

    @Autowired('localeService') protected readonly localeService: LocaleService;
    @Autowired('gridOptionsService') protected readonly gridOptionsService: GridOptionsService;

    private selectPageSizeComp: AgSelect | undefined;
    private hasEmptyOption = false;

    constructor() {
        super(/* html */`<span class="ag-paging-page-size"></span>`);
    }

    @PostConstruct
    private init() {
        this.addManagedPropertyListener('paginationPageSizeSelector', () => {
            this.onPageSizeSelectorValuesChange();
        });
    }

    private handlePageSizeItemSelected = (): void => {
        if (!this.selectPageSizeComp) { return; }

        const newValue = this.selectPageSizeComp.getValue();

        if (!newValue) { return; }

        const paginationPageSize = Number(newValue);

        if (
            isNaN(paginationPageSize) ||
            paginationPageSize < 1 ||
            paginationPageSize === this.gridOptionsService.get('paginationPageSize')
        ) { return; }

        const options = { paginationPageSize  };

        this.gridOptionsService.updateGridOptions({ options });

        if (this.hasEmptyOption) {
            // Toggle the selector to force a refresh of the options and hide the empty option,
            // as it's no longer needed.
            this.toggleSelectDisplay(true);
        }
    };

    public toggleSelectDisplay(show: boolean) {
        if (this.selectPageSizeComp) {
            this.reset();
        }

        if (!show) { return; }

        this.reloadPageSizesSelector();

        if (!this.selectPageSizeComp) { return; }

        this.appendChild(this.selectPageSizeComp);
    }

    private reset(): void {
        clearElement(this.getGui());

        if (!this.selectPageSizeComp) { return; }

        this.destroyBean(this.selectPageSizeComp);
        this.selectPageSizeComp = undefined;
    }

    private onPageSizeSelectorValuesChange(): void {
        if (!this.selectPageSizeComp) { return; }

        this.reloadPageSizesSelector();
    }

    private reloadPageSizesSelector(): void {
        const pageSizeOptions: (number | string)[] = this.getPageSizeSelectorValues();
        const paginationPageSizeOption = this.gridOptionsService.get('paginationPageSize');
        const shouldAddAndSelectEmptyOption = !paginationPageSizeOption || !pageSizeOptions.includes(paginationPageSizeOption);

        if (shouldAddAndSelectEmptyOption) {
            // When the paginationPageSize option is set to a value that is
            // not in the list of page size options.
            pageSizeOptions.unshift('');

            warnOnce(
                `The paginationPageSize grid option is set to a value that is not in the list of page size options.
                Please make sure that the paginationPageSize grid option is set to one of the values in the paginationPageSizeSelector array, or set the paginationPageSizeSelector to false to hide the page size selector.`
            );
        }

        if (this.selectPageSizeComp) {
            this.destroyBean(this.selectPageSizeComp);
            this.selectPageSizeComp = undefined;
        }

        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const localisedLabel = localeTextFunc('pageSizeShowLabel', 'Show');

        const options = pageSizeOptions.map(value => ({
            value: String(value),
            text: String(value)
        }));

        const localisedAriaLabel = localeTextFunc('ariaPageSizeShowLabel', 'Page Show Count');

        this.selectPageSizeComp = this.createManagedBean(new AgSelect())
            .addOptions(options)
            .setValue(String(shouldAddAndSelectEmptyOption ? '' : paginationPageSizeOption))
            .setAriaLabel(localisedAriaLabel)
            .setLabel(localisedLabel)
            .onValueChange(() => this.handlePageSizeItemSelected());

        this.hasEmptyOption = shouldAddAndSelectEmptyOption;
    }

    private getPageSizeSelectorValues(): number[] {
        const defaultValues = [20, 50, 100];
        const paginationPageSizeSelectorValues = this.gridOptionsService.get('paginationPageSizeSelector');

        if (
            !Array.isArray(paginationPageSizeSelectorValues) ||
            !this.validateValues(paginationPageSizeSelectorValues)
        ) {
            return defaultValues;
        }

        return [...paginationPageSizeSelectorValues].sort((a, b) => a - b);
    }

    private validateValues(values: number[]): boolean {
        if (!values.length) {
            warnOnce(
                `The paginationPageSizeSelector grid option is an empty array. This is most likely a mistake.
                If you want to hide the page size selector, please set the paginationPageSizeSelector to false.`
            );

            return false;
        }

        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const isNumber = typeof value === 'number';
            const isPositive = value > 0;

            if (!isNumber) {
                warnOnce(
                    `The paginationPageSizeSelector grid option contains a non-numeric value.
                    Please make sure that all values in the paginationPageSizeSelector array are numbers.`
                );
                return false;
            }

            if (!isPositive) {
                warnOnce(
                    `The paginationPageSizeSelector grid option contains a negative number or zero.
                    Please make sure that all values in the paginationPageSizeSelector array are positive.`
                );

                return false;
            }
        }

        return true;
    }

    public destroy() {
        this.toggleSelectDisplay(false);
        super.destroy();
    }
}
