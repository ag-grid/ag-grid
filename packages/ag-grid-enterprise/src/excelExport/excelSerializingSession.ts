import { _isExpressionString, _last } from 'ag-stack';

import type {
    AgColumn,
    AgColumnGroup,
    Column,
    ColumnGroup,
    ExcelCell,
    ExcelColumn,
    ExcelExportParams,
    ExcelImage,
    ExcelNote,
    ExcelOOXMLDataType,
    ExcelRow,
    ExcelStyle,
    ExcelWorksheet,
    ExcelWorksheetConfigParams,
    GridSerializingParams,
    IFormulaService,
    INotesService,
    Note,
    ProcessNoteForExportParams,
    RowAccumulator,
    RowHeightCallbackParams,
    RowNode,
    RowSpanningAccumulator,
} from 'ag-grid-community';
import { BaseGridSerializingSession, _addGridCommonParams, _mergeDeep } from 'ag-grid-community';

import { getHeightFromProperty } from './assets/excelUtils';
import type { Workbook } from './excelXlsxFactory';

export interface StyleLinkerInterface {
    rowType: 'HEADER_GROUPING' | 'HEADER' | 'BODY';
    rowIndex: number;
    value: string;
    column?: Column;
    columnGroup?: ColumnGroup;
    node?: RowNode;
}

interface ExcelMixedStyle {
    key: string;
    excelID: string;
    result: ExcelStyle;
}

export interface ExcelGridSerializingParams extends ExcelWorksheetConfigParams, GridSerializingParams {
    formulaSvc?: IFormulaService;
    baseExcelStyles: ExcelStyle[];
    styleLinker: (params: StyleLinkerInterface) => string[];
    frozenRowCount?: number;
    frozenColumnCount?: number;
    workbook: Workbook;
    headerRowCount?: number;
    notesSvc?: INotesService;
    pivotModeActive?: boolean;
}

export class ExcelSerializingSession extends BaseGridSerializingSession<ExcelRow[]> {
    private readonly config: ExcelGridSerializingParams & ExcelExportParams;
    private readonly stylesByIds: { [key: string]: ExcelStyle };
    private readonly formulaSvc?: IFormulaService;
    private readonly notesSvc?: INotesService;

    private mixedStyles: { [key: string]: ExcelMixedStyle } = {};
    private mixedStyleCounter: number = 0;

    private readonly excelStyles: (ExcelStyle & { quotePrefix?: 1 })[];
    private readonly workbook: Workbook;

    private readonly rows: ExcelRow[] = [];
    private cols: ExcelColumn[];
    private columnsToExport: AgColumn[];
    private frozenRowCount: number = 0;
    private skipFrozenRows = false;
    private frozenColumnCount: number = 0;
    private skipFrozenColumns = false;

    constructor(config: ExcelGridSerializingParams) {
        super(config);
        this.formulaSvc = config.formulaSvc;
        this.notesSvc = config.notesSvc;
        this.config = Object.assign({}, config);
        this.workbook = config.workbook;

        this.stylesByIds = {};
        for (const style of this.config.baseExcelStyles) {
            this.stylesByIds[style.id] = style;
        }

        const quotePrefixStyle = { id: '_quotePrefix', quotePrefix: 1 } as const;
        this.stylesByIds[quotePrefixStyle.id] = quotePrefixStyle;
        this.excelStyles = [...this.config.baseExcelStyles, quotePrefixStyle];
    }

