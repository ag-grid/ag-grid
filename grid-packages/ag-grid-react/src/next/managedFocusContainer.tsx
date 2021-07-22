import React, { FC, useRef, useEffect, useState } from 'react';
import {
    Context, TabGuardFeature, ITabGuard, GridCtrl
} from 'ag-grid-community';

export const ManagedFocusContainer: FC<{
    children: React.ReactNode,
    context: Context
    eFocusableElement: HTMLDivElement,
    onTabKeyDown: (e: KeyboardEvent) => void,
    gridCtrl: GridCtrl
}> = ({ children, context, eFocusableElement, onTabKeyDown, gridCtrl }) => {

    const topTabGuardRef = useRef<HTMLDivElement>(null);
    const bottomTabGuardRef = useRef<HTMLDivElement>(null);
    const [tabIndex, setTabIndex] = useState<number>();

    useEffect(() => {
        const eTopGuard = topTabGuardRef.current!;
        const eBottomGuard = bottomTabGuardRef.current!;

        const compProxy: ITabGuard = {
            setTabIndex: value => value == null ? setTabIndex(undefined) : setTabIndex(parseInt(value, 10))
        }

        const ctrl = context.createBean(new TabGuardFeature({
            comp: compProxy,
            eTopGuard: eTopGuard,
            eBottomGuard: eBottomGuard,
            eFocusableElement: eFocusableElement,
            
            onTabKeyDown: onTabKeyDown,
            focusInnerElement: fromBottom => gridCtrl.focusInnerElement(fromBottom)
        }));

        return () => {
            context.destroyBean(ctrl);
        };

    }, [context, eFocusableElement])

    const createTabGuard = (side: 'top' | 'bottom') => (
        <div 
            className={`ag-tab-guard ag-tab-guard-${side}`}
            role="presentation"
            tabIndex={tabIndex}
            ref={ side === 'top' ? topTabGuardRef : bottomTabGuardRef }
        ></div>
    )
    return (
        <>
            {createTabGuard('top')}
            { children }
            {createTabGuard('bottom')}
        </>
    )
}