import type { ForwardRefRenderFunction } from 'react';
import React, { forwardRef, memo, useCallback, useContext, useEffect, useImperativeHandle, useRef } from 'react';

import type { GridCtrl, ITabGuard } from 'ag-grid-community';
import { TabGuardClassNames, TabGuardCtrl } from 'ag-grid-community';

import { BeansContext } from './beansContext';

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
    const prevTopRef = useRef<HTMLDivElement | null>(null);
    const prevBottomRef = useRef<HTMLDivElement | null>(null);

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

    const setupCtrl = useCallback(() => {
        const topTabGuard = topTabGuardRef.current;
        const bottomTabGuard = bottomTabGuardRef.current;

        if (!topTabGuard && !bottomTabGuard) {
            // Don't destroy yet - StrictMode may remount with same elements
            return;
        }

        // Same elements and valid ctrl? Reuse it (StrictMode remount)
        if (
            topTabGuard === prevTopRef.current &&
            bottomTabGuard === prevBottomRef.current &&
            tabGuardCtrlRef.current &&
            !context.isDestroyed()
        ) {
            return;
        }

        // Different elements means different instance - destroy old first
        if (
            (prevTopRef.current && prevTopRef.current !== topTabGuard) ||
            (prevBottomRef.current && prevBottomRef.current !== bottomTabGuard)
        ) {
            tabGuardCtrlRef.current = context.destroyBean(tabGuardCtrlRef.current);
        }

        prevTopRef.current = topTabGuard;
        prevBottomRef.current = bottomTabGuard;

        if (context.isDestroyed()) {
            tabGuardCtrlRef.current = context.destroyBean(tabGuardCtrlRef.current);
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
            topTabGuardRef.current = e;
            setupCtrl();
        },
        [setupCtrl]
    );
    const setBottomRef = useCallback(
        (e: HTMLDivElement | null) => {
            bottomTabGuardRef.current = e;
            setupCtrl();
        },
        [setupCtrl]
    );

    // Handle cleanup on true unmount (not StrictMode's simulated unmount)
    useEffect(() => {
        return () => {
            // Only destroy if elements are truly gone from DOM
            const topGone = prevTopRef.current && !document.contains(prevTopRef.current);
            const bottomGone = prevBottomRef.current && !document.contains(prevBottomRef.current);
            if (topGone || bottomGone) {
                tabGuardCtrlRef.current = context.destroyBean(tabGuardCtrlRef.current);
            }
        };
    }, []);

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