    public addCustomContent(customContent: ExcelRow[]): void {
        for (const row of customContent) {
            const rowLen = this.rows.length + 1;
            let outlineLevel: number | undefined;

            if (!this.config.suppressRowOutline && row.outlineLevel != null) {
                outlineLevel = row.outlineLevel;
            }

            const rowObj: ExcelRow = {
                height: getHeightFromProperty(rowLen, row.height || this.config.rowHeight),
                cells: (row.cells || []).map((cell, idx) => {
                    const image = this.addImage(rowLen, this.columnsToExport[idx], cell.data?.value as string);

                    let excelStyles: string[] | null = null;

                    if (cell.styleId) {
                        excelStyles = typeof cell.styleId === 'string' ? [cell.styleId] : cell.styleId;
                    }

                    const excelStyleId = this.getStyleId(excelStyles);

                    if (image) {
                        return this.createCell(
                            excelStyleId,
                            this.getDataTypeForValue(image.value),
                            image.value == null ? '' : image.value,
                            undefined,
                            cell.note
                        );
                    }

                    const value = cell.data?.value ?? '';
                    const type = this.getDataTypeForValue(value);

                    if (cell.mergeAcross) {
                        return this.createMergedCell(excelStyleId, type, value, cell.mergeAcross, cell.note);
                    }

                    return this.createCell(excelStyleId, type, value, undefined, cell.note);
                }),
                outlineLevel,
            };

            if (row.collapsed != null) {
                rowObj.collapsed = row.collapsed;
            }
            if (row.hidden != null) {
                rowObj.hidden = row.hidden;
            }

            this.rows.push(rowObj);
        }
    }

    public onNewHeaderGroupingRow(): RowSpanningAccumulator {
        const currentCells: ExcelCell[] = [];
        const { freezeRows, headerRowHeight } = this.config;

        this.rows.push({
            cells: currentCells,
            height: getHeightFromProperty(this.rows.length + 1, headerRowHeight),
        });

        if (freezeRows) {
            this.frozenRowCount++;
        }

        return {
            onColumn: (
                columnGroup: AgColumnGroup,
                header: string,
                index: number,
                span: number,
                collapsibleGroupRanges: number[][]
            ) => {
                const styleIds: string[] = this.config.styleLinker({
                    rowType: 'HEADER_GROUPING',
                    rowIndex: 1,
                    value: `grouping-${header}`,
                    columnGroup,
                });
                currentCells.push({
                    ...this.createMergedCell(
                        this.getStyleId(styleIds),
                        this.getDataTypeForValue('string'),
                        header,
                        span
                    ),
                    collapsibleRanges: collapsibleGroupRanges,
                });
            },
        };
    }

    public onNewHeaderRow(): RowAccumulator {
        const { freezeRows, headerRowHeight } = this.config;

        if (freezeRows) {
            this.frozenRowCount++;
        }

        return this.onNewRow(this.onNewHeaderColumn, headerRowHeight);
    }

    public onNewBodyRow(node?: RowNode): RowAccumulator {
        const { freezeRows, rowHeight } = this.config;

        if (!this.skipFrozenRows) {
            if (freezeRows === 'headersAndPinnedRows' && node?.rowPinned === 'top') {
                this.frozenRowCount++;
            } else if (typeof freezeRows === 'function') {
                if (freezeRows(_addGridCommonParams(this.gos, { node: node! }))) {
                    this.frozenRowCount++;
                } else {
                    this.skipFrozenRows = true;
                }
            } else {
                this.skipFrozenRows = true;
            }
        }

        const rowAccumulator = this.onNewRow(this.onNewBodyColumn, rowHeight);

        if (node) {
            this.addRowOutlineIfNecessary(node);
        }

        return rowAccumulator;
    }

    public override prepare(columnsToExport: AgColumn[]): void {
        super.prepare(columnsToExport);
        this.columnsToExport = [...columnsToExport];
        this.cols = columnsToExport.map((col, i) => this.convertColumnToExcel(col, i));
    }

    public parse(): string {
        // adding custom content might have made some rows wider than the grid, so add new columns
        const longestRow = this.rows.reduce((a, b) => Math.max(a, b.cells.length), 0);
        while (this.cols.length < longestRow) {
            this.cols.push(this.convertColumnToExcel(null, this.cols.length + 1));
        }

        const worksheet = this.createWorksheet();
        return this.addWorksheetToWorkbook(worksheet);
    }

    private createWorksheet(): ExcelWorksheet {
        const { sheetName } = this.config;

        let name: string;
        if (sheetName != null) {
            const sheetNameValue =
                typeof sheetName === 'function' ? sheetName(_addGridCommonParams(this.gos, {})) : sheetName;

            name = String(sheetNameValue).substring(0, 31);
        } else {
            name = 'ag-grid';
        }

        return {
            name,
            table: {
                columns: this.cols,
                rows: this.rows,
            },
        };
    }

