import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle, ForwardRefRenderFunction, memo, useContext } from 'react';

import {
    TabGuardCtrl, ITabGuard, GridCtrl, TabGuardClassNames
} from '@ag-grid-community/core';
import { BeansContext } from './beansContext';
import { useEffectOnce } from './useEffectOnce';

export interface TabGuardCompCallback {
    forceFocusOutOfContainer(): void;
}

interface TabGuardProps {
    children: React.ReactNode,
    eFocusableElement: HTMLDivElement,
    onTabKeyDown: (e: KeyboardEvent) => void,
    gridCtrl: GridCtrl,
}

const TabGuardCompRef: ForwardRefRenderFunction<TabGuardCompCallback, TabGuardProps> = (props: any, forwardRef: any) => {

    const { children, eFocusableElement, onTabKeyDown, gridCtrl } = props;
    const { context } = useContext(BeansContext);

    const topTabGuardRef = useRef<HTMLDivElement>(null);
    const bottomTabGuardRef = useRef<HTMLDivElement>(null);
    const tabGuardCtrlRef = useRef<TabGuardCtrl>();
    const [tabIndex, setTabIndex] = useState<number>();

    useImperativeHandle(forwardRef, () => ({
        forceFocusOutOfContainer() {
            tabGuardCtrlRef.current!.forceFocusOutOfContainer();
        }
    }));

    useEffectOnce(() => {
        const eTopGuard = topTabGuardRef.current!;
        const eBottomGuard = bottomTabGuardRef.current!;

        const compProxy: ITabGuard = {
            setTabIndex: value => value == null ? setTabIndex(undefined) : setTabIndex(parseInt(value, 10))
        }

        const ctrl = tabGuardCtrlRef.current = context.createBean(new TabGuardCtrl({
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

    });

    const createTabGuard = (side: 'top' | 'bottom') => {
        const className = side === 'top' ? TabGuardClassNames.TAB_GUARD_TOP : TabGuardClassNames.TAB_GUARD_BOTTOM;

        return (
            <div 
                className={ `${TabGuardClassNames.TAB_GUARD} ${className}` }
                role="presentation"
                tabIndex={ tabIndex }
                ref={ side === 'top' ? topTabGuardRef : bottomTabGuardRef }
            ></div>
        );
    }

    return (
        <>
            {createTabGuard('top')}
            { children }
            {createTabGuard('bottom')}
        </>
    )
};

const TabGuardComp = forwardRef(TabGuardCompRef);

export default memo(TabGuardComp);
