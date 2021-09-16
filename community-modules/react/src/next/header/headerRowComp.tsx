import { AbstractHeaderCellCtrl, HeaderCellCtrl, HeaderFilterCellComp, HeaderFilterCellCtrl, HeaderRowCtrl, HeaderRowType, IHeaderRowComp, _ } from '@ag-grid-community/core';
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext';
import HeaderCellComp from './headerCellComp';

const HeaderRowComp = (props: {ctrl: HeaderRowCtrl}) => {

    const {context} = useContext(BeansContext);

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

    useEffect(() => {

        const compProxy: IHeaderRowComp = {
            setTransform: transform => setTransform(transform),
            setHeight: height => setHeight(height),
            setTop: top => setTop(top),
            setHeaderCtrls: ctrls => setCellCtrls(ctrls),
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
                ////////// FIXME - need to consider cell order
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
                return <span>Column Group</span>;
            default :
                return <HeaderCellComp ctrl={cellCtrl as HeaderCellCtrl} key={cellCtrl.getInstanceId()} />;
        }
    }, []);


////// NOTE - we need to ignore the order of the columns if we are not applying dom order

    // below, we are not doing floating filters, not yet
    return (
        <div ref={eGui} className={className} role="row" style={style} aria-rowindex={ariaRowIndex}>
            { !typeFilter && cellCtrls.map( createCellJsx ) }
        </div>
    );
};

export default memo(HeaderRowComp);
