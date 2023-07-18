import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle, ForwardRefRenderFunction, memo, useContext } from 'react';

import {
    TabGuardCtrl, ITabGuard, GridCtrl, TabGuardClassNames
} from 'ag-grid-community';
import { BeansContext } from './beansContext';
import { useLayoutEffectOnce } from './useEffectOnce';
import { agFlushSync } from './utils';

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

    const setTabIndex = (value?: string | null) => {
        const processedValue = value == null ? undefined : parseInt(value, 10).toString();

        [topTabGuardRef, bottomTabGuardRef].forEach(tabGuard => {
            if (processedValue === undefined) {
                tabGuard.current?.removeAttribute('tabindex');
            } else {
                tabGuard.current?.setAttribute('tabindex', processedValue);
            }
            
        })
    }

    useImperativeHandle(forwardRef, () => ({
        forceFocusOutOfContainer() {
            tabGuardCtrlRef.current?.forceFocusOutOfContainer();
        }
    }));

    useLayoutEffectOnce(() => {
        const eTopGuard = topTabGuardRef.current!;
        const eBottomGuard = bottomTabGuardRef.current!;


        const compProxy: ITabGuard = {
            setTabIndex
        };

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
