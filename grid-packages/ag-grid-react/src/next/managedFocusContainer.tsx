import React, { FC, useRef, useEffect, useState } from 'react';
import {
    Context,
    ManagedFocusContainerCtrl,
    IManagedFocusContainer
} from 'ag-grid-community';

export const ManagedFocusContainer: FC<{ 
    children: React.ReactNode,
    context: Context
    focusableElementRef: React.RefObject<HTMLDivElement>,
    focusInnerElement: (fromBottom?: boolean) => void
}> = ({ children, context, focusableElementRef, focusInnerElement }) => {
    const topTabGuardRef = useRef<HTMLDivElement>(null);
    const bottomTabGuardRef = useRef<HTMLDivElement>(null);
    const [activeTabGuards, setActiveTabGuards] = useState(true);
    const [skipTabGuards, setSkipTabGuards] = useState(false);


    useEffect(() => {
        if (!context || !topTabGuardRef.current || !bottomTabGuardRef.current || !focusableElementRef.current) { return; }
        const beansToDestroy: any[] = [];
        const focusableElement = focusableElementRef.current;
        const topTabGuard = topTabGuardRef.current;
        const bottomTabGuard = bottomTabGuardRef.current;

        const ctrl = context.createBean(new ManagedFocusContainerCtrl())

        const compProxy: IManagedFocusContainer = {
            getFocusableElement: () => focusableElement,
            tabGuardsAreActive: () => activeTabGuards,
            shouldStopEventPropagation: () => false,
            onTabKeyDown: (e: KeyboardEvent) => {
                if (e.defaultPrevented) { return; }
                const tabGuardsWereActive = activeTabGuards;

                if (tabGuardsWereActive) {
                    setActiveTabGuards(false);
                }

                const nextRoot = ctrl.getNextFocusableElement(e.shiftKey);

                if (tabGuardsWereActive) {
                    setTimeout(() => setActiveTabGuards(true), 0);
                }

                if (!nextRoot) { return; }

                nextRoot.focus();
                e.preventDefault();
            },
            handleKeyDown: () => {},
            onFocusIn: () => setActiveTabGuards(false),
            onFocusOut: (e: FocusEvent) => {
                if (!focusableElement.contains(e.relatedTarget as HTMLElement)) {
                    setActiveTabGuards(true);
                }
            }
        }

        ctrl.setComp(compProxy);

        const onFocus = (e: FocusEvent) => {
            if (skipTabGuards) {
                setSkipTabGuards(false);
                return;
            }
            focusInnerElement(e.target === bottomTabGuard);
        }

        topTabGuard.addEventListener('focus', onFocus)
        bottomTabGuard.addEventListener('focus', onFocus)

        return () => {
            context.destroyBeans(beansToDestroy);
            topTabGuard.removeEventListener('focus', onFocus)
            bottomTabGuard.removeEventListener('focus', onFocus)
        };

    }, [activeTabGuards, context, focusableElementRef, skipTabGuards, focusInnerElement])

    const createTabGuard = (side: 'top' | 'bottom') => (
        <div 
            className={`ag-tab-guard ag-tab-guard-${side}`}
            role="presentation"
            { ...(activeTabGuards ? { tabIndex: 0 } : {}) }
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