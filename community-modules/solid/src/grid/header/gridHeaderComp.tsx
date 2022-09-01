import { Constants, GridHeaderCtrl, IGridHeaderComp } from '@ag-grid-community/core';
import { createMemo, createSignal, onCleanup, onMount, useContext } from 'solid-js';
import { BeansContext } from '../core/beansContext';
import { CssClasses } from '../core/utils';
import HeaderRowContainerComp from './headerRowContainerComp';

const GridHeaderComp = ()=> {
    
    const [getCssClasses, setCssClasses] = createSignal<CssClasses>(new CssClasses());
    const [getHeight, setHeight] = createSignal<string>();

    const {context} = useContext(BeansContext);
    let eGui: HTMLDivElement;

    const destroyFuncs: (()=>void)[] = [];
    onCleanup( ()=> {
        destroyFuncs.forEach( f => f() );
        destroyFuncs.length = 0;
    });

    onMount( () => {

        const compProxy: IGridHeaderComp = {
            addOrRemoveCssClass: (name, on) => setCssClasses(getCssClasses().setClass(name, on)),
            setHeightAndMinHeight: height => setHeight(height)
        };

        const ctrl = context.createBean(new GridHeaderCtrl());
        ctrl.setComp(compProxy, eGui, eGui);

        destroyFuncs.push( ()=> context.destroyBean(ctrl) );
    });

    const className = createMemo( ()=> {
        let res = getCssClasses().toString();
        return 'ag-header ' + res;
    });

    const style = createMemo( ()=> ({
        height: getHeight(),
        'min-height': getHeight()
    }));

    return (
        <div ref={eGui!} class={className()} style={style()} role="presentation">
            <HeaderRowContainerComp pinned={Constants.PINNED_LEFT}/>
            <HeaderRowContainerComp pinned={null}/>
            <HeaderRowContainerComp pinned={Constants.PINNED_RIGHT}/>
        </div>
    );
};

export default GridHeaderComp;
