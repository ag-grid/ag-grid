import React, { useEffect, useRef, useState } from "react";
import {
    Autowired,
    Context,
    FocusService,
    GridBodyComp,
    GridCtrl,
    IGridComp,
    LayoutCssClasses
} from "ag-grid-community";
import { AgStackComponentsRegistry } from "ag-grid-community/dist/cjs/components/agStackComponentsRegistry";

export function GridComp(params: {context: Context}) {

    const [rtlClass, setRtlClass] = useState<string>('');
    const [keyboardFocusClass, setKeyboardFocusClass] = useState<string>('');
    const [layoutClass, setLayoutClass] = useState<string>('');
    // const [ctrl, setCtrl] = useState<GridCtrl>();

    const eRootWrapper = useRef<HTMLDivElement>(null);
    const eGridBodyParent = useRef<HTMLDivElement>(null);

    const {context} = params;

    useEffect( ()=> {
        const ctrl = context.createBean(new GridCtrl());

        const compProxy: IGridComp = {
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

        ctrl.setComp(compProxy, eRootWrapper.current!, eRootWrapper.current!);
        // setCtrl(ctrl);

        const agStackComponentsRegistry: AgStackComponentsRegistry = context.getBean('agStackComponentsRegistry');
        // agStackComponentsRegistry.getComponentClass();

        const headerRootComp = new GridBodyComp();
        context.createBean(headerRootComp);
        eGridBodyParent.current!.appendChild(headerRootComp.getGui());

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


/*
private createTemplate(): string {
    const dropZones = this.ctrl.showDropZones() ? '<ag-grid-header-drop-zones></ag-grid-header-drop-zones>' : '';
    const sideBar = this.ctrl.showSideBar() ? '<ag-side-bar ref="sideBar"></ag-side-bar>' : '';
    const statusBar = this.ctrl.showStatusBar() ? '<ag-status-bar ref="statusBar"></ag-status-bar>' : '';
    const watermark = this.ctrl.showWatermark() ? '<ag-watermark></ag-watermark>' : '';

    const template = /!* html *!/
        `<div ref="eRootWrapper" class="ag-root-wrapper">
                ${dropZones}
                <div class="ag-root-wrapper-body" ref="rootWrapperBody">
                    <ag-grid-body ref="gridBody"></ag-grid-body>
                    ${sideBar}
                </div>
                ${statusBar}
                <ag-pagination></ag-pagination>
                ${watermark}
            </div>`;

    return template;
}*/
