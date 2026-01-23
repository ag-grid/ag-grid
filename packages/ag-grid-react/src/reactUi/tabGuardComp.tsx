import type { ForwardRefRenderFunction } from 'react';
import React, { forwardRef, memo, useCallback, useContext, useImperativeHandle, useRef } from 'react';

import type { GridCtrl, ITabGuard } from 'ag-grid-community';
import { TabGuardClassNames, TabGuardCtrl } from 'ag-grid-community';

import { BeansContext } from './beansContext';
import { isElementHiddenInDom } from './utils';

export interface TabGuardCompCallback {
    forceFocusOutOfContainer(up?: boolean): void;
}

interface TabGuardProps {
    children: React.ReactNode;
    eFocusableElement: HTMLDivElement;
    forceFocusOutWhenTabGuardsAreEmpty?: boolean;
    gridCtrl: GridCtrl;
    onTabKeyDown: (e: KeyboardEvent) => void;
    isEmpty?: () => boolean;
}

const TabGuardCompRef: ForwardRefRenderFunction<TabGuardCompCallback, TabGuardProps> = (
    props: any,
    forwardRef: any
) => {
    const { children, eFocusableElement, onTabKeyDown, gridCtrl, forceFocusOutWhenTabGuardsAreEmpty, isEmpty } = props;
    const { context } = useContext(BeansContext);

    const topTabGuardRef = useRef<HTMLDivElement | null>(null);
    const bottomTabGuardRef = useRef<HTMLDivElement | null>(null);
    const tabGuardCtrlRef = useRef<TabGuardCtrl>();
    const pendingDestroyTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const setTabIndex = (value?: string | null) => {
        const processedValue = value == null ? undefined : parseInt(value, 10).toString();

        for (const tabGuard of [topTabGuardRef, bottomTabGuardRef]) {
            if (processedValue === undefined) {
                tabGuard.current?.removeAttribute('tabindex');
            } else {
                tabGuard.current?.setAttribute('tabindex', processedValue);
            }
        }
    };

    useImperativeHandle(forwardRef, () => ({
        forceFocusOutOfContainer(up?: boolean) {
            tabGuardCtrlRef.current?.forceFocusOutOfContainer(up);
        },
    }));

    const setupCtrl = useCallback((previousElement: HTMLDivElement | null) => {
        const topTabGuard = topTabGuardRef.current;
        const bottomTabGuard = bottomTabGuardRef.current;

        if (!topTabGuard && !bottomTabGuard) {
            // Schedule destruction to allow Activity hiding check.
            pendingDestroyTimeoutRef.current = setTimeout(() => {
                if (previousElement && isElementHiddenInDom(previousElement)) {
                    return;
                }
                tabGuardCtrlRef.current = context.destroyBean(tabGuardCtrlRef.current);
            }, 0);
            return;
        }

        // Cancel any pending destruction
        if (pendingDestroyTimeoutRef.current) {
            clearTimeout(pendingDestroyTimeoutRef.current);
            pendingDestroyTimeoutRef.current = undefined;
        }

        // If already initialized (Activity case), reuse
        if (tabGuardCtrlRef.current || context.isDestroyed()) {
            return;
        }

        if (topTabGuard && bottomTabGuard) {
            const compProxy: ITabGuard = {
                setTabIndex,
            };

            tabGuardCtrlRef.current = context.createBean(
                new TabGuardCtrl({
                    comp: compProxy,
                    eTopGuard: topTabGuard,
                    eBottomGuard: bottomTabGuard,
                    eFocusableElement: eFocusableElement,
                    onTabKeyDown: onTabKeyDown,
                    forceFocusOutWhenTabGuardsAreEmpty: forceFocusOutWhenTabGuardsAreEmpty,
                    focusInnerElement: (fromBottom: any) => gridCtrl.focusInnerElement(fromBottom),
                    isEmpty,
                })
            );
        }
    }, []);

    const setTopRef = useCallback(
        (e: HTMLDivElement | null) => {
            const previous = topTabGuardRef.current;
            topTabGuardRef.current = e;
            setupCtrl(previous);
        },
        [setupCtrl]
    );
    const setBottomRef = useCallback(
        (e: HTMLDivElement | null) => {
            const previous = bottomTabGuardRef.current;
            bottomTabGuardRef.current = e;
            setupCtrl(previous);
        },
        [setupCtrl]
    );

    const createTabGuard = (side: 'top' | 'bottom') => {
        const className = side === 'top' ? TabGuardClassNames.TAB_GUARD_TOP : TabGuardClassNames.TAB_GUARD_BOTTOM;

        return (
            <div
                className={`${TabGuardClassNames.TAB_GUARD} ${className}`}
                role="presentation"
                ref={side === 'top' ? setTopRef : setBottomRef}
            ></div>
        );
    };

    return (
        <>
            {createTabGuard('top')}
            {children}
            {createTabGuard('bottom')}
        </>
    );
};

const TabGuardComp = forwardRef(TabGuardCompRef);

export default memo(TabGuardComp);