    private addRowOutlineIfNecessary(node: RowNode): void {
        const { gos, suppressRowOutline, rowGroupExpandState = 'expanded' } = this.config;
        const isGroupHideOpenParents = gos.get('groupHideOpenParents');

        if (isGroupHideOpenParents || suppressRowOutline || node.level == null) {
            return;
        }

        const padding = node.footer ? 1 : 0;
        const currentRow = _last(this.rows);

        // if level is different than uiLevel, the parent is hidden
        // due to `groupHideParentOfSingleChild`
        if (node.uiLevel == null || node.level === node.uiLevel) {
            // Excel only supports up to 7 levels of outline
            const outlineLevel = Math.min(node.level + padding, 7);
            currentRow.outlineLevel = outlineLevel;
        }

        if (rowGroupExpandState === 'expanded') {
            return;
        }

        const collapseAll = rowGroupExpandState === 'collapsed';

        if (node.isExpandable()) {
            const isExpanded = !collapseAll && node.expanded;
            currentRow.collapsed = !isExpanded;
        }

        currentRow.hidden =
            // always show the node if there is no parent to be expanded
            !!node.parent &&
            // or if it is a child of the root node
            node.parent.level !== -1 &&
            (collapseAll || this.isAnyParentCollapsed(node.parent));
    }

    private isAnyParentCollapsed(node?: RowNode | null): boolean {
        while (node && node.level !== -1) {
            if (!node.expanded) {
                return true;
            }

            node = node.parent;
        }

        return false;
    }

    private convertColumnToExcel(column: AgColumn | null, index: number): ExcelColumn {
        const columnWidth = this.config.columnWidth;
        const headerValue = column ? this.extractHeaderValue(column) : undefined;
        const displayName = headerValue ?? '';
        const filterAllowed = column ? column.isFilterAllowed() : false;
        if (columnWidth) {
            if (typeof columnWidth === 'number') {
                return { width: columnWidth, displayName, filterAllowed };
            }

            return { width: columnWidth({ column, index }), displayName, filterAllowed };
        }

        if (column) {
            const smallestUsefulWidth = 75;
            return { width: Math.max(column.getActualWidth(), smallestUsefulWidth), displayName, filterAllowed };
        }

        return {
            displayName,
            filterAllowed,
        };
    }

    private onNewHeaderColumn(
        rowIndex: number,
        currentCells: ExcelCell[]
    ): (column: AgColumn, index: number, node: RowNode) => void {
        return (column) => {
            const nameForCol = this.extractHeaderValue(column);
            const styleIds: string[] = this.config.styleLinker({
                rowType: 'HEADER',
                rowIndex,
                value: nameForCol,
                column,
            });
            currentCells.push(
                this.createCell(this.getStyleId(styleIds), this.getDataTypeForValue('string'), nameForCol)
            );
        };
    }

