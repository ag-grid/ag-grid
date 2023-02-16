import { HeaderRowContainerCtrl } from '@ag-grid-community/core';
import { createMemo, createSignal, For, onCleanup, onMount, useContext } from 'solid-js';
import { BeansContext } from '../core/beansContext';
import { CssClasses } from '../core/utils';
import HeaderRowComp from './headerRowComp';
const HeaderRowContainerComp = (props) => {
    const [getCssClasses, setCssClasses] = createSignal(new CssClasses());
    const [getAriaHidden, setAriaHidden] = createSignal(false);
    const [getCenterContainerWidth, setCenterContainerWidth] = createSignal();
    const [getCenterContainerTransform, setCenterContainerTransform] = createSignal();
    const [getPinnedContainerWidth, setPinnedContainerWidth] = createSignal();
    const [getHeaderRowCtrls, setHeaderRowCtrls] = createSignal([]);
    const { context } = useContext(BeansContext);
    let eGui;
    const pinnedLeft = props.pinned === 'left';
    const pinnedRight = props.pinned === 'right';
    const centre = !pinnedLeft && !pinnedRight;
    const destroyFuncs = [];
    onCleanup(() => {
        destroyFuncs.forEach(f => f());
        destroyFuncs.length = 0;
    });
    onMount(() => {
        const compProxy = {
            setDisplayed: (displayed) => {
                setCssClasses(getCssClasses().setClass('ag-hidden', !displayed));
                setAriaHidden(!displayed);
            },
            setCtrls: ctrls => setHeaderRowCtrls(ctrls),
            // centre only
            setCenterWidth: width => setCenterContainerWidth(width),
            setContainerTransform: transform => setCenterContainerTransform(transform),
            // pinned only
            setPinnedContainerWidth: width => setPinnedContainerWidth(width)
        };
        const ctrl = context.createBean(new HeaderRowContainerCtrl(props.pinned));
        ctrl.setComp(compProxy, eGui);
        destroyFuncs.push(() => context.destroyBean(ctrl));
    });
    const getClassName = createMemo(() => getCssClasses.toString());
    const insertRowsJsx = () => <For each={getHeaderRowCtrls()}>{ctrl => <HeaderRowComp ctrl={ctrl}/>}</For>;
    const eCenterContainerStyle = createMemo(() => ({
        width: getCenterContainerWidth(),
        transform: getCenterContainerTransform()
    }));
    const ePinnedStyle = createMemo(() => ({
        width: getPinnedContainerWidth(),
        'min-width': getPinnedContainerWidth(),
        'max-width': getPinnedContainerWidth()
    }));
    return (<>
            {pinnedLeft &&
            <div ref={eGui} class={"ag-pinned-left-header " + getClassName()} aria-hidden={getAriaHidden()} role="presentation" style={ePinnedStyle()}>
                    {insertRowsJsx()}
                </div>}
            {pinnedRight &&
            <div ref={eGui} class={"ag-pinned-right-header " + getClassName()} aria-hidden={getAriaHidden()} role="presentation" style={ePinnedStyle()}>
                {insertRowsJsx()}
            </div>}
            {centre &&
            <div ref={eGui} class={"ag-header-viewport " + getClassName()} role="presentation">
                    <div class="ag-header-container" role="rowgroup" style={eCenterContainerStyle()}>
                        {insertRowsJsx()}
                    </div>
                </div>}
        </>);
};
export default HeaderRowContainerComp;
