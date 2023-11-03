import {Component} from "../../widgets/component";
import {Autowired, PostConstruct} from "../../context/context";
import {LocaleService} from "../../localeService";
import {GridOptionsService} from "../../gridOptionsService";
import {PaginationProxy} from "../paginationProxy";
import {AgSelect} from "../../main";
import {clearElement} from "../../utils/dom";

export class PageSizeSelectorComp extends Component {

    @Autowired('localeService') protected readonly localeService: LocaleService;
    @Autowired('gridOptionsService') protected readonly gridOptionsService: GridOptionsService;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;

    private eSelectPageSize: AgSelect | undefined;

    constructor() {
        super(
            `<span class="ag-paging-page-size"></span>`
        );
    }

    @PostConstruct
    private init() {
        const paginationPageSizeSelector = this.gridOptionsService.get('paginationPageSizeSelector');
        this.addManagedPropertyListener(
            'paginationPageSizeSelector',
            () => this.onPageSizeSelectorValuesChange(),
        );

        if (paginationPageSizeSelector) {
            this.show();
        }
    }

    private get isSelectorVisible() {
        return this.eSelectPageSize !== undefined;
    }

    private handlePageSizeItemSelected = (): void => {
        if (!this.eSelectPageSize) {
            return;
        }

        const newValue = this.eSelectPageSize.getValue();
        if (!newValue) { return; }

        const newPageSize = Number(newValue);
        if (isNaN(newPageSize) || newPageSize < 1) { return; }
        if (newPageSize === this.paginationProxy.getPageSize()) { return; }

        this.paginationProxy.setPageSize(newPageSize);
    };

    public show(): void {
        if (this.isSelectorVisible) {
            this.reset();
        }

        this.reloadPageSizesSelector();
        if (!this.eSelectPageSize) {
            return;
        }

        this.getGui().appendChild(this.eSelectPageSize.getGui());
    }

    public hide(): void {
        if (!this.isSelectorVisible) {
            return;
        }

        this.reset();
    }

    private reset(): void {
        clearElement(this.getGui());

        if (this.eSelectPageSize) {
            this.destroyBean(this.eSelectPageSize);
            this.eSelectPageSize = undefined;
        }
    }

    private onPageSizeSelectorValuesChange(): void {
        if (!this.isSelectorVisible) {
            return;
        }

        this.reloadPageSizesSelector();
    }

    private reloadPageSizesSelector(): void {
        const pageSizesList = this.getPageSizeSelectorValues();

        let currentPageSize = this.paginationProxy.getPageSize();
        if (!currentPageSize || !pageSizesList.includes(currentPageSize)) {
            currentPageSize = pageSizesList[0];
            this.paginationProxy.setPageSize(currentPageSize);
        }

        const options = pageSizesList.map(
            value => ({ value: String(value), text: String(value) })
        );

        if (this.eSelectPageSize) {
            this.destroyBean(this.eSelectPageSize);
            this.eSelectPageSize = undefined;
        }

        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const localisedLabel = localeTextFunc('pageSizeShowLabel', 'Show');

        this.eSelectPageSize = this.createManagedBean(new AgSelect());
        this.eSelectPageSize.addOptions(options)
            .setValue(String(currentPageSize))
            .setLabel(localisedLabel)
            .setLabelAlignment('left')
            .setAriaLabel(localisedLabel)
            .onValueChange(() => this.handlePageSizeItemSelected());
    }

    private getPageSizeSelectorValues(): number[] {
        const paginationPageSizeSelector = this.gridOptionsService.get('paginationPageSizeSelector');
        if (Array.isArray(paginationPageSizeSelector)) {
            return paginationPageSizeSelector;
        } else {
            // Default page sizes when user provides `true` in the config.
            return [10, 25, 50, 100];
        }
    }

    public destroy() {
        this.hide();
        super.destroy();
    }
}
