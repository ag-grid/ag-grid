import { Component, PostConstruct, _ } from '@ag-grid-community/core';
import { IDateTimeListModel, DateTimeListModel, Page, Entry } from './dateTimeListModel';

interface DateTimeListOptions {
    onValueSelect?: (value: Date) => void;
}

export class DateTimeList_createElementAbstraction extends Component {
    private static TEMPLATE = `<div class="ag-date-time-list"></div>`;

    private currentPageNumber = 0;
    private model: IDateTimeListModel = new DateTimeListModel();

    constructor(private options: DateTimeListOptions = {}) {
        super(DateTimeList_createElementAbstraction.TEMPLATE);
    }

    @PostConstruct
    private init(): void {
        this.showPage(0);
    }

    private showPage(number: number) {
        this.currentPageNumber = number;
        const page = this.model.getPage(new Date(), number);
        const rows = splitArray(page.entries, page.columns.length);
        this.getGui().innerHTML = '';
        const ePage = element({
            className: 'ag-date-time-list-page',
            children: [
                element({
                    className: 'ag-date-time-list-page-title-bar',
                    children: [
                        element({
                            tagName: 'button',
                            className: 'ag-date-time-page-prev-button',
                            textContent: '<',
                            onClick: this.navigate.bind(this, -1)
                        }),
                        element({
                            className: 'ag-date-time-list-page-title',
                            textContent: page.title,
                        }),
                        element({
                            tagName: 'button',
                            className: 'ag-date-time-page-next-button',
                            textContent: '>',
                            onClick: this.navigate.bind(this, 1)
                        }),
                    ],
                }),
                element({
                    className: 'ag-date-time-list-page-entries',
                    children: [
                        element({
                            className: 'ag-date-time-list-page-column-labels-row',
                            children: page.columns.map(column =>
                                element({
                                    className: 'ag-date-time-list-page-column-label',
                                    textContent: column.label,
                                })
                            ),
                        }),
                        rows.map(row =>
                            element({
                                className: 'ag-date-time-list-page-entries-row',
                                children: row.map(entry =>
                                    element({
                                        tagName: 'button',
                                        className: entry.isPadding
                                            ? 'ag-date-time-list-page-entry ag-date-time-list-page-entry-is-padding'
                                            : 'ag-date-time-list-page-entry',
                                        textContent: entry.label,
                                        onClick: this.handleEntryClick.bind(this, entry)
                                    })
                                ),
                            })
                        ),
                    ],
                }),
            ],
        });
        this.getGui().appendChild(ePage);
    }

    private handleEntryClick(entry: Entry) {
        if (this.options.onValueSelect) {
            this.options.onValueSelect(entry.value);
        }
    }

    private navigate(relativePage: number) {
        this.showPage(this.currentPageNumber + relativePage);
    }
}

const element = (options: {
    tagName?: string;
    className: string;
    children?: Array<HTMLElement[] | HTMLElement | string>;
    textContent?: string;
    onClick?: () => void;
}) => {
    const element = document.createElement(options.tagName || 'div');
    element.className = options.className;
    (options.children || []).forEach(child => {
        if (child instanceof HTMLElement) {
            element.appendChild(child);
        } else if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            child.forEach(subChild => element.appendChild(subChild));
        }
    });
    if (options.textContent) {
        element.appendChild(document.createTextNode(options.textContent));
    }
    if (options.onClick) {
        element.addEventListener('click', options.onClick);
    }
    return element;
};

const splitArray = <T>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    array.forEach((value, i) => {
        const chunkIndex = Math.floor(i / chunkSize);
        chunks[chunkIndex] = chunks[chunkIndex] || [];
        chunks[chunkIndex].push(value);
    });
    return chunks;
};
