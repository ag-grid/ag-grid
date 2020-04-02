import { Component, PostConstruct, _, RefSelector } from '@ag-grid-community/core';
import { IDateTimeListModel, DateTimeListModel, Entry } from './dateTimeListModel';

interface DateTimeListOptions {
    onValueSelect: (value: Date) => void;
    initialValue?: Date;
}

export class DateTimeList extends Component {
    private static TEMPLATE = /*html*/
        `<div class="ag-date-time-list" tabindex="-1">
            <div class="ag-date-time-list-page">
                <div class="ag-date-time-list-page-title-bar">
                    <button ref="ePrevPageButton" class="ag-date-time-list-page-prev-button">&lt;</button>
                    <div ref="eTitle" class="ag-date-time-list-page-title"></div>
                    <button ref="eNextPageButton" class="ag-date-time-list-page-next-button">&gt;</button>
                </div>
                <div ref="eLabelsRow" class="ag-date-time-list-page-column-labels-row"></div>
                <div ref="eEntriesTable" class="ag-date-time-list-page-entries"></div>
            </div>
        </div>
    `;

    @RefSelector('ePrevPageButton') private ePrevPageButton: HTMLButtonElement;
    @RefSelector('eTitle') private eTitle: HTMLElement;
    @RefSelector('eNextPageButton') private eNextPageButton: HTMLButtonElement;
    @RefSelector('eLabelsRow') private eLabelsRow: HTMLDivElement;
    @RefSelector('eEntriesTable') private eEntriesTable: HTMLDivElement;

    private currentPageNumber = 0;
    private model: IDateTimeListModel = new DateTimeListModel();
    private columnLabels: HTMLElement[] = [];
    private rowComps: DateTimeListPageEntriesRowComp[] = [];
    private onValueSelect: (value: Date) => void;
    private initialValue: Date;
    private currentX: number;
    private currentY: number;

    constructor(options: DateTimeListOptions) {
        super();
        this.onValueSelect = options.onValueSelect;
        this.initialValue = this.model.roundToValue(options.initialValue || new Date());
    }

    @PostConstruct
    public init(): void {
        this.setTemplate(DateTimeList.TEMPLATE);
        this.addDestroyableEventListener(this.ePrevPageButton, 'click', this.navigatePage.bind(this, -1));
        this.addDestroyableEventListener(this.eNextPageButton, 'click', this.navigatePage.bind(this, 1));
        this.addDestroyableEventListener(this.getGui(), 'focus', this.handleFocusChange.bind(this, true));
        this.addDestroyableEventListener(this.getGui(), 'blur', this.handleFocusChange.bind(this, false));
        this.addDestroyableEventListener(this.getGui(), 'keydown', this.handleKeyDown.bind(this));
        this.showPage(0);
    }

    public focus() {
        this.getGui().focus();
        this.handleFocusChange(true);
    }

    private showPage(number: number) {
        this.currentPageNumber = number;
        const page = this.model.getPage(this.initialValue, number);

        this.eTitle.textContent = page.title;

        page.entries.forEach((row, i) => this.getRowComp(i).setEntries(row));
        this.rowComps.forEach((comp, i) => comp.setDisplayed(i < page.entries.length));

        page.columns.forEach((column, i) => this.getColumnLabel(i).textContent = column.label);
        this.columnLabels.forEach((columnLabel, i) => _.setDisplayed(columnLabel, i < page.columns.length));
    }

    private getRowComp(index: number ) {
        if (!this.rowComps[index]) {
            const rowComp = new DateTimeListPageEntriesRowComp(this.onValueSelect);
            this.appendChild(rowComp, this.eEntriesTable);
            this.rowComps[index] = rowComp;
        }
        return this.rowComps[index];
    }

    private getColumnLabel(index: number ) {
        if (!this.columnLabels[index]) {
            const label = _.loadTemplate(`<div class="ag-date-time-list-page-column-label"></div>`);
            this.appendChild(label, this.eLabelsRow);
            this.columnLabels[index] = label;
        }
        return this.columnLabels[index];
    }

    private handleKeyDown(e: KeyboardEvent) {
        e.preventDefault();
        if (e.key === 'ArrowUp') {
            this.navigateCurrentCell(0, -1);
        }
        if (e.key === 'ArrowDown') {
            this.navigateCurrentCell(0, 1);
        }
        if (e.key === 'ArrowLeft') {
            this.navigateCurrentCell(-1, 0);
        }
        if (e.key === 'ArrowRight') {
            this.navigateCurrentCell(1, 0);
        }
    }

    private handleFocusChange(hasFocus: boolean) {
        _.addOrRemoveCssClass(this.getGui(), 'ag-has-focus', hasFocus);
    }

    private navigatePage(relativePage: number) {
        this.showPage(this.currentPageNumber + relativePage);
    }

    private navigateCurrentCell(x: number, y: number) {
        // TODO - next up: implement arrow key navigation
        throw new Error("not implemented");
    }
}


class DateTimeListPageEntriesRowComp extends Component {
    private static TEMPLATE = /*html*/ `<div class="ag-date-time-list-page-entries-row"></div>`;

    private entryComps: DateTimeListPageEntryComp[] = [];

    public constructor(private onValueSelect: (value: Date) => void) {
        super(DateTimeListPageEntriesRowComp.TEMPLATE);
    }

    public setEntries(entries: Entry[], currentValue?: Date) {
        entries.forEach((entry, i) => this.getEntryComponent(i).setEntry(entry, currentValue));
        this.entryComps.forEach((comp, i) => comp.setDisplayed(i < entries.length));
    }

    public setCurrentValue(value: Date) {
        this.entryComps.forEach(c => c.setCurrentValue(value));
    }

    private getEntryComponent(index: number) {
        if (!this.entryComps[index]) {
            this.entryComps[index] = new DateTimeListPageEntryComp(this.onValueSelect);
            this.appendChild(this.entryComps[index]);
        }
        return this.entryComps[index];
    }
}


class DateTimeListPageEntryComp extends Component {
    private static TEMPLATE = /*html*/ `<div class="ag-date-time-list-page-entry"></div>`;

    private entry: Entry;
    private currentValue: Date;

    public constructor(private onValueSelect: (value: Date) => void) {
        super(DateTimeListPageEntryComp.TEMPLATE);
        this.addDestroyableEventListener(this.getGui(), 'click', this.handleClick.bind(this));
    }

    public setEntry(entry: Entry, currentValue?: Date) {
        if (currentValue) {
            this.currentValue = currentValue;
        }
        this.entry = entry;
        this.getGui().textContent = entry.label;
        _.addOrRemoveCssClass(this.getGui(), 'ag-date-time-list-page-entry-is-padding', entry.isPadding);
        this.onDataChange();
    }

    public setCurrentValue(value: Date) {
        this.currentValue = value;
        this.onDataChange();
    }

    private handleClick() {
        this.onValueSelect(this.entry.value);
    }

    private onDataChange() {
        console.log(this.entry.value, this.currentValue)
        _.addOrRemoveCssClass(this.getGui(),
            'ag-date-time-list-page-entry-is-current',
            this.entry.value && this.currentValue && this.entry.value.getTime() === this.currentValue.getTime());
    }
}
