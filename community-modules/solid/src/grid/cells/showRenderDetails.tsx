import { CellCtrl, Component, ICellRenderer } from '@ag-grid-community/core';
import { createMemo, onCleanup, useContext } from 'solid-js';
import { BeansContext } from '../core/beansContext';
import UserComp from '../userComps/userComp';
import { RenderDetails } from './common';

const ToolsComp = (props: {
    includeSelection: boolean,
    includeDndSource: boolean,
    includeRowDrag: boolean,
    cellCtrl: CellCtrl
}) => {

    const {context} = useContext(BeansContext);

    const CompWrapper = (innerProps: {
        createFn: ()=>Component|undefined
    })=> {
        const comp = innerProps.createFn();
        if (!comp) { return <></>; }

        onCleanup( ()=> context.destroyBean(comp) );
        return <>{comp.getGui()}</>
    };

    return (
        <>
            { props.includeSelection && 
                <CompWrapper createFn={()=>props.cellCtrl.createSelectionCheckbox()}/> }
            { props.includeDndSource && 
                <CompWrapper createFn={()=>props.cellCtrl.createDndSource()}/> }
            { props.includeRowDrag && 
                <CompWrapper createFn={()=>props.cellCtrl.createRowDragComp()}/> }
        </>
    );
};

const ShowRenderDetails = (props: {
    showDetails: RenderDetails,
    ref: any,
    showCellWrapper: boolean,
    showTools: boolean,
    includeDndSource: boolean,
    includeRowDrag: boolean,
    includeSelection: boolean,
    cellCtrl: CellCtrl,
    cellInstanceId: string,
    setECellValue: (eCellValue: HTMLElement) => void
}) => {

    const getCompDetails = createMemo(() => props.showDetails.compDetails);
    const isNoCompDetails = createMemo(()=> props.showDetails.compDetails == null);

    // if we didn't do this, objects would cause error. we depend on objects for things
    // like the aggregation functions avg and count, which return objects and depend on toString()
    // getting called.
    const valueForNoCellRenderer = () => {
        const value = props.showDetails.value;
        return (value && value.toString) ? value.toString() : value;
    };

    const bodyJsxFunc = () => (
        <>
            {isNoCompDetails() && <>{valueForNoCellRenderer()}</>}
            {getCompDetails() && <UserComp compDetails={getCompDetails()!}
                ref={props.ref}/>}
        </>
    );

    return (
        <>
            {
                props.showTools &&
                <ToolsComp
                    includeDndSource={props.includeDndSource}
                    includeRowDrag={props.includeRowDrag}
                    includeSelection={props.includeSelection}
                    cellCtrl={props.cellCtrl} />
            }
            {
                props.showCellWrapper
                    ? (
                        <span role="presentation" id={`cell-${props.cellInstanceId}`} class="ag-cell-value" ref={props.setECellValue}>
                            {bodyJsxFunc()}
                        </span>
                    )
                    : bodyJsxFunc()
            }
        </>
    );
}

export default ShowRenderDetails;
