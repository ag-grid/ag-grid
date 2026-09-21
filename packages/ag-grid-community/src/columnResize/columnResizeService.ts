import { dispatchColumnResizedEvent } from '../columns/columnEventUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { ColKey } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { HeaderCellCtrl, IHeaderCellComp } from '../headerRendering/cells/column/headerCellCtrl';
import type { IHeaderGroupCellComp } from '../headerRendering/cells/columnGroup/headerGroupCellCtrl';
import { _clamp } from '../utils/number';
import { GroupResizeFeature } from './groupResizeFeature';
import { ResizeFeature } from './resizeFeature';

export interface ColumnResizeSet {
    columns: AgColumn[];
    ratios: number[];
    width: number;
}

export class ColumnResizeService extends BeanStub implements NamedBean {
    beanName = 'colResize' as const;

    public setColumnWidths(
        columnWidths: {
            key: ColKey; // @key - the column who's size we want to change
            newWidth: number; // @newWidth - width in pixels
        }[],
        shiftKey: boolean, // @takeFromAdjacent - if user has 'shift' pressed, then pixels are taken from adjacent column
        finished: boolean, // @finished - ends up in the event, tells the user if more events are to come
        source: ColumnEventType
    ): void {
        const sets: ColumnResizeSet[] = [];

        const { colModel, gos, visibleCols } = this.beans;

        for (const columnWidth of columnWidths) {
            const col = colModel.getCol(columnWidth.key);

            if (!col) {
                continue;
            }

            sets.push({
                width: columnWidth.newWidth,
                ratios: [1],
                columns: [col],
            });

            // if user wants to do shift resize by default, then we invert the shift operation
            const defaultIsShift = gos.get('colResizeDefault') === 'shift';

            if (defaultIsShift) {
                shiftKey = !shiftKey;
            }

            if (shiftKey) {
                const otherCol = visibleCols.getColAfter(col);
                if (!otherCol) {
                    continue;
                }

                const widthDiff = col.getActualWidth() - columnWidth.newWidth;
                const otherColWidth = otherCol.getActualWidth() + widthDiff;

                sets.push({
                    width: otherColWidth,
                    ratios: [1],
                    columns: [otherCol],
                });
            }
        }

        if (sets.length === 0) {
            return;
        }

        this.resizeColumnSets({
            resizeSets: sets,
            finished,
            source,
        });
    }