    private onNewBodyColumn(
        rowIndex: number,
        currentCells: ExcelCell[]
    ): (column: AgColumn, index: number, node: RowNode) => void {
        let skipCols = 0;
        const { freezeColumns, rightToLeft } = this.config;
        return (column, index, node) => {
            if (skipCols > 0) {
                skipCols -= 1;
                return;
            }

            if (!this.skipFrozenColumns) {
                const pinned = column.getPinned();
                const isPinnedLeft = pinned === true || pinned === 'left';

                if (freezeColumns === 'pinned' && pinned && isPinnedLeft !== rightToLeft) {
                    this.frozenColumnCount++;
                } else if (
                    typeof freezeColumns === 'function' &&
                    freezeColumns(_addGridCommonParams(this.gos, { column }))
                ) {
                    this.frozenColumnCount++;
                } else {
                    this.skipFrozenColumns = true;
                }
            }

            const { value: valueForCell, valueFormatted } = this.extractRowCellValue({
                column,
                node,
                currentColumnIndex: index,
                accumulatedRowIndex: rowIndex,
                type: 'excel',
                useRawFormula: true,
            });
            const rawValueForCell = valueForCell;
            const valueForCellString =
                typeof rawValueForCell === 'bigint' ? rawValueForCell.toString() : rawValueForCell;
            const styleIds: string[] = this.config.styleLinker({
                rowType: 'BODY',
                rowIndex,
                value: rawValueForCell,
                column,
                node,
            });
            const excelStyleId: string | null = this.getStyleId(styleIds);
            const colSpan = column.getColSpan(node);
            const addedImage = this.addImage(rowIndex, column, valueForCellString);
            const note = this.resolveBodyCellNote({
                accumulatedRowIndex: rowIndex,
                column,
                node,
            });

            // A "Show Values As" cell shows a presentation string (e.g. `25.00%`, or `#N/A` when dormant): export
            // that displayed text, like CSV, not the raw number (which Excel would render as a bare decimal). The
            // cheap `column.showValuesAs` check (null for every ordinary column) short-circuits before the group
            // node's expansion is evaluated — mirroring `getValueForDisplay`'s gate.
            const showValuesAsText =
                !addedImage &&
                this.transformValues &&
                column.showValuesAs != null &&
                (!node.group || !this.valueSvc.displayIgnoresAggData(node));

            if (addedImage) {
                currentCells.push(
                    this.createCell(
                        excelStyleId,
                        this.getDataTypeForValue(addedImage.value),
                        addedImage.value == null ? '' : addedImage.value,
                        undefined,
                        note
                    )
                );
            } else if (colSpan > 1) {
                skipCols = colSpan - 1;
                currentCells.push(
                    this.createMergedCell(
                        excelStyleId,
                        showValuesAsText ? 's' : this.getDataTypeForValue(rawValueForCell),
                        showValuesAsText ? (valueFormatted ?? valueForCellString) : valueForCellString,
                        colSpan - 1,
                        note
                    )
                );
            } else {
                const isFormula =
                    !showValuesAsText && column.allowFormula && this.formulaSvc?.isFormula(valueForCellString);
                const dataType = showValuesAsText ? 's' : this.getDataTypeForValue(rawValueForCell);
                let cellValue = valueForCellString;
                if (isFormula) {
                    cellValue = this.formulaSvc?.updateFormulaByOffset({
                        value: valueForCellString,
                        rowDelta: rowIndex - (node.formulaRowIndex! + 1),
                        useRefFormat: false,
                    });
                } else if (showValuesAsText) {
                    // The presentation text, like the merged-cell path — a cell style's dataType would otherwise
                    // bypass createCell's valueFormatted substitution and leak the raw transformed value.
                    cellValue = valueFormatted ?? valueForCellString;
                }
                const cell = this.createCell(excelStyleId, isFormula ? 'f' : dataType, cellValue, valueFormatted, note);

                currentCells.push(cell);
            }
        };
    }

    private onNewRow(
        onNewColumnAccumulator: (
            rowIndex: number,
            currentCells: ExcelCell[]
        ) => (column: AgColumn, index: number, node: RowNode) => void,
        height?: number | ((params: RowHeightCallbackParams) => number)
    ): RowAccumulator {
        const currentCells: ExcelCell[] = [];
        this.rows.push({
            cells: currentCells,
            height: getHeightFromProperty(this.rows.length + 1, height),
        });
        return {
            onColumn: onNewColumnAccumulator.bind(this, this.rows.length, currentCells)(),
        };
    }

    private addWorksheetToWorkbook(worksheet: ExcelWorksheet): string {
        const { excelStyles, config } = this;

        this.mapSharedStrings(worksheet);

        if (this.frozenColumnCount) {
            config.frozenColumnCount = this.frozenColumnCount;
        }

        if (this.frozenRowCount) {
            config.frozenRowCount = this.frozenRowCount;
        }

        return this.workbook.addWorksheet(excelStyles, worksheet, config);
    }

    private mapSharedStrings(worksheet: ExcelWorksheet): void {
        for (const row of worksheet.table.rows) {
            for (const cell of row.cells) {
                const data = cell.data;
                if (data?.type !== 's') {
                    continue;
                }

                const value = data.value;

                if (value == null || value === '') {
                    continue;
                }

                data.value = this.workbook.getStringPosition(String(value)).toString();
            }
        }
    }

    private getDataTypeForValue(valueForCell?: any): ExcelOOXMLDataType {
        if (valueForCell === undefined) {
            return 'empty';
        }

        let dataType: ExcelOOXMLDataType = 's';
        try {
            if (this.isNumerical(valueForCell)) {
                dataType = 'n';
            }
        } catch {
            // no need to handle - error thrown to avoid type conversion
        }
        return dataType;
    }

