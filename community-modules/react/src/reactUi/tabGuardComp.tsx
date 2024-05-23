import type { GridCtrl, ITabGuard } from '@ag-grid-community/core';
import { TabGuardClassNames, TabGuardCtrl } from '@ag-grid-community/core';
import type { ForwardRefRenderFunction } from 'react';
import React, { forwardRef, memo, useCallback, useContext, useImperativeHandle, useRef } from 'react';

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
}

const TabGuardCompRef: ForwardRefRenderFunction<TabGuardCompCallback, TabGuardProps> = (
    props: any,
    forwardRef: any
) => {
    const { children, eFocusableElement, onTabKeyDown, gridCtrl, forceFocusOutWhenTabGuardsAreEmpty } = props;
    const { context } = useContext(BeansContext);

    const topTabGuardRef = useRef<HTMLDivElement | null>(null);
    const bottomTabGuardRef = useRef<HTMLDivElement | null>(null);
    const tabGuardCtrlRef = useRef<TabGuardCtrl | null>();

    const setTabIndex = (value?: string | null) => {
        const processedValue = value == null ? undefined : parseInt(value, 10).toString();

        [topTabGuardRef, bottomTabGuardRef].forEach((tabGuard) => {
            if (processedValue === undefined) {
                tabGuard.current?.removeAttribute('tabindex');
            } else {
                tabGuard.current?.setAttribute('tabindex', processedValue);
            }
        });
    };

    useImperativeHandle(forwardRef, () => ({
        forceFocusOutOfContainer(up?: boolean) {
            tabGuardCtrlRef.current?.forceFocusOutOfContainer(up);
        },
    }));

    const setupCtrl = useCallback(() => {
        if (!topTabGuardRef.current && !bottomTabGuardRef.current) {
            // Clean up after both refs have been removed
            context.destroyBean(tabGuardCtrlRef.current);
            tabGuardCtrlRef.current = null;
            return;
        }

        if (topTabGuardRef.current && bottomTabGuardRef.current) {
            const compProxy: ITabGuard = {
                setTabIndex,
            };

            tabGuardCtrlRef.current = context.createBean(
                new TabGuardCtrl({
                    comp: compProxy,
                    eTopGuard: topTabGuardRef.current,
                    eBottomGuard: bottomTabGuardRef.current,
                    eFocusableElement: eFocusableElement,
                    onTabKeyDown: onTabKeyDown,
                    forceFocusOutWhenTabGuardsAreEmpty: forceFocusOutWhenTabGuardsAreEmpty,
                    focusInnerElement: (fromBottom: any) => gridCtrl.focusInnerElement(fromBottom),
                })
            );
        }
    }, []);

    const setTopRef = useCallback(
        (e: HTMLDivElement) => {
            topTabGuardRef.current = e;
            setupCtrl();
        },
        [setupCtrl]
    );
    const setBottomRef = useCallback(
        (e: HTMLDivElement) => {
            bottomTabGuardRef.current = e;
            setupCtrl();
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
