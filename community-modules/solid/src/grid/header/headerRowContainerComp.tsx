import { Constants, HeaderRowContainerCtrl, HeaderRowCtrl, IHeaderRowContainerComp } from '@ag-grid-community/core';
import { createMemo, createSignal, For, onCleanup, onMount, useContext } from 'solid-js';
import { BeansContext } from '../core/beansContext';
import { CssClasses } from '../core/utils';
import HeaderRowComp from './headerRowComp';

const HeaderRowContainerComp = (props: {pinned: string | null})=> {

    const [getCssClasses, setCssClasses] = createSignal<CssClasses>(new CssClasses());
    const [getCenterContainerWidth, setCenterContainerWidth] = createSignal<string>();
    const [getCenterContainerTransform, setCenterContainerTransform] = createSignal<string>();
    const [getPinnedContainerWidth, setPinnedContainerWidth] = createSignal<string>();
    const [getHeaderRowCtrls, setHeaderRowCtrls] = createSignal<HeaderRowCtrl[]>([]);

    const {context} = useContext(BeansContext);
    let eGui: HTMLDivElement;

    const pinnedLeft = props.pinned === Constants.PINNED_LEFT;
    const pinnedRight = props.pinned === Constants.PINNED_RIGHT;
    const centre = !pinnedLeft && !pinnedRight;

    const destroyFuncs: (()=>void)[] = [];
    onCleanup( ()=> {
        destroyFuncs.forEach( f => f() );
        destroyFuncs.length = 0;
    });

    onMount(() => {

        const compProxy: IHeaderRowContainerComp = {
            addOrRemoveCssClass: (name, on) => setCssClasses(getCssClasses().setClass(name, on)),
            setCtrls: ctrls => setHeaderRowCtrls(ctrls),

            // centre only
            setCenterWidth: width => setCenterContainerWidth(width),
            setContainerTransform: transform => setCenterContainerTransform(transform),

            // pinned only
            setPinnedContainerWidth: width => setPinnedContainerWidth(width)
        };

        const ctrl = context.createBean(new HeaderRowContainerCtrl(props.pinned));
        ctrl.setComp(compProxy, eGui);

        destroyFuncs.push( ()=> context.destroyBean(ctrl) );
    });

    const getClassName = createMemo( ()=> getCssClasses.toString() );

    const insertRowsJsx = ()=> 
    <For each={getHeaderRowCtrls()}>{ ctrl =>
        <HeaderRowComp ctrl={ctrl}/>
    }</For>;    
    
    const eCenterContainerStyle = createMemo( ()=> ({
        width: getCenterContainerWidth(),
        transform: getCenterContainerTransform()
    }));

    const ePinnedStyle = createMemo( ()=> ({
        width: getPinnedContainerWidth(),
        'min-width': getPinnedContainerWidth(),
        'max-width': getPinnedContainerWidth()
    }));

    return (
        <>
            { 
                pinnedLeft && 
                <div ref={eGui!} class={"ag-pinned-left-header " + getClassName()} role="presentation" style={ePinnedStyle()}>
                    { insertRowsJsx() }
                </div>
            }
            { 
                pinnedRight && 
                <div ref={eGui!} class={"ag-pinned-right-header " + getClassName()} role="presentation" style={ePinnedStyle()}>
                { insertRowsJsx() }
            </div>
            }
            { 
                centre && 
                <div ref={eGui!} class={"ag-header-viewport " + getClassName()} role="presentation">
                    <div class="ag-header-container" role="rowgroup" style={eCenterContainerStyle()}>
                        { insertRowsJsx() }
                    </div>
                </div>
            }
        </>
    );
};

export default HeaderRowContainerComp;