    private getTypeFromStyle(style: ExcelStyle | null, value: string | null): ExcelOOXMLDataType | null {
        if (this.isFormula(value)) {
            return 'f';
        }

        if (style?.dataType) {
            switch (style.dataType.toLocaleLowerCase()) {
                case 'formula':
                    return 'f';
                case 'string':
                    return 's';
                case 'number':
                    return 'n';
                case 'datetime':
                    return 'd';
                case 'error':
                    return 'e';
                case 'boolean':
                    return 'b';
                default:
                    this.log.warn(162, { id: style.id, dataType: style.dataType });
            }
        }

        return null;
    }

    private addImage(
        rowIndex: number,
        column: AgColumn,
        value: string
    ): { image: ExcelImage; value?: string } | undefined {
        if (!this.config.addImageToCell) {
            return;
        }

        const addedImage = this.config.addImageToCell(rowIndex, column, value);

        if (!addedImage) {
            return;
        }

        this.workbook.addBodyImageToMap(
            addedImage.image,
            rowIndex,
            column,
            this.columnsToExport,
            this.config.rowHeight
        );

        return addedImage;
    }

    private createCell(
        styleId: string | null | undefined,
        type: ExcelOOXMLDataType,
        value: string,
        valueFormatted?: string | null,
        note?: ExcelNote
    ): ExcelCell {
        const actualStyle: ExcelStyle | null = this.getStyleById(styleId);
        if (!actualStyle?.dataType && type === 's' && valueFormatted != null) {
            value = valueFormatted;
        }
        const processedType = this.getTypeFromStyle(actualStyle, value) || type;

        const { type: processedCellType, value: processedValue, escaped } = this.getCellValue(processedType, value);
        const styles: string[] = [];

        if (actualStyle) {
            styles.push(styleId!);
        }

        if (escaped) {
            styles.push('_quotePrefix');
        }

        styleId = this.getStyleId(styles) || undefined;

        return {
            styleId,
            data: {
                type: processedCellType,
                value: processedValue,
            },
            note: note?.text ? note : undefined,
        };
    }

    private createMergedCell(
        styleId: string | null,
        type: ExcelOOXMLDataType,
        value: string,
        numOfCells: number,
        note?: ExcelNote
    ): ExcelCell {
        const actualStyle = this.getStyleById(styleId);
        const valueToUse = value == null ? '' : value;
        const processedType = this.getTypeFromStyle(actualStyle, valueToUse) || type;
        const { type: processedCellType, value: processedValue } = this.getCellValue(processedType, valueToUse);

        return {
            styleId: actualStyle ? styleId! : undefined,
            data: {
                type: processedCellType,
                value: processedValue,
            },
            mergeAcross: numOfCells,
            note: note?.text ? note : undefined,
        };
    }

    private resolveBodyCellNote(params: {
        accumulatedRowIndex: number;
        column: AgColumn;
        node: RowNode;
    }): ExcelNote | undefined {
        const { processNoteCallback, suppressGridNotesExport } = this.config;
        const shouldAutoExportGridNotes = !suppressGridNotesExport && !!this.notesSvc?.hasDataSource();
        const shouldFetchGridNote = !!this.notesSvc && (shouldAutoExportGridNotes || !!processNoteCallback);

        const gridNote = shouldFetchGridNote
            ? this.notesSvc?.getNote({ rowNode: params.node, column: params.column, location: 'cell' })
            : undefined;

        let excelNote: ExcelNote | undefined;
        if (shouldAutoExportGridNotes && gridNote?.text != null && gridNote.text !== '') {
            excelNote = { text: gridNote.text, author: gridNote.author };
        }

        if (!processNoteCallback) {
            return excelNote;
        }

        const callbackResult = processNoteCallback(this.getCellNoteExportParams(params, gridNote, excelNote));

        if (callbackResult === undefined) {
            return excelNote;
        }

        if (callbackResult?.text == null || callbackResult.text === '') {
            return undefined;
        }

        return { text: callbackResult.text, author: callbackResult.author };
    }

