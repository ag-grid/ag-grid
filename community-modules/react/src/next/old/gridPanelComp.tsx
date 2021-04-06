import {Context, HeaderRootComp, GridBodyComp, ColumnSt, HeaderRowSt, RowSt, RowContainerSt} from "@ag-grid-community/core";
import React, {useRef, useEffect, useState, MutableRefObject} from "react";
import {RowComp} from "./rowComp";

export function GridCoreComp(props: { headerRows: HeaderRowSt[], rows: RowSt[], centerRowContainer: RowContainerSt, context: Context }) {
    const {context, headerRows, rows, centerRowContainer} = props;
    return (
        <div className="ag-root-wrapper ag-layout-normal ag-ltr">
            <div className="ag-root-wrapper-body ag-layout-normal ag-focus-managed">
                <GridPanelComp headerRows={headerRows} rows={rows} centerRowContainer={centerRowContainer} context={context}/>
            </div>
        </div>
    );
}

export function GridPanelComp(props: { headerRows: HeaderRowSt[], rows: RowSt[], centerRowContainer: RowContainerSt, context: Context }) {

    const {headerRows, rows, centerRowContainer, context} = props;

    return (
        <div className="ag-root ag-unselectable ag-layout-normal" role="grid" unselectable="on">
            <HeaderRootReactComp headerRows={headerRows} context={context}/>

{/*
            <div className="ag-floating-top" ref="eTop" role="presentation" unselectable="on">
                <div className="ag-pinned-left-floating-top" ref="eLeftTop" role="presentation" unselectable="on"></div>
                <div className="ag-floating-top-viewport" ref="eTopViewport" role="presentation" unselectable="on">
                    <div className="ag-floating-top-container" ref="eTopContainer" role="presentation" unselectable="on"></div>
                </div>
                <div className="ag-pinned-right-floating-top" ref="eRightTop" role="presentation" unselectable="on"></div>
                <div className="ag-floating-top-full-width-container" ref="eTopFullWidthContainer" role="presentation"
                     unselectable="on"></div>
            </div>
*/}

            <div className="ag-body-viewport" role="presentation">
                <div className="ag-pinned-left-cols-container" role="presentation" unselectable="on"></div>
                <div className="ag-center-cols-clipper" role="presentation" unselectable="on"
                        style={{height: centerRowContainer.height + 'px'}}>
                    <div className="ag-center-cols-viewport" role="presentation" style={{height: '100%'}}>
                        <div className="ag-center-cols-container" role="rowgroup" unselectable="on"
                            style={{
                                height: centerRowContainer.height + 'px',
                                width: centerRowContainer.width + 'px'
                            }}>
                            { rows.map( (row: RowSt) => <RowComp key={row.id} row={row}/> ) }
                        </div>
                    </div>
                </div>
                <div className="ag-pinned-right-cols-container" role="presentation" unselectable="on"></div>
                {/*<div className="ag-full-width-container" role="presentation" unselectable="on"></div>*/}
            </div>

{/*
            <div className="ag-floating-bottom" ref="eBottom" role="presentation" unselectable="on">
                <div className="ag-pinned-left-floating-bottom" ref="eLeftBottom" role="presentation" unselectable="on"></div>
                <div className="ag-floating-bottom-viewport" ref="eBottomViewport" role="presentation" unselectable="on">
                    <div className="ag-floating-bottom-container" ref="eBottomContainer" role="presentation"
                         unselectable="on"></div>
                </div>
                <div className="ag-pinned-right-floating-bottom" ref="eRightBottom" role="presentation" unselectable="on"></div>
                <div className="ag-floating-bottom-full-width-container" ref="eBottomFullWidthContainer" role="presentation"
                     unselectable="on"></div>
            </div>
*/}

{/*
            <div className="ag-body-horizontal-scroll" ref="eHorizontalScrollBody" aria-hidden="true">
                <div className="ag-horizontal-left-spacer" ref="eHorizontalLeftSpacer"></div>
                <div className="ag-body-horizontal-scroll-viewport" ref="eBodyHorizontalScrollViewport">
                    <div className="ag-body-horizontal-scroll-container" ref="eBodyHorizontalScrollContainer"></div>
                </div>
                <div className="ag-horizontal-right-spacer" ref="eHorizontalRightSpacer"></div>
            </div>
*/}
            {/*<ag-overlay-wrapper ref="overlayWrapper"></ag-overlay-wrapper>*/}
        </div>

/*
        <div>
            <div className={'header'}>
                {/!* need better ref rather than index *!/}
                { headerRows.map( (headerRow: HeaderRowSt, index: number) => <HeaderRowComp headerRow={headerRow} key={index}/>)}
            </div>
            <div className={'body'}>
                { rows.map( (row: RowSt) => <RowComp key={row.id} row={row}/> ) }
            </div>
        </div>
*/
    );
}

class MyGridPanel {

    getDropTargetBodyContainers(): [] {
        return [];
    }
    getDropTargetLeftContainers(): [] {
        return [];
    }
    getDropTargetRightContainers(): [] {
        return [];
    }

}

function HeaderRootReactComp(props: {headerRows: HeaderRowSt[], context: Context}) {

    const {context} = props;
    const eHeaderRoot = useRef<HTMLDivElement>(null);

    useEffect(()=> {
        const headerRootComp = new HeaderRootComp();
        context.createBean(headerRootComp);
        headerRootComp.registerGridComp(new MyGridPanel() as any as GridBodyComp)

        const eGui = headerRootComp.getGui();
        eHeaderRoot.current!.appendChild(eGui);
        return ()=> context.destroyBean(headerRootComp);
    }, []);

    return (
        <div style={{height: '40px'}} className="ag-header ag-focus-managed ag-pivot-off" role="presentation" ref={eHeaderRoot} unselectable="on"></div>
    );

    // return (
    //     <div className={'header'}>
    //         {/*need better ref rather than index*/}
    //         { headerRows.map( (headerRow: HeaderRowSt, index: number) => <HeaderRowComp headerRow={headerRow} key={index}/>)}
    //     </div>
    // );
}

function HeaderRowComp(props: {headerRow: HeaderRowSt}) {
    return (
        <div className={'headerRow'}>
            { props.headerRow.columns.map( (column: ColumnSt) => <HeaderWrapperComp key={column.id} column={column}/>) }
        </div>
    );
}

function HeaderWrapperComp(props: {column: ColumnSt}) {
    return (
        <div>{props.column.name}</div>
    );
}



