
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext';
import { ColumnSortState, HeaderFilterCellCtrl, IHeader, IHeaderCellComp, UserCompDetails } from 'ag-grid-community';
import { CssClasses, isComponentStateless } from '../utils';
import { showJsComp } from '../jsComp';

const HeaderFilterCellComp = (props: {ctrl: HeaderFilterCellCtrl}) => {
    return (<></>);
};

export default memo(HeaderFilterCellComp);