    private getCellNoteExportParams(
        params: {
            accumulatedRowIndex: number;
            column: AgColumn;
            node: RowNode;
        },
        gridNote: Note | undefined,
        excelNote: ExcelNote | undefined
    ): ProcessNoteForExportParams {
        const { column, node, accumulatedRowIndex } = params;
        const valueSvc = this.valueSvc;
        const valueFrom = this.valueFrom;
        const value = valueSvc.getDisplayValue(column, node, valueFrom, this.transformValues);

        return _addGridCommonParams(this.gos, {
            accumulatedRowIndex,
            column,
            node,
            value,
            type: 'excel',
            parseValue: (valueToParse: string) =>
                valueSvc.parseValue(column, node, valueToParse, valueSvc.getValue(column, node, valueFrom)),
            formatValue: (valueToFormat: any) =>
                (this.transformValues ? valueSvc.formatTransformedValue(column, node, valueToFormat) : undefined) ??
                valueSvc.formatValue(column, node, valueToFormat) ??
                valueToFormat,
            gridNote,
            excelNote,
        });
    }

    private getCellValue(
        type: ExcelOOXMLDataType,
        value: string | null
    ): {
        type: ExcelOOXMLDataType;
        value: string | null;
        escaped?: boolean;
    } {
        let escaped = false;

        if (value == null || value === '' || type === 'empty') {
            return { type: 'empty', value: null, escaped: false };
        }

        if (type === 's') {
            value = String(value);

            if (value[0] === "'") {
                escaped = true;
                value = value.slice(1);

                if (value === '') {
                    return { type: 'empty', value: null, escaped: false };
                }
            }
        } else if (type === 'f') {
            value = this.addXlfnPrefix(value).slice(1);
        } else if (type === 'n') {
            const numberValue = Number(value);

            if (isNaN(numberValue)) {
                return { type: 'empty', value: null, escaped: false };
            } else {
                value = numberValue.toString();
            }
        }

        return { type, value, escaped };
    }

    private addXlfnPrefix(value: string): string {
        if (!value) {
            return value;
        }

        const concatRegex = /(^|[^A-Z0-9._])(CONCAT)(\s*\()/gi;

        return value.replace(concatRegex, (_match, prefix, fn, openParen) => `${prefix}_xlfn.${fn}${openParen}`);
    }

    private getStyleId(styleIds?: string[] | null): string | null {
        if (!styleIds?.length) {
            return null;
        }

        const filteredStyleIds = styleIds.filter((styleId) => this.stylesByIds[styleId] != null);
        if (!filteredStyleIds.length) {
            return null;
        }

        if (filteredStyleIds.length === 1) {
            return filteredStyleIds[0];
        }

        const key: string = filteredStyleIds.join('-');
        if (!this.mixedStyles[key]) {
            this.addNewMixedStyle(filteredStyleIds);
        }
        return this.mixedStyles[key].excelID;
    }

    private addNewMixedStyle(styleIds: string[]): void {
        this.mixedStyleCounter += 1;
        const excelId = `mixedStyle${this.mixedStyleCounter}`;
        const resultantStyle: ExcelStyle = {} as ExcelStyle;

        for (const styleId of styleIds) {
            const excelStyle = this.stylesByIds[styleId];
            if (excelStyle) {
                _mergeDeep(resultantStyle, excelStyle, true, true);
            }
        }

        resultantStyle.id = excelId;
        const key: string = styleIds.join('-');
        this.mixedStyles[key] = {
            excelID: excelId,
            key: key,
            result: resultantStyle,
        };
        this.excelStyles.push(resultantStyle);
        this.stylesByIds[excelId] = resultantStyle;
    }

    private isFormula(value: string | null) {
        if (value == null) {
            return false;
        }
        const strValue = String(value);
        return this.config.autoConvertFormulas && _isExpressionString(strValue);
    }

    private isNumerical(value: any): boolean {
        if (typeof value === 'bigint') {
            return false;
        }
        return isFinite(value) && value !== '' && !isNaN(parseFloat(value));
    }

    private getStyleById(styleId?: string | null): ExcelStyle | null {
        if (styleId == null) {
            return null;
        }
        return this.stylesByIds[styleId] || null;
    }
}