    // method takes sets of columns and resizes them. either all sets will be resized, or nothing
    // be resized. this is used for example when user tries to resize a group and holds shift key,
    // then both the current group (grows), and the adjacent group (shrinks), will get resized,
    // so that's two sets for this method.
    public resizeColumnSets(params: {
        resizeSets: ColumnResizeSet[];
        finished: boolean;
        source: ColumnEventType;
    }): void {
        const { resizeSets, finished, source } = params;

        for (let i = 0, len = resizeSets.length; i < len; ++i) {
            if (checkMinAndMaxWidthsForSet(resizeSets[i])) {
                continue;
            }
            // Not resizing past min/max, but a finished drag still owes its event.
            if (finished) {
                dispatchColumnResizedEvent(this.eventSvc, resizeSets[0].columns, finished, source);
            }
            return;
        }

        const allResizedCols: AgColumn[] = [];
        let atLeastOneColChanged = false;
        let pinnedColChanged = false;

        // Indexed by slot in `columns`, parallel to `ratios`: keying by id lets a frozen col shift the rest
        // onto each other's ratio. Reused across sets; only `finishedCols` needs clearing, widths precede reads.
        const newWidths: number[] = [];
        const finishedCols: boolean[] = [];
        const subsetIndexes: number[] = [];

        for (let s = 0, setCount = resizeSets.length; s < setCount; ++s) {
            const { width, columns, ratios } = resizeSets[s];
            const colCount = columns.length;

            finishedCols.length = colCount;
            finishedCols.fill(false);

            for (let i = 0; i < colCount; ++i) {
                allResizedCols.push(columns[i]);
            }

            // the loop below goes through each col. if a col exceeds it's min/max width,
            // it then gets set to its min/max width and the column is removed marked as 'finished'
            // and the calculation is done again leaving this column out. take for example columns
            // {A, width: 50, maxWidth: 100}
            // {B, width: 50}
            // {C, width: 50}
            // and then the set is set to width 600 - on the first pass the grid tries to set each column
            // to 200. it checks A and sees 200 > 100 and so sets the width to 100. col A is then marked
            // as 'finished' and the calculation is done again with the remaining cols B and C, which end up
            // splitting the remaining 500 pixels.
            let finishedColsGrew = true;
            let loopCount = 0;

            while (finishedColsGrew) {
                loopCount++;
                if (loopCount > 1000) {
                    // this should never happen, but in the future, someone might introduce a bug here,
                    // so we stop the browser from hanging and report bug properly
                    this.error(31);
                    break;
                }

                finishedColsGrew = false;

                subsetIndexes.length = 0;
                let subsetRatioTotal = 0;
                let pixelsToDistribute = width;

                for (let i = 0; i < colCount; ++i) {
                    if (finishedCols[i]) {
                        pixelsToDistribute -= newWidths[i];
                    } else {
                        subsetIndexes.push(i);
                        subsetRatioTotal += ratios[i];
                    }
                }

                // because we are not using all of the ratios (cols can be missing),
                // we scale the ratio. if all columns are included, then subsetRatioTotal=1,
                // and so the ratioScale will be 1.
                const ratioScale = 1 / subsetRatioTotal;

                for (let i = 0, len = subsetIndexes.length; i < len; ++i) {
                    const index = subsetIndexes[i];
                    let colNewWidth: number;

                    if (i === len - 1) {
                        colNewWidth = pixelsToDistribute;
                    } else {
                        colNewWidth = Math.round(ratios[index] * width * ratioScale);
                        pixelsToDistribute -= colNewWidth;
                    }

                    const col = columns[index];
                    const minWidth = col.getMinWidth();
                    const maxWidth = col.getMaxWidth();

                    if (colNewWidth < minWidth) {
                        colNewWidth = minWidth;
                        finishedCols[index] = true;
                        finishedColsGrew = true;
                    } else if (maxWidth > 0 && colNewWidth > maxWidth) {
                        colNewWidth = maxWidth;
                        finishedCols[index] = true;
                        finishedColsGrew = true;
                    }

                    newWidths[index] = colNewWidth;
                }
            }

            for (let i = 0; i < colCount; ++i) {
                const col = columns[i];
                const newWidth = newWidths[i];
                const actualWidth = col.getActualWidth();

                if (actualWidth !== newWidth) {
                    col.setActualWidth(newWidth, source);
                    atLeastOneColChanged = true;
                    pinnedColChanged ||= col.pinnedLane !== 1;
                }
            }
        }

        let flexedCols: AgColumn[] = [];

        // if no cols changed, then no need to update more or send event.
        if (atLeastOneColChanged) {
            const { colFlex, visibleCols, colViewport, ctrlsSvc } = this.beans;
            flexedCols =
                colFlex?.refreshFlexedColumns({
                    resizingCols: allResizedCols,
                    skipSetLeft: true,
                    // A pinned resize moves the centre boundary with no DOM resize; 0 is "not laid out yet".
                    viewportWidth:
                        (pinnedColChanged && ctrlsSvc.get('gridBodyCtrl')?.getReportedCenterWidth()) || undefined,
                }) ?? [];
            visibleCols.updateBodyWidths(visibleCols.setLeftValues(source));
            colViewport.checkViewportColumns();
        }

        // check for change first, to avoid unnecessary firing of events
        // however we always dispatch 'finished' events. this is important
        // when groups are resized, as if the group is changing slowly,
        // eg 1 pixel at a time, then each change will dispatch change events
        // in all the columns in the group, but only one with get the pixel.
        if (atLeastOneColChanged || finished) {
            const colsForEvent = flexedCols.length ? allResizedCols.concat(flexedCols) : allResizedCols;
            dispatchColumnResizedEvent(this.eventSvc, colsForEvent, finished, source, flexedCols);
        }
    }

    public resizeHeader(column: AgColumn, delta: number, shiftKey: boolean): void {
        if (!column.isResizable()) {
            return;
        }

        const actualWidth = column.getActualWidth();
        const minWidth = column.getMinWidth();
        const maxWidth = column.getMaxWidth();

        const newWidth = _clamp(actualWidth + delta, minWidth, maxWidth);

        this.setColumnWidths([{ key: column, newWidth }], shiftKey, true, 'uiColumnResized');
    }

    public createResizeFeature(
        column: AgColumn,
        eResize: HTMLElement,
        comp: IHeaderCellComp,
        ctrl: HeaderCellCtrl
    ): ResizeFeature {
        return new ResizeFeature(column, eResize, comp, ctrl);
    }

    public createGroupResizeFeature(
        comp: IHeaderGroupCellComp,
        eResize: HTMLElement,
        columnGroup: AgColumnGroup
    ): GroupResizeFeature {
        return new GroupResizeFeature(comp, eResize, columnGroup);
    }
}

function checkMinAndMaxWidthsForSet(columnResizeSet: ColumnResizeSet): boolean {
    const { columns, width } = columnResizeSet;

    // every col has a min width, so sum them all up and see if we have enough room
    // for all the min widths
    let minWidthAccumulated = 0;
    let maxWidthAccumulated = 0;
    let maxWidthActive = true;

    for (let i = 0, len = columns.length; i < len; ++i) {
        const col = columns[i];
        minWidthAccumulated += col.getMinWidth() || 0;

        const maxWidth = col.getMaxWidth();
        if (maxWidth > 0) {
            maxWidthAccumulated += maxWidth;
        } else {
            // one column with no max width means the whole set has none: it can absorb any width
            maxWidthActive = false;
        }
    }

    const minWidthPasses = width >= minWidthAccumulated;
    const maxWidthPasses = !maxWidthActive || width <= maxWidthAccumulated;

    return minWidthPasses && maxWidthPasses;
}
