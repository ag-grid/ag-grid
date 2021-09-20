import { AbstractHeaderCellCtrl, HeaderGroupCellCtrl, HeaderCellCtrl, HeaderFilterCellComp, HeaderFilterCellCtrl, HeaderRowCtrl, HeaderRowType, IHeaderRowComp, _ } from '@ag-grid-community/core';
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext';
import HeaderCellComp from './headerCellComp';
import HeaderGroupCellComp from './headerGroupCellComp';

const HeaderRowComp = (props: {ctrl: HeaderRowCtrl}) => {

    const {context, gridOptionsWrapper} = useContext(BeansContext);

    const [ transform, setTransform ] = useState<string>();
    const [ height, setHeight ] = useState<string>();
    const [ top, setTop ] = useState<string>();
    const [ width, setWidth ] = useState<string>();
    const [ ariaRowIndex, setAriaRowIndex ] = useState<number>();
    const [ cellCtrls, setCellCtrls ] = useState<AbstractHeaderCellCtrl[]>([]);

    const eGui = useRef<HTMLDivElement>(null);

    const { ctrl } = props;

    const typeColumn = ctrl.getType() === HeaderRowType.COLUMN;
    const typeGroup = ctrl.getType() === HeaderRowType.COLUMN_GROUP;
    const typeFilter = ctrl.getType() === HeaderRowType.FLOATING_FILTER;

    const jsFilterCells = useRef<{[id: string]: HeaderFilterCellComp}>({});

    const setCellCtrlsMaintainOrder = useCallback( (prev: AbstractHeaderCellCtrl[], next: AbstractHeaderCellCtrl[]) => {

        // if we are ensuring dom order, we set the ctrls into the dom in the same order they appear on screen
        if (gridOptionsWrapper.isEnsureDomOrder()) {
            return next;
        }

        // if not maintaining order, we want to keep the dom elements we have and add new ones to the end,
        // otherwise we will loose transition effects as elements are placed in different dom locations
        const prevMap = _.mapById(prev, c => c.getInstanceId());
        const nextMap = _.mapById(next, c => c.getInstanceId());

        const oldCtrlsWeAreKeeping = prev.filter( c => nextMap.has(c.getInstanceId()) );
        const newCtrls = next.filter( c => !prevMap.has(c.getInstanceId()) )

        return [...oldCtrlsWeAreKeeping, ...newCtrls];
    }, []);

    useEffect(() => {

        const compProxy: IHeaderRowComp = {
            setTransform: transform => setTransform(transform),
            setHeight: height => setHeight(height),
            setTop: top => setTop(top),
            setHeaderCtrls: ctrls => setCellCtrls(prev => setCellCtrlsMaintainOrder(prev, ctrls)),
            setWidth: width => setWidth(width),
            setAriaRowIndex: rowIndex => setAriaRowIndex(rowIndex)
        };

        ctrl.setComp(compProxy);

    }, []);

    const destroyJsFilterComps = useCallback( (cellCtrls: AbstractHeaderCellCtrl[])=> {
        cellCtrls.forEach( cellCtrl => {
            const comp = jsFilterCells.current[cellCtrl.getInstanceId()];
            if (comp) {
                const compGui = comp.getGui();
                context.destroyBean(comp);
                if (compGui && compGui.parentElement) {
                    compGui.parentElement.removeChild(compGui);
                }
            }
        });
    }, []);

    // manage filter comps, which are still JS
    typeFilter && useEffect( ()=> {
        const oldCompsMap = jsFilterCells.current;
        jsFilterCells.current = {};
        const newCompsMap = jsFilterCells.current;
        cellCtrls.forEach(cellCtrl => {
            const id = cellCtrl.getInstanceId();
            const existing = oldCompsMap[id];
            delete oldCompsMap[id];
            if (existing) {
                newCompsMap[id] = existing;
            } else {
                const newComp = context.createBean(new HeaderFilterCellComp(cellCtrl as HeaderFilterCellCtrl))
                eGui.current!.appendChild(newComp.getGui());
            }
        });
        const oldComps = _.getAllValuesInObject(oldCompsMap);
        destroyJsFilterComps(oldComps);
    }, [cellCtrls]);

    // when row comp is destroyed, make sure no child floating filters left
    typeFilter && useEffect( ()=> {
        const cellCtrls: AbstractHeaderCellCtrl[] = [];
        _.getAllValuesInObject(jsFilterCells.current)
            .forEach(comp => cellCtrls.push(comp.getCtrl()));
        destroyJsFilterComps(cellCtrls);
    }, []);

    const style = useMemo( ()=> ({
        transform: transform,
        height: height,
        top: top,
        width: width
    }), [transform, height, top, width]);

    const className = useMemo( ()=> {
        const res: string[] = [`ag-header-row`];
        
        typeColumn && res.push(`ag-header-row-column`);
        typeGroup && res.push(`ag-header-row-column-group`);
        typeFilter && res.push(`ag-header-row-column-filter`);

        return res.join(' ');
    }, []);

    const createCellJsx = useCallback( (cellCtrl: AbstractHeaderCellCtrl) => {
        switch (ctrl.getType()) {
            case HeaderRowType.COLUMN_GROUP :
                return <HeaderGroupCellComp ctrl={cellCtrl as HeaderGroupCellCtrl} key={cellCtrl.getInstanceId()} />;
                
            default :
                return <HeaderCellComp ctrl={cellCtrl as HeaderCellCtrl} key={cellCtrl.getInstanceId()} />;
        }
    }, []);

    // below, we are not doing floating filters, not yet
    return (
        <div ref={eGui} className={className} role="row" style={style} aria-rowindex={ariaRowIndex}>
            { !typeFilter && cellCtrls.map( createCellJsx ) }
        </div>
    );
};

export default memo(HeaderRowComp);
