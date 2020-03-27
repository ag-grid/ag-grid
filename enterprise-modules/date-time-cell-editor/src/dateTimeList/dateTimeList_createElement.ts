import { Component, PostConstruct, _ } from '@ag-grid-community/core';
import { IDateTimeListModel, DateTimeListModel, Page } from './dateTimeListModel';

interface DateTimeListOptions {
    onValueSelect?: (value: Date) => void;
}

export class DateTimeList_createElement extends Component {
    private static TEMPLATE = `<div class="ag-date-time-list"></div>`;

    private currentPageNumber = 0;
    private model: IDateTimeListModel = new DateTimeListModel();

    constructor(private options: DateTimeListOptions = {}) {
        super(DateTimeList_createElement.TEMPLATE);
    }

    @PostConstruct
    private init(): void {
        this.showPage(0);
    }

    private showPage(number: number) {
        this.currentPageNumber = number;
        this.getGui().innerHTML = '';
        this.getGui().appendChild(this.createPage(number));
    }

    private createPage(number: number) {
        const page = this.model.getPage(new Date(), number);

        const ePage = document.createElement('div');
        ePage.className = 'ag-date-time-list-page';
        ePage.appendChild(this.createTitleBar(page.title));
        ePage.appendChild(this.createEntries(page));

        return ePage;
    }

    private createTitleBar(title: string) {
        const eTitleBar = document.createElement('div');
        eTitleBar.className = 'ag-date-time-list-page-title-bar';

        eTitleBar.appendChild(
            this.createButton('ag-date-time-list-page-prev-button', '<', this.navigate.bind(this, -1))
        );

        eTitleBar.appendChild(this.createTextDiv('ag-date-time-list-page-title', title));

        eTitleBar.appendChild(
            this.createButton('ag-date-time-list-page-next-button', '>', this.navigate.bind(this, -1))
        );

        return eTitleBar;
    }

    private createTextDiv(className: string, text: string) {
        const eButton = document.createElement('div');
        eButton.className = className;
        eButton.textContent = text;
        return eButton;
    }

    private createButton(className: string, text: string, listener: () => void) {
        const eButton = document.createElement('button');
        eButton.className = className;
        eButton.textContent = text;
        eButton.addEventListener('click', listener);
        return eButton;
    }

    private createEntries(page: Page) {
        const rows = splitArray(page.entries, page.columns.length);

        const ePageEntries = document.createElement('div');
        ePageEntries.className = 'ag-date-time-list-page-entries';

        const eLabelsRow = document.createElement('div');
        eLabelsRow.className = 'ag-date-time-list-page-column-labels-row';
        page.columns.forEach(column => {
            const eLabel = document.createElement('div');
            eLabel.className = 'ag-date-time-list-page-column-label';
            eLabel.textContent = column.label;
            eLabelsRow.appendChild(eLabel);
        });
        ePageEntries.appendChild(eLabelsRow);

        rows.forEach(row => {
            const eRow = document.createElement('div');
            eRow.className = 'ag-date-time-list-page-entries-row';

            row.forEach(entry => {
                const eLabel = this.createButton('ag-date-time-list-page-entry', entry.label, this.handleEntryClick.bind(this, entry.value));
                if (entry.isPadding) {
                    _.addCssClass(eLabel, 'ag-date-time-list-page-entry-is-padding');
                }
                eRow.appendChild(eLabel);
            });

            ePageEntries.appendChild(eRow);
        });

        return ePageEntries;
    }

    private handleEntryClick(value: Date) {
        if (this.options.onValueSelect) {
            this.options.onValueSelect(value);
        }
    }

    private navigate(relativePage: number) {
        this.showPage(this.currentPageNumber + relativePage);
    }
}

const splitArray = <T>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    array.forEach((value, i) => {
        const chunkIndex = Math.floor(i / chunkSize);
        chunks[chunkIndex] = chunks[chunkIndex] || [];
        chunks[chunkIndex].push(value);
    });
    return chunks;
};
