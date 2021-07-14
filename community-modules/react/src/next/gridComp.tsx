import React, { useEffect, useRef, useState } from 'react';
import {
    Context,
    FocusService,
    GridCtrl,
    IGridComp,
    AgStackComponentsRegistry
} from '@ag-grid-community/core';
import { GridBodyComp } from './gridBodyComp';
import { classesList } from './utils';

export const GridComp = (props: { context: Context }) => {

    const [rtlClass, setRtlClass] = useState<string>('');
    const [keyboardFocusClass, setKeyboardFocusClass] = useState<string>('');
    const [layoutClass, setLayoutClass] = useState<string>('');
    const [cursor, setCursor] = useState<string | null>(null);
    const [userSelect, setUserSelect] = useState<string | null>(null);
    const [initialised, setInitialised] = useState<boolean>(false);

    const eRootWrapper = useRef<HTMLDivElement>(null);
    const eGridBodyParent = useRef<HTMLDivElement>(null);

    // initialise the UI
    useEffect(() => {
        const { context } = props;
        const beansToDestroy: any[] = [];

        if (!props || !props.context) { return; }

        const ctrl = context.createBean(new GridCtrl());

        beansToDestroy.push(ctrl);

        const compProxy: IGridComp = {
            destroyGridUi:
                () => {}, // do nothing, as framework users destroy grid by removing the comp
            setRtlClass: setRtlClass,
            addOrRemoveKeyboardFocusClass:
                (addOrRemove: boolean) => setKeyboardFocusClass(addOrRemove ? FocusService.AG_KEYBOARD_FOCUS : ''),
            forceFocusOutOfContainer: () => {}, //this.forceFocusOutOfContainer.bind(this),
            updateLayoutClasses: setLayoutClass,
            getFocusableContainers: () => [], //this.getFocusableContainers.bind(this)
            setCursor,
            setUserSelect
        };

        ctrl.setComp(compProxy, eRootWrapper.current!, eRootWrapper.current!);

        // should be shared
        const insertFirstPosition = (parent: HTMLElement, child: HTMLElement) => parent.insertBefore(child, parent.firstChild);

        const agStackComponentsRegistry: AgStackComponentsRegistry = context.getBean('agStackComponentsRegistry');
        const HeaderDropZonesClass = agStackComponentsRegistry.getComponentClass('AG-GRID-HEADER-DROP-ZONES');

        if (ctrl.showDropZones() && HeaderDropZonesClass) {
            const headerDropZonesComp = context.createBean(new HeaderDropZonesClass());
            insertFirstPosition(eRootWrapper.current!, headerDropZonesComp.getGui());
            beansToDestroy.push(headerDropZonesComp);
        }

        setInitialised(true);

        return () => {
            context.destroyBeans(beansToDestroy);
        };
    }, [props]);

    const rootWrapperClasses = classesList('ag-root-wrapper', rtlClass, keyboardFocusClass, layoutClass);
    const rootWrapperBodyClasses = classesList('ag-root-wrapper-body', layoutClass);

    const topStyle = {
        "user-select": userSelect != null ? userSelect : '',
        '-webkit-user-select': userSelect != null ? userSelect : '',
        cursor: cursor != null ? cursor : ''
    };

    return (
        <div ref={ eRootWrapper } className={ rootWrapperClasses } style={ topStyle }>
            { props.context &&
            <div className={ rootWrapperBodyClasses } ref={ eGridBodyParent }>
                { // we wait for initialised before rending the children, so GridComp has created and registered with it's
                  // GridCtrl before we create the child GridBodyComp. Otherwise the GridBodyComp would initialise first,
                  // before we have set the the Layout CSS classes, causing the GridBodyComp to render rows to a grid that
                  // doesn't have it's height specified, which would result if all the rows getting rendered (and if many rows,
                  // hangs the UI)
                    initialised && <GridBodyComp context={ props.context }/> 
                }
            </div>
            }
        </div>
    );
}
