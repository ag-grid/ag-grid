import { AbstractHeaderCellCtrl, HeaderGroupCellCtrl, HeaderCellCtrl, HeaderFilterCellCtrl, HeaderRowCtrl, HeaderRowType, IHeaderRowComp, _ } from 'ag-grid-community';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import HeaderCellComp from './headerCellComp';
import HeaderGroupCellComp from './headerGroupCellComp';
import HeaderFilterCellComp from './headerFilterCellComp';
import { agFlushSync, getNextValueIfDifferent } from '../utils';

const HeaderRowComp = (props: {ctrl: HeaderRowCtrl}) => {

    const { ctrl } = props;

    const { topOffset, rowHeight } = useMemo(() => ctrl.getTopAndHeight(), []);
    const ariaRowIndex = ctrl.getAriaRowIndex();
    const className = ctrl.getHeaderRowClass();

    const [height, setHeight] = useState<string>(() => rowHeight + 'px');
    const [top, setTop] = useState<string>(() => topOffset + 'px');
    const [cellCtrls, setCellCtrls] = useState<AbstractHeaderCellCtrl[]>(() => ctrl.getHeaderCtrls());

    const eGui = useRef<HTMLDivElement | null>(null);

    const setRef = useCallback((e: HTMLDivElement) => {
        eGui.current = e;
        if (!e) {
            return;
        }

        const compProxy: IHeaderRowComp = {
            setHeight: height => setHeight(height),
            setTop: top => setTop(top),
            setHeaderCtrls: (ctrls, forceOrder, afterScroll) =>{
                agFlushSync(afterScroll, () => {
                    setCellCtrls(prev => getNextValueIfDifferent(prev, ctrls, forceOrder)!)
                });
            },
            setWidth: width => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
        };

        ctrl.setComp(compProxy, false);
    }, []);

    const style = useMemo( ()=> ({
        height: height,
        top: top,
    }), [height, top]);


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
