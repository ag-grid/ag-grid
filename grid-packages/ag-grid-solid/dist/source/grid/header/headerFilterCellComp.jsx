import { AgPromise } from 'ag-grid-community';
import { createMemo, createSignal, onMount } from 'solid-js';
import { CssClasses } from '../core/utils';
import UserComp from '../userComps/userComp';
const HeaderFilterCellComp = (props) => {
    const [getCssClasses, setCssClasses] = createSignal(new CssClasses());
    const [getCssBodyClasses, setBodyCssClasses] = createSignal(new CssClasses());
    const [getCssButtonWrapperClasses, setButtonWrapperCssClasses] = createSignal(new CssClasses());
    const [getButtonWrapperAriaHidden, setButtonWrapperAriaHidden] = createSignal("false");
    const [getWidth, setWidth] = createSignal();
    const [getUserCompDetails, setUserCompDetails] = createSignal();
    let eGui;
    let eFloatingFilterBody;
    let eButtonWrapper;
    let eButtonShowMainFilter;
    let alreadyResolved = false;
    let userCompResolve;
    let userCompPromise;
    onMount(() => {
        userCompPromise = new AgPromise(resolve => {
            userCompResolve = resolve;
        });
    });
    const setRef = (value) => {
        // i don't know why, but react was calling this method multiple
        // times, thus un-setting, them immediately setting the reference again.
        // because we are resolving a promise, it's not good to be resolving
        // the promise multiple times, so we only resolve the first time.
        if (alreadyResolved) {
            return;
        }
        // we also skip when it's un-setting
        if (value == null) {
            return;
        }
        userCompResolve && userCompResolve(value);
        alreadyResolved = true;
    };
    const { ctrl } = props;
    onMount(() => {
        const compProxy = {
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            addOrRemoveBodyCssClass: (name, on) => setBodyCssClasses(prev => prev.setClass(name, on)),
            setButtonWrapperDisplayed: (displayed) => {
                setButtonWrapperCssClasses(prev => prev.setClass('ag-hidden', !displayed));
                setButtonWrapperAriaHidden(!displayed ? "true" : "false");
            },
            setWidth: width => setWidth(width),
            setCompDetails: compDetails => setUserCompDetails(compDetails),
            getFloatingFilterComp: () => userCompPromise,
            setMenuIcon: eIcon => eButtonShowMainFilter.appendChild(eIcon)
        };
        ctrl.setComp(compProxy, eGui, eButtonShowMainFilter, eFloatingFilterBody);
    });
    const getStyle = createMemo(() => ({
        width: getWidth()
    }));
    const getCssClassesString = createMemo(() => 'ag-header-cell ag-floating-filter ' + getCssClasses.toString());
    const getBodyCssClassesString = createMemo(() => getCssBodyClasses.toString());
    const getButtonWrapperCssClassesString = createMemo(() => 'ag-floating-filter-button ' + getCssButtonWrapperClasses.toString());
    return (<div ref={eGui} class={getCssClassesString()} style={getStyle()} role="gridcell" tabIndex={-1}>
            <div ref={eFloatingFilterBody} class={getBodyCssClassesString()} role="presentation">
                {getUserCompDetails() && <UserComp compDetails={getUserCompDetails()} ref={setRef}/>}
            </div>
            <div ref={eButtonWrapper} aria-hidden={getButtonWrapperAriaHidden()} class={getButtonWrapperCssClassesString()} role="presentation">
                <button ref={eButtonShowMainFilter} type="button" aria-label="Open Filter Menu" class="ag-floating-filter-button-button" tabIndex={-1}></button>
            </div>
        </div>);
};
export default HeaderFilterCellComp;
