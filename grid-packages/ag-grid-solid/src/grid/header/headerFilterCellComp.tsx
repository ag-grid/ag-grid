import { AgPromise, HeaderFilterCellCtrl, IFloatingFilter, IHeaderFilterCellComp, UserCompDetails } from 'ag-grid-community';
import { createMemo, createSignal, onMount } from 'solid-js';
import { CssClasses } from '../core/utils';
import UserComp from '../userComps/userComp';

const HeaderFilterCellComp = (props: {ctrl: HeaderFilterCellCtrl}) => {

    const [getCssClasses, setCssClasses] = createSignal<CssClasses>(new CssClasses());
    const [getCssBodyClasses, setBodyCssClasses] = createSignal<CssClasses>(new CssClasses());
    const [getCssButtonWrapperClasses, setButtonWrapperCssClasses] = createSignal<CssClasses>(new CssClasses());
    const [getWidth, setWidth] = createSignal<string>();
    const [getUserCompDetails, setUserCompDetails] = createSignal<UserCompDetails>();

    let eGui: HTMLDivElement;
    let eFloatingFilterBody: HTMLDivElement;
    let eButtonWrapper: HTMLDivElement;
    let eButtonShowMainFilter: HTMLButtonElement;

    let alreadyResolved = false;
    let userCompResolve: (value: IFloatingFilter)=>void;
    let userCompPromise: AgPromise<IFloatingFilter>;
    onMount( ()=> {
        userCompPromise = new AgPromise<IFloatingFilter>( resolve => {
            userCompResolve = resolve;
        });
    });
    
    const setRef = (value: IFloatingFilter) => {
        // i don't know why, but react was calling this method multiple
        // times, thus un-setting, them immediately setting the reference again.
        // because we are resolving a promise, it's not good to be resolving
        // the promise multiple times, so we only resolve the first time.
        if (alreadyResolved) { return; }
        // we also skip when it's un-setting
        if (value==null) { return; }

        userCompResolve && userCompResolve(value);
        alreadyResolved = true;
    };

    const { ctrl } = props;

    onMount(() => {

        const compProxy: IHeaderFilterCellComp = {
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            addOrRemoveBodyCssClass: (name, on) => setBodyCssClasses(prev => prev.setClass(name, on)),
            addOrRemoveButtonWrapperCssClass: (name, on) => setButtonWrapperCssClasses(prev => prev.setClass(name, on)),
            setWidth: width => setWidth(width),
            setCompDetails: compDetails => setUserCompDetails(compDetails),
            getFloatingFilterComp: ()=> userCompPromise,
            setMenuIcon: eIcon => eButtonShowMainFilter.appendChild(eIcon)
        };

        ctrl.setComp(compProxy, eGui, eButtonShowMainFilter, eFloatingFilterBody);

    });

    const getStyle = createMemo( ()=> ({
        width: getWidth()
    }));
    
    const getCssClassesString = createMemo( ()=> 'ag-header-cell ag-floating-filter ' + getCssClasses.toString() );
    const getBodyCssClassesString = createMemo( ()=> getCssBodyClasses.toString(), );
    const getButtonWrapperCssClassesString = createMemo( ()=> 'ag-floating-filter-button ' + getCssButtonWrapperClasses.toString() );
    
    return (
        <div ref={eGui!} class={getCssClassesString()} style={getStyle()} role="gridcell" tabIndex={-1}>
            <div ref={eFloatingFilterBody!} class={getBodyCssClassesString()} role="presentation">
                { getUserCompDetails() && <UserComp compDetails={getUserCompDetails()!} ref={setRef}/> }
            </div>
            <div ref={eButtonWrapper!} class={getButtonWrapperCssClassesString()} role="presentation">
                <button ref={eButtonShowMainFilter!} type="button" aria-label="Open Filter Menu" class="ag-floating-filter-button-button" tabIndex={-1}></button>
            </div>
        </div>
    );
};

export default HeaderFilterCellComp;
