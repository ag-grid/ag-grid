import { CssClassManager } from 'ag-stack';
import React, { memo, useCallback, useContext, useRef, useState } from 'react';

import type { IGridHeaderComp } from 'ag-grid-community';
import { GridHeaderCtrl } from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import HeaderRowsComp from './headerRowsComp';

const GridHeaderComp = ({ eTopSection, eGridViewport }: { eTopSection: HTMLElement; eGridViewport: HTMLElement }) => {
    const { context, environment } = useContext(BeansContext);

    const gridHeaderCtrlRef = useRef<GridHeaderCtrl>();
    const cssManager = useRef<CssClassManager>();
    const eGui = useRef<HTMLDivElement | null>(null);
    const [headerElement, setHeaderElement] = useState<HTMLDivElement | null>(null);
    const [mounted, setMounted] = useState(false);

    if (!cssManager.current) {
        cssManager.current = new CssClassManager(() => eGui.current);
    }

    const setHeaderRowFocusableElements = useCallback((elements: HTMLElement[]) => {
        gridHeaderCtrlRef.current?.setHeaderRowFocusableElements(elements);
    }, []);

    const setRef = useCallback(
        (eRef: HTMLDivElement | null) => {
            eGui.current = eRef;
            setHeaderElement(eRef);
            if (!eRef || context.isDestroyed()) {
                eTopSection.style.removeProperty('--ag-header-rows-height');
                gridHeaderCtrlRef.current = context.destroyBean(gridHeaderCtrlRef.current);
                setMounted(false);
                return;
            }

            cssManager.current!.toggleCss('ag-header', true);

            const compProxy: IGridHeaderComp = {
                toggleCss: (name, on) => cssManager.current!.toggleCss(name, on),
                setHeightAndMinHeight: (height) => {
                    const borderWidth = environment.getHeaderRowBorderWidth();
                    const heightWithBorder = height + borderWidth;
                    eTopSection.style.setProperty('--ag-header-rows-height', `${heightWithBorder}px`);
                    if (eGui.current) {
                        eGui.current.style.height = `${heightWithBorder}px`;
                    }
                },
            };

            gridHeaderCtrlRef.current = context.createBean(new GridHeaderCtrl());
            gridHeaderCtrlRef.current.setComp(compProxy, eRef);
            setMounted(true);
        },
        [context, environment, eTopSection]
    );

    return (
        <div ref={setRef} role="presentation">
            {mounted && headerElement && (
                <HeaderRowsComp
                    eGui={headerElement}
                    eGridViewport={eGridViewport}
                    setHeaderRowFocusableElements={setHeaderRowFocusableElements}
                />
            )}
        </div>
    );
};

export default memo(GridHeaderComp);
