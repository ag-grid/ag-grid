import React, { memo, useContext, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext';
import {
    IHeaderRowContainerComp, HeaderRowCtrl, HeaderRowContainerCtrl, ColumnPinnedType
} from '@ag-grid-community/core';
import { CssClasses } from '../utils';
import HeaderRowComp from './headerRowComp';
import { useLayoutEffectOnce } from '../useEffectOnce';


const HeaderRowContainerComp = (props: { pinned: ColumnPinnedType }) => {

    const [cssClasses, setCssClasses] = useState<CssClasses>(new CssClasses());
    const [ariaHidden, setAriaHidden] = useState<true | false>(false);
    const [headerRowCtrls, setHeaderRowCtrls] = useState<HeaderRowCtrl[]>([]);

    const {context} = useContext(BeansContext);
    const eGui = useRef<HTMLDivElement>(null);
    const eCenterContainer = useRef<HTMLDivElement>(null);

    const pinnedLeft = props.pinned === 'left';
    const pinnedRight = props.pinned === 'right';
    const centre = !pinnedLeft && !pinnedRight;

    useLayoutEffectOnce(() => {
        const compProxy: IHeaderRowContainerComp = {
            setDisplayed: displayed => {
                setCssClasses(prev => prev.setClass('ag-hidden', !displayed));
                setAriaHidden(!displayed);
            },
            setCtrls: ctrls => setHeaderRowCtrls(ctrls),

            // centre only
            setCenterWidth: width => {
                if (eCenterContainer.current) {
                    eCenterContainer.current.style.width = width;
                }
            },
            setContainerTransform: transform => {
                if (eCenterContainer.current) {
                    eCenterContainer.current.style.transform = transform;
                }
            },

            // pinned only
            setPinnedContainerWidth: width => {
                eGui.current!.style.width = width;
                eGui.current!.style.minWidth = width;
                eGui.current!.style.maxWidth = width;
            }
        };

        const ctrl = context.createBean(new HeaderRowContainerCtrl(props.pinned));
        ctrl.setComp(compProxy, eGui.current!);

        return () => {
            context.destroyBean(ctrl);
        };

    });

    const className = useMemo(() => cssClasses.toString(), [cssClasses]);

    const insertRowsJsx = () => headerRowCtrls.map( ctrl => <HeaderRowComp ctrl={ctrl} key={ctrl.getInstanceId()} /> );

    return (
        <>
            {
                pinnedLeft && 
                <div ref={eGui} className={"ag-pinned-left-header " + className} aria-hidden={ariaHidden} role="presentation">
                    { insertRowsJsx() }
                </div>
            }
            { 
                pinnedRight && 
                <div ref={eGui} className={"ag-pinned-right-header " + className} aria-hidden={ariaHidden} role="presentation">
                { insertRowsJsx() }
            </div>
            }
            { 
                centre && 
                <div ref={eGui} className={"ag-header-viewport " + className} role="presentation">
                        <div ref={eCenterContainer} className={"ag-header-container"} role="rowgroup">
                        { insertRowsJsx() }
                    </div>
                </div>
            }
        </>
    );
};

export default memo(HeaderRowContainerComp);
