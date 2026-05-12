import React, { memo, useCallback, useContext, useRef, useState } from 'react';

import type { IGridHeaderComp } from 'ag-grid-community';
import { GridHeaderCtrl } from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import { CssClasses } from '../utils';
import HeaderRowsComp from './headerRowsComp';

const GridHeaderComp = ({ eTopSection, eGridViewport }: { eTopSection: HTMLElement; eGridViewport: HTMLElement }) => {
    const { context, environment } = useContext(BeansContext);

    const gridHeaderCtrlRef = useRef<GridHeaderCtrl>();
    const eGui = useRef<HTMLDivElement | null>(null);
    const [headerElement, setHeaderElement] = useState<HTMLDivElement | null>(null);
    const [mounted, setMounted] = useState(false);
    const [cssClasses, setCssClasses] = useState(() => new CssClasses('ag-header'));

    const setHeaderRowFocusableElements = useCallback((elements: HTMLElement[]) => {
        gridHeaderCtrlRef.current?.setHeaderRowFocusableElements(elements);
    }, []);

    const toggleCss = useCallback((className: string, on: boolean) => {
        setCssClasses((prev) => {
            let next = prev;
            for (const cls of className.split(' ')) {
                if (cls) {
                    next = next.setClass(cls, on);
                }
            }
            return next;
        });
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

            const compProxy: IGridHeaderComp = {
                toggleCss,
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
        [context, environment, eTopSection, toggleCss]
    );

    return (
        <div ref={setRef} className={cssClasses.toString()} role="presentation">
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
