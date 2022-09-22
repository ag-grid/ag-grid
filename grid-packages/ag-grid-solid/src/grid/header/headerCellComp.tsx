import { ColumnSortState, CssClassManager, HeaderCellCtrl, IHeader, IHeaderCellComp, UserCompDetails } from 'ag-grid-community';
import { createMemo, createSignal, onMount } from 'solid-js';
import UserComp from '../userComps/userComp';

const HeaderCellComp = (props: {ctrl: HeaderCellCtrl})=> {

    const [getWidth, setWidth] = createSignal<string>();
    const [getTitle, setTitle] = createSignal<string>();
    const [getColId, setColId] = createSignal<string>();
    const [getAriaSort, setAriaSort] = createSignal<ColumnSortState>();
    const [getAriaDescription, setAriaDescription] = createSignal<string>();
    const [getUserCompDetails, setUserCompDetails] = createSignal<UserCompDetails>();

    let eGui: HTMLDivElement;
    let eResize: HTMLDivElement
    let eHeaderCompWrapper: HTMLDivElement
    
    let userComp: IHeader | undefined;

    const setRef = (ref: any) => {
        userComp = ref;
    }

    const clearRef = (ref: any) => {
        if (userComp===ref) {
            userComp = undefined;
        }
    }

    const { ctrl } = props;

    const cssClassManager = new CssClassManager(() => eGui);

    onMount(() => {
        const compProxy: IHeaderCellComp = {
            setWidth: width => setWidth(width),
            addOrRemoveCssClass: (name, on) => cssClassManager.addOrRemoveCssClass(name, on),
            setColId: id => setColId(id),
            setTitle: title => setTitle(title),

            setAriaDescription: description => setAriaDescription(description),
            setAriaSort: sort => setAriaSort(sort),
            setUserCompDetails: compDetails => setUserCompDetails(compDetails),
            getUserCompInstance: () => userComp
        };

        ctrl.setComp(compProxy, eGui, eResize, eHeaderCompWrapper);

        const selectAllGui = ctrl.getSelectAllGui();
        eResize.insertAdjacentElement('afterend', selectAllGui);
        ctrl.setDragSource(eGui);
    });

    const style = createMemo(() => ({ width: getWidth() }));

    const showSolidComp = createMemo( ()=> {
        const details = getUserCompDetails();
        if (!details) { return false; }
        return details.componentFromFramework;
    });

    const showJsComp = createMemo( ()=> {
        const details = getUserCompDetails();
        if (!details) { return false; }
        return !details.componentFromFramework;
    });

    return (
        <div
            ref={eGui!}
            class="ag-header-cell"
            style={ style() }
            title={ getTitle() }
            col-id={ getColId() }
            aria-sort={ getAriaSort() }
            role="columnheader"
            tabIndex={-1}
            aria-description={ getAriaDescription() }
        >
            <div ref={eResize!} class="ag-header-cell-resize" role="presentation"></div>
            <div ref={eHeaderCompWrapper!} class="ag-header-cell-comp-wrapper" role="presentation">
            { getUserCompDetails() 
                && <UserComp compDetails={getUserCompDetails()!} ref={setRef} /> }
            </div>
        </div>
    );
};

export default HeaderCellComp;
