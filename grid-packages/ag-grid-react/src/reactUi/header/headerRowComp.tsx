import { AbstractHeaderCellCtrl, HeaderGroupCellCtrl, HeaderCellCtrl, HeaderFilterCellCtrl, HeaderRowCtrl, HeaderRowType, IHeaderRowComp, _ } from 'ag-grid-community';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import HeaderCellComp from './headerCellComp';
import HeaderGroupCellComp from './headerGroupCellComp';
import HeaderFilterCellComp from './headerFilterCellComp';

const HeaderRowComp = (props: {ctrl: HeaderRowCtrl}) => {

    const { ctrl } = props;

    const { topOffset, rowHeight } = useMemo(() => ctrl.getTopAndHeight(), []);
    const ariaRowIndex = ctrl.getAriaRowIndex();
    const className = ctrl.getHeaderRowClass();

    const transform = useMemo(() => ctrl.getTransform(), []);

    const [height, setHeight] = useState<string>(rowHeight + 'px');
    const [top, setTop] = useState<string>(topOffset + 'px');
    const [cellCtrls, setCellCtrls] = useState<AbstractHeaderCellCtrl[]>(ctrl.getHeaderCtrls());

    const eGui = useRef<HTMLDivElement | null>(null);

    const setCellCtrlsMaintainOrder = useCallback((prev: AbstractHeaderCellCtrl[], next: AbstractHeaderCellCtrl[], forceOrder: boolean) => {
        if (prev.length === 0 && next.length === 0) {
            // Avoid unnecessary re-rendering
            return prev;
        };

        // if we are ensuring dom order, we set the ctrls into the dom in the same order they appear on screen
        if (forceOrder) {
            return next;
        }

        // if not maintaining order, we want to keep the dom elements we have and add new ones to the end,
        // otherwise we will loose transition effects as elements are placed in different dom locations
        const prevMap = _.mapById(prev, c => c.getInstanceId());
        const nextMap = _.mapById(next, c => c.getInstanceId());

        const oldCtrlsWeAreKeeping = prev.filter( c => nextMap.has(c.getInstanceId()) );
        const newCtrls = next.filter( c => !prevMap.has(c.getInstanceId()) )

        if (oldCtrlsWeAreKeeping.length === prev.length && newCtrls.length === 0) {
            return prev;
        }

        return [...oldCtrlsWeAreKeeping, ...newCtrls];
    }, []);

    const setRef = useCallback((e: HTMLDivElement) => {
        eGui.current = e;
        if (!e) {
            // Are we missing destroy logic here?
            return;
        }

        const compProxy: IHeaderRowComp = {
            setHeight: height => setHeight(height),
            setTop: top => setTop(top),
            setHeaderCtrls: (ctrls, forceOrder) =>
                setCellCtrls(prev => setCellCtrlsMaintainOrder(prev, ctrls, forceOrder)),
            setWidth: width => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
        };

        ctrl.setComp(compProxy);
    }, []);

    const style = useMemo( ()=> ({
        transform: transform,
        height: height,
        top: top,
    }), [transform, height, top]);


    const createCellJsx = useCallback( (cellCtrl: AbstractHeaderCellCtrl) => {
        switch (ctrl.getType()) {
            case HeaderRowType.COLUMN_GROUP :
                return <HeaderGroupCellComp ctrl={cellCtrl as HeaderGroupCellCtrl} key={cellCtrl.getInstanceId()} />;

            case HeaderRowType.FLOATING_FILTER :
                return <HeaderFilterCellComp ctrl={cellCtrl as HeaderFilterCellCtrl} key={cellCtrl.getInstanceId()} />;
                
            default :
                return <HeaderCellComp ctrl={cellCtrl as HeaderCellCtrl} key={cellCtrl.getInstanceId()} />;
        }
    }, []);

    return (
        <div ref={setRef} className={className} role="row" style={style} aria-rowindex={ariaRowIndex}>
            { cellCtrls.map( createCellJsx ) }
        </div>
    );
};

export default memo(HeaderRowComp);
