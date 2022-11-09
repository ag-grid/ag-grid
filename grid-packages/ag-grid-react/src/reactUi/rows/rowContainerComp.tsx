import { getRowContainerTypeForName, IRowContainerComp, RowContainerCtrl, RowContainerName, RowCtrl } from 'ag-grid-community';
import React, { useEffect, useMemo, useRef, useState, memo, useContext } from 'react';
import { classesList } from '../utils';
import useReactCommentEffect from '../reactComment';
import RowComp from './rowComp';
import { BeansContext } from '../beansContext';
import { useEffectOnce } from '../useEffectOnce';

const RowContainerComp = (params: {name: RowContainerName}) => {

    const {context} = useContext(BeansContext);

    const [viewportHeight, setViewportHeight] = useState<string>('');
    const [rowCtrlsOrdered, setRowCtrlsOrdered] = useState<RowCtrl[]>([]);
    const [rowCtrls, setRowCtrls] = useState<RowCtrl[]>([]);
    const [domOrder, setDomOrder] = useState<boolean>(false);
    const [containerWidth, setContainerWidth] = useState<string>('');

    const { name } = params;
    const containerType = useMemo(() => getRowContainerTypeForName(name), [name]);

    const eWrapper = useRef<HTMLDivElement>(null);
    const eViewport = useRef<HTMLDivElement>(null);
    const eContainer = useRef<HTMLDivElement>(null);

    const cssClasses = useMemo(() => RowContainerCtrl.getRowContainerCssClasses(name), [name]);
    const wrapperClasses = useMemo( ()=> classesList(cssClasses.wrapper), []);
    const viewportClasses = useMemo( ()=> classesList(cssClasses.viewport), []);
    const containerClasses = useMemo( ()=> classesList(cssClasses.container), []);

    // no need to useMemo for boolean types
    const template1 = name === RowContainerName.CENTER;
    const template2 = name === RowContainerName.TOP_CENTER 
                    || name === RowContainerName.BOTTOM_CENTER 
                    || name === RowContainerName.STICKY_TOP_CENTER;
    const template3 = !template1 && !template2;

    const topLevelRef = template1 ? eWrapper : template2 ? eViewport : eContainer;

    useReactCommentEffect(' AG Row Container ' + name + ' ', topLevelRef);

    // if domOrder=true, then we just copy rowCtrls into rowCtrlsOrdered observing order,
    // however if false, then we need to keep the order as they are in the dom, otherwise rowAnimation breaks
    useEffect(() => {
        setRowCtrlsOrdered( prev => {
            if (domOrder) {
                return rowCtrls;
            }
            // if dom order not important, we don't want to change the order
            // of the elements in the dom, as this would break transition styles
            const oldRows = prev.filter(r => rowCtrls.indexOf(r) >= 0);
            const newRows = rowCtrls.filter(r => oldRows.indexOf(r) < 0);
            const next = [...oldRows, ...newRows];
            return next;
        });
    }, [domOrder, rowCtrls]);

    useEffectOnce(() => {
        const beansToDestroy: any[] = [];

        const compProxy: IRowContainerComp = {
            setViewportHeight: setViewportHeight,
            setRowCtrls: rowCtrls => setRowCtrls(rowCtrls),
            setDomOrder: domOrder => setDomOrder(domOrder),
            setContainerWidth: width => setContainerWidth(width)
        };

        const ctrl = context.createBean(new RowContainerCtrl(name));
        beansToDestroy.push(ctrl);

        ctrl.setComp(compProxy, eContainer.current!, eViewport.current!, eWrapper.current!);

        return () => {
            context.destroyBeans(beansToDestroy);
        };

    });

    const viewportStyle = useMemo(() => ({
        height: viewportHeight
    }), [viewportHeight]);

    const containerStyle = useMemo(() => ({
        width: containerWidth
    }), [containerWidth]);

    const buildContainer = () => (
        <div
            className={ containerClasses }
            ref={ eContainer }
            role={ rowCtrls.length ? "rowgroup" : "presentation" }
            style={ containerStyle }>
            {
                rowCtrlsOrdered.map(rowCtrl =>
                    <RowComp rowCtrl={ rowCtrl } containerType={ containerType } key={ rowCtrl.getInstanceId() }></RowComp>
                )
            }
        </div>
    );

    return (
        <>
            {
                template1 &&
                <div className={ wrapperClasses } ref={ eWrapper } role="presentation">
                    <div className={ viewportClasses } ref= { eViewport } role="presentation" style={ viewportStyle }>
                        { buildContainer() }
                    </div>
                </div>
            }
            {
                template2 &&
                <div className={ viewportClasses } ref= { eViewport } role="presentation" style={ viewportStyle }>
                    { buildContainer() }
                </div>
            }
            {
                template3 && buildContainer()
            }
        </>
    );
};

export default memo(RowContainerComp);
