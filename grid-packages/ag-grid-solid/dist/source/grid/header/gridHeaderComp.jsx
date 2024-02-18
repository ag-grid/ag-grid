import { GridHeaderCtrl } from 'ag-grid-community';
import { createMemo, createSignal, onCleanup, onMount, useContext } from 'solid-js';
import { BeansContext } from '../core/beansContext';
import { CssClasses } from '../core/utils';
import HeaderRowContainerComp from './headerRowContainerComp';
const GridHeaderComp = () => {
    const [getCssClasses, setCssClasses] = createSignal(new CssClasses());
    const [getHeight, setHeight] = createSignal();
    const { context } = useContext(BeansContext);
    let eGui;
    const destroyFuncs = [];
    onCleanup(() => {
        destroyFuncs.forEach(f => f());
        destroyFuncs.length = 0;
    });
    onMount(() => {
        const compProxy = {
            addOrRemoveCssClass: (name, on) => setCssClasses(getCssClasses().setClass(name, on)),
            setHeightAndMinHeight: height => setHeight(height)
        };
        const ctrl = context.createBean(new GridHeaderCtrl());
        ctrl.setComp(compProxy, eGui, eGui);
        destroyFuncs.push(() => context.destroyBean(ctrl));
    });
    const className = createMemo(() => {
        let res = getCssClasses().toString();
        return 'ag-header ' + res;
    });
    const style = createMemo(() => ({
        height: getHeight(),
        'min-height': getHeight()
    }));
    return (<div ref={eGui} class={className()} style={style()} role="presentation">
            <HeaderRowContainerComp pinned={'left'}/>
            <HeaderRowContainerComp pinned={null}/>
            <HeaderRowContainerComp pinned={'right'}/>
        </div>);
};
export default GridHeaderComp;
