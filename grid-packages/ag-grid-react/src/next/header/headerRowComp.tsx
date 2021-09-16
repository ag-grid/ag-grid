import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext';
import { IHeaderRowComp, HeaderRowCtrl, HeaderRowType, AbstractHeaderCellCtrl, HeaderCellCtrl } from 'ag-grid-community';
import { CssClasses } from '../utils';
import HeaderCellComp from './headerCellComp';

const HeaderRowComp = (props: {ctrl: HeaderRowCtrl}) => {

    const [ transform, setTransform ] = useState<string>();
    const [ height, setHeight ] = useState<string>();
    const [ top, setTop ] = useState<string>();
    const [ width, setWidth ] = useState<string>();
    const [ ariaRowIndex, setAriaRowIndex ] = useState<number>();
    const [ cellCtrls, setCellCtrls ] = useState<AbstractHeaderCellCtrl[]>([]);

    const { ctrl } = props;

    const typeColumn = ctrl.getType() === HeaderRowType.COLUMN;
    const typeGroup = ctrl.getType() === HeaderRowType.COLUMN_GROUP;
    const typeFilter = ctrl.getType() === HeaderRowType.FLOATING_FILTER;

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
            case HeaderRowType.FLOATING_FILTER :
                return <span>Column Group</span>;
            default :
                return <HeaderCellComp ctrl={cellCtrl as HeaderCellCtrl} key={cellCtrl.getInstanceId()} />;
        }
    }, []);

////// NOTE - we need to ignore the order of the columns if we are not applying dom order

    return (
        <div className={className} role="row" style={style} aria-rowindex={ariaRowIndex}>
            { cellCtrls.map( createCellJsx ) }
        </div>
    );
};

export default memo(HeaderRowComp);
