import React, { useEffect, useRef, useState } from "react";
import { Context, FocusService, GridBodyComp, GridCtrl, IGridComp, LayoutCssClasses } from "ag-grid-community";

export function GridComp(params: {context: Context}) {

    const [rtlClass, setRtlClass] = useState<string>('');
    const [keyboardFocusClass, setKeyboardFocusClass] = useState<string>('');
    const [layoutClass, setLayoutClass] = useState<string>('');

    const eRootWrapper = useRef<HTMLDivElement>(null);
    const eGridBodyParent = useRef<HTMLDivElement>(null);

    const {context} = params;

    useEffect( ()=> {
        const ctrl = context.createBean(new GridCtrl());

        const view: IGridComp = {
            destroyGridUi:
                ()=> {}, // do nothing, as framework users destroy grid by removing the comp
            setRtlClass:
                (cssClass: string) => setRtlClass(cssClass),
            addOrRemoveKeyboardFocusClass:
                (addOrRemove: boolean) => setKeyboardFocusClass(addOrRemove ? FocusService.AG_KEYBOARD_FOCUS : ''),
            forceFocusOutOfContainer: ()=>{},//this.forceFocusOutOfContainer.bind(this),
            updateLayoutClasses: params =>
                setLayoutClass(params.normal ? LayoutCssClasses.NORMAL :
                        params.autoHeight ? LayoutCssClasses.AUTO_HEIGHT : LayoutCssClasses.PRINT),
            getFocusableContainers: ()=>[],//this.getFocusableContainers.bind(this)
        };

        ctrl.setComp(view, eRootWrapper.current!, eRootWrapper.current!);

        const headerRootComp = new GridBodyComp();
        context.createBean(headerRootComp);

        const eGui = headerRootComp.getGui();
        eGridBodyParent.current!.appendChild(eGui);

        return ()=> {
            context.destroyBean(ctrl);
            context.destroyBean(headerRootComp);
        };
    }, []);

    const rootWrapperClasses = ['ag-root-wrapper', rtlClass, keyboardFocusClass, layoutClass].join(' ');
    const rootWrapperBodyClasses = ['ag-root-wrapper-body', layoutClass].join(' ');

    return (
        <div ref={eRootWrapper} className={rootWrapperClasses}>
            <div className={rootWrapperBodyClasses} ref={eGridBodyParent}>
            </div>
        </div>
    );
}
