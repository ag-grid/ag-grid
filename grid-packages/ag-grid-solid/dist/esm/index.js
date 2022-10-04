import { use, insert, memo, createComponent, mergeProps, effect, className, template, spread, style, setAttribute, Portal } from 'solid-js/web';
import { BaseComponentWrapper, GroupCellRendererCtrl, _, VanillaFrameworkOverrides, CssClassManager, AgPromise, HeaderRowType, Constants, HeaderRowContainerCtrl, GridHeaderCtrl, PopupEditorWrapper, getRowContainerTypeForName, RowContainerCtrl, RowContainerName, GridBodyCtrl, TabGuardCtrl, GridCtrl, FocusService, ComponentUtil, GridCoreCreator, CtrlsService } from 'ag-grid-community';
import { createContext, useContext, createSignal, createMemo, onMount, onCleanup, createEffect, For } from 'solid-js';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

class SolidCompWrapper {
  constructor(SolidCompClass, portalManager) {
    _defineProperty(this, "eGui", void 0);

    _defineProperty(this, "SolidCompClass", void 0);

    _defineProperty(this, "portalManager", void 0);

    _defineProperty(this, "portalInfo", void 0);

    _defineProperty(this, "instance", void 0);

    this.SolidCompClass = SolidCompClass;
    this.portalManager = portalManager;
  }

  init(props) {
    this.eGui = document.createElement('div');
    this.eGui.className = 'ag-solid-container';
    this.portalInfo = {
      mount: this.eGui,
      SolidClass: this.SolidCompClass,
      props,
      ref: instance => {
        this.instance = instance;
      }
    };
    this.portalManager.addPortal(this.portalInfo);
  }

  destroy() {
    this.portalInfo && this.portalManager.removePortal(this.portalInfo);
  }

  getGui() {
    return this.eGui;
  }

  hasMethod(name) {
    return this.instance[name] != null;
  }

  getFrameworkComponentInstance() {
    return this.instance;
  }

  callMethod(name, args) {
    return this.instance[name].apply(this.instance, args);
  }

  addMethod(name, callback) {
    this[name] = callback;
  }

}

class SolidCompWrapperFactory extends BaseComponentWrapper {
  constructor(portalManager) {
    super();

    _defineProperty(this, "portalManager", void 0);

    this.portalManager = portalManager;
  }

  createWrapper(SolidComponentClass) {
    return new SolidCompWrapper(SolidComponentClass, this.portalManager);
  }

}

const BeansContext = createContext({});

const classesList = (...list) => {
  const filtered = list.filter(s => s != null && s !== '');
  return filtered.join(' ');
};
class CssClasses {
  constructor(...initialClasses) {
    _defineProperty(this, "classesMap", {});

    initialClasses.forEach(className => {
      this.classesMap[className] = true;
    });
  }

  setClass(className, on) {
    // important to not make a copy if nothing has changed, so react
    // won't trigger a render cycle on new object instance
    const nothingHasChanged = !!this.classesMap[className] == on;

    if (nothingHasChanged) {
      return this;
    }

    const res = new CssClasses();
    res.classesMap = { ...this.classesMap
    };
    res.classesMap[className] = on;
    return res;
  }

  toString() {
    const res = Object.keys(this.classesMap).filter(key => this.classesMap[key]).join(' ');
    return res;
  }

}

const _tmpl$$f = /*#__PURE__*/template(`<div></div>`, 2);

const DetailCellRenderer = props => {
  const {
    ctrlsFactory,
    context,
    gridOptionsWrapper,
    resizeObserverService,
    clientSideRowModel,
    serverSideRowModel
  } = useContext(BeansContext);
  const [getCssClasses, setCssClasses] = createSignal(new CssClasses());
  const [getGridCssClasses, setGridCssClasses] = createSignal(new CssClasses());
  const [getDetailGridOptions, setDetailGridOptions] = createSignal();
  const [getDetailRowData, setDetailRowData] = createSignal();
  let ctrl;
  let eGuiRef;
  const getCssClassesStr = createMemo(() => getCssClasses().toString() + ' ag-details-row');
  const getGridCssClassesStr = createMemo(() => getGridCssClasses().toString() + ' ag-details-grid');
  props.ref(() => ({
    // force new instance when grid tries to refresh
    refresh() {
      return ctrl.refresh();
    }

  }));
  onMount(() => {
    if (props.template && typeof props.template === 'string') {
      console.warn('AG Grid: detailCellRendererParams.template is not supported by Solid - this only works with frameworks that work against String templates. To change the template, please provide your own Solid Detail Cell Renderer.');
    }

    const compProxy = {
      addOrRemoveCssClass: (name, on) => setCssClasses(getCssClasses().setClass(name, on)),
      addOrRemoveDetailGridCssClass: (name, on) => setGridCssClasses(getGridCssClasses().setClass(name, on)),
      setDetailGrid: gridOptions => setDetailGridOptions(gridOptions),
      setRowData: rowData => setDetailRowData(rowData),
      getGui: () => eGuiRef
    };
    ctrl = ctrlsFactory.getInstance('detailCellRenderer');

    if (!ctrl) {
      return;
    } // should never happen, means master/detail module not loaded


    context.createBean(ctrl);
    ctrl.init(compProxy, props);
    let resizeObserverDestroyFunc;

    if (gridOptionsWrapper.isDetailRowAutoHeight()) {
      const checkRowSizeFunc = () => {
        // when disposed, current is null, so nothing to do, and the resize observer will
        // be disposed of soon
        if (eGuiRef == null) {
          return;
        }

        const clientHeight = eGuiRef.clientHeight; // if the UI is not ready, the height can be 0, which we ignore, as otherwise a flicker will occur
        // as UI goes from the default height, to 0, then to the real height as UI becomes ready. this means
        // it's not possible for have 0 as auto-height, however this is an improbable use case, as even an
        // empty detail grid would still have some styling around it giving at least a few pixels.

        if (clientHeight != null && clientHeight > 0) {
          // we do the update in a timeout, to make sure we are not calling from inside the grid
          // doing another update
          const updateRowHeightFunc = () => {
            props.node.setRowHeight(clientHeight);

            if (clientSideRowModel) {
              clientSideRowModel.onRowHeightChanged();
            } else if (serverSideRowModel) {
              serverSideRowModel.onRowHeightChanged();
            }
          };

          setTimeout(updateRowHeightFunc, 0);
        }
      };

      resizeObserverDestroyFunc = resizeObserverService.observeResize(eGuiRef, checkRowSizeFunc);
      checkRowSizeFunc();
    }

    return () => {
      context.destroyBean(ctrl);

      if (resizeObserverDestroyFunc) {
        resizeObserverDestroyFunc();
      }
    };
  });

  const setRef = ref => {
    ctrl.registerDetailWithMaster(ref.api, ref.columnApi);
  };

  return (() => {
    const _el$ = _tmpl$$f.cloneNode(true);

    const _ref$ = eGuiRef;
    typeof _ref$ === "function" ? use(_ref$, _el$) : eGuiRef = _el$;

    insert(_el$, (() => {
      const _c$ = memo(() => !!getDetailGridOptions(), true);

      return () => _c$() && createComponent(AgGridSolid, mergeProps({
        get ["class"]() {
          return getGridCssClassesStr();
        }

      }, getDetailGridOptions, {
        get rowData() {
          return getDetailRowData();
        },

        ref: setRef
      }));
    })());

    effect(() => className(_el$, getCssClassesStr()));

    return _el$;
  })();
};

const JsUserComp = p => {
  const {
    context
  } = useContext(BeansContext);
  const promise = p.compDetails.newAgStackInstance();

  if (!promise) {
    return [];
  }

  const comp = promise.resolveNow(null, x => x); // js comps are never async

  if (!comp) {
    return [];
  }

  p.ref && p.ref(comp);
  const gui = comp.getGui();
  onCleanup(() => {
    comp && context.destroyBean(comp);
    p.ref && p.ref(undefined);
  });
  return gui;
};

const SolidUserComp = props => {
  const SolidClass = props.compDetails.componentClass;
  let refSet = false;

  const setRef = ref => {
    if (!props.ref) {
      return;
    }

    props.ref(ref);
    refSet = true;
  };

  onCleanup(() => {
    if (refSet) {
      props.ref && props.ref(undefined);
    }
  });
  return createComponent(SolidClass, mergeProps({
    ref: setRef
  }, () => props.compDetails.params));
};

const UserComp = p => {
  const showSolidComp = createMemo(() => {
    const details = p.compDetails;

    if (!details) {
      return false;
    }

    return details.componentFromFramework;
  });
  const showJsComp = createMemo(() => {
    const details = p.compDetails;

    if (!details) {
      return false;
    }

    return !details.componentFromFramework;
  });
  return [memo((() => {
    const _c$ = memo(() => !!showSolidComp(), true);

    return () => _c$() && createComponent(SolidUserComp, {
      get compDetails() {
        return p.compDetails;
      },

      ref(r$) {
        const _ref$ = p.ref;
        typeof _ref$ === "function" ? _ref$(r$) : p.ref = r$;
      }

    });
  })()), memo((() => {
    const _c$2 = memo(() => !!showJsComp(), true);

    return () => _c$2() && createComponent(JsUserComp, {
      get compDetails() {
        return p.compDetails;
      },

      ref(r$) {
        const _ref$2 = p.ref;
        typeof _ref$2 === "function" ? _ref$2(r$) : p.ref = r$;
      }

    });
  })())];
};

const _tmpl$$e = /*#__PURE__*/template(`<span><span></span><span></span><span></span><span class="ag-group-value"></span><span class="ag-group-child-count"></span></span>`, 12);

const GroupCellRenderer = props => {
  const context = useContext(BeansContext).context;
  let eGui;
  let eValueRef;
  let eCheckboxRef;
  let eExpandedRef;
  let eContractedRef;
  const [getInnerCompDetails, setInnerCompDetails] = createSignal();
  const [getChildCount, setChildCount] = createSignal();
  const [getValue, setValue] = createSignal();
  const [getCssClasses, setCssClasses] = createSignal(new CssClasses());
  const [getExpandedCssClasses, setExpandedCssClasses] = createSignal(new CssClasses('ag-hidden'));
  const [getContractedCssClasses, setContractedCssClasses] = createSignal(new CssClasses('ag-hidden'));
  const [getCheckboxCssClasses, setCheckboxCssClasses] = createSignal(new CssClasses('ag-invisible'));
  props.ref(() => ({
    // force new instance when grid tries to refresh
    refresh() {
      return false;
    }

  }));
  onMount(() => {
    const compProxy = {
      setInnerRenderer: (details, valueToDisplay) => {
        setInnerCompDetails(details);

        const escapedValue = _.escapeString(valueToDisplay, true);

        setValue(escapedValue);
      },
      setChildCount: count => setChildCount(count),
      addOrRemoveCssClass: (name, on) => setCssClasses(getCssClasses().setClass(name, on)),
      setContractedDisplayed: displayed => setContractedCssClasses(getContractedCssClasses().setClass('ag-hidden', !displayed)),
      setExpandedDisplayed: displayed => setExpandedCssClasses(getExpandedCssClasses().setClass('ag-hidden', !displayed)),
      setCheckboxVisible: visible => setCheckboxCssClasses(getCheckboxCssClasses().setClass('ag-invisible', !visible))
    };
    const ctrl = context.createBean(new GroupCellRendererCtrl());
    ctrl.init(compProxy, eGui, eCheckboxRef, eExpandedRef, eContractedRef, GroupCellRenderer, props);
    return () => {
      context.destroyBean(ctrl);
    };
  });
  const getClassName = createMemo(() => `ag-cell-wrapper ${getCssClasses().toString()}`);
  const getExpandedClassName = createMemo(() => `ag-group-expanded ${getExpandedCssClasses().toString()}`);
  const getContractedClassName = createMemo(() => `ag-group-contracted ${getContractedCssClasses().toString()}`);
  const getCheckboxClassName = createMemo(() => `ag-group-checkbox ${getCheckboxCssClasses().toString()}`);

  const isShowUserComp = () => getInnerCompDetails() != null;

  const isShowValue = () => getInnerCompDetails() == null && getValue() != null;

  return (() => {
    const _el$ = _tmpl$$e.cloneNode(true),
          _el$2 = _el$.firstChild,
          _el$3 = _el$2.nextSibling,
          _el$4 = _el$3.nextSibling,
          _el$5 = _el$4.nextSibling,
          _el$6 = _el$5.nextSibling;

    const _ref$ = eGui;
    typeof _ref$ === "function" ? use(_ref$, _el$) : eGui = _el$;

    spread(_el$, () => !props.colDef ? {
      role: 'gridcell'
    } : {}, false, true);

    const _ref$2 = eExpandedRef;
    typeof _ref$2 === "function" ? use(_ref$2, _el$2) : eExpandedRef = _el$2;
    const _ref$3 = eContractedRef;
    typeof _ref$3 === "function" ? use(_ref$3, _el$3) : eContractedRef = _el$3;
    const _ref$4 = eCheckboxRef;
    typeof _ref$4 === "function" ? use(_ref$4, _el$4) : eCheckboxRef = _el$4;
    const _ref$5 = eValueRef;
    typeof _ref$5 === "function" ? use(_ref$5, _el$5) : eValueRef = _el$5;

    insert(_el$5, (() => {
      const _c$ = memo(() => !!isShowUserComp(), true);

      return () => _c$() && createComponent(UserComp, {
        get compDetails() {
          return getInnerCompDetails();
        }

      });
    })(), null);

    insert(_el$5, (() => {
      const _c$2 = memo(() => !!isShowValue(), true);

      return () => _c$2() && memo(getValue);
    })(), null);

    insert(_el$6, getChildCount);

    effect(_p$ => {
      const _v$ = getClassName(),
            _v$2 = getExpandedClassName(),
            _v$3 = getContractedClassName(),
            _v$4 = getCheckboxClassName();

      _v$ !== _p$._v$ && className(_el$, _p$._v$ = _v$);
      _v$2 !== _p$._v$2 && className(_el$2, _p$._v$2 = _v$2);
      _v$3 !== _p$._v$3 && className(_el$3, _p$._v$3 = _v$3);
      _v$4 !== _p$._v$4 && className(_el$4, _p$._v$4 = _v$4);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined,
      _v$3: undefined,
      _v$4: undefined
    });

    return _el$;
  })();
}; // we do not memo() here, as it would stop the forwardRef working

class SolidFrameworkOverrides extends VanillaFrameworkOverrides {
  constructor() {
    super();

    _defineProperty(this, "frameworkComponents", {
      agGroupCellRenderer: GroupCellRenderer,
      agGroupRowRenderer: GroupCellRenderer,
      agDetailCellRenderer: DetailCellRenderer
    });
  }

  frameworkComponent(name) {
    return this.frameworkComponents[name];
  }

  isFrameworkComponent(comp) {
    if (!comp) {
      return false;
    }

    const prototype = comp.prototype;
    const isJsComp = prototype && 'getGui' in prototype;
    return !isJsComp;
  }

}

const _tmpl$$d = /*#__PURE__*/template(`<div class="ag-header-cell" role="columnheader" tabindex="-1"><div class="ag-header-cell-resize" role="presentation"></div><div class="ag-header-cell-comp-wrapper" role="presentation"></div></div>`, 6);

const HeaderCellComp = props => {
  const [getWidth, setWidth] = createSignal();
  const [getTitle, setTitle] = createSignal();
  const [getColId, setColId] = createSignal();
  const [getAriaSort, setAriaSort] = createSignal();
  const [getAriaDescription, setAriaDescription] = createSignal();
  const [getUserCompDetails, setUserCompDetails] = createSignal();
  let eGui;
  let eResize;
  let eHeaderCompWrapper;
  let userComp;

  const setRef = ref => {
    userComp = ref;
  };

  const {
    ctrl
  } = props;
  const cssClassManager = new CssClassManager(() => eGui);
  onMount(() => {
    const compProxy = {
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
  const style$1 = createMemo(() => ({
    width: getWidth()
  }));
  createMemo(() => {
    const details = getUserCompDetails();

    if (!details) {
      return false;
    }

    return details.componentFromFramework;
  });
  createMemo(() => {
    const details = getUserCompDetails();

    if (!details) {
      return false;
    }

    return !details.componentFromFramework;
  });
  return (() => {
    const _el$ = _tmpl$$d.cloneNode(true),
          _el$2 = _el$.firstChild,
          _el$3 = _el$2.nextSibling;

    const _ref$ = eGui;
    typeof _ref$ === "function" ? use(_ref$, _el$) : eGui = _el$;
    const _ref$2 = eResize;
    typeof _ref$2 === "function" ? use(_ref$2, _el$2) : eResize = _el$2;
    const _ref$3 = eHeaderCompWrapper;
    typeof _ref$3 === "function" ? use(_ref$3, _el$3) : eHeaderCompWrapper = _el$3;

    insert(_el$3, (() => {
      const _c$ = memo(() => !!getUserCompDetails(), true);

      return () => _c$() && createComponent(UserComp, {
        get compDetails() {
          return getUserCompDetails();
        },

        ref: setRef
      });
    })());

    effect(_p$ => {
      const _v$ = style$1(),
            _v$2 = getTitle(),
            _v$3 = getColId(),
            _v$4 = getAriaSort(),
            _v$5 = getAriaDescription();

      _p$._v$ = style(_el$, _v$, _p$._v$);
      _v$2 !== _p$._v$2 && setAttribute(_el$, "title", _p$._v$2 = _v$2);
      _v$3 !== _p$._v$3 && setAttribute(_el$, "col-id", _p$._v$3 = _v$3);
      _v$4 !== _p$._v$4 && setAttribute(_el$, "aria-sort", _p$._v$4 = _v$4);
      _v$5 !== _p$._v$5 && setAttribute(_el$, "aria-description", _p$._v$5 = _v$5);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined,
      _v$3: undefined,
      _v$4: undefined,
      _v$5: undefined
    });

    return _el$;
  })();
};

const _tmpl$$c = /*#__PURE__*/template(`<div role="gridcell" tabindex="-1"><div role="presentation"></div><div role="presentation"><button type="button" aria-label="Open Filter Menu" class="ag-floating-filter-button-button" tabindex="-1"></button></div></div>`, 8);

const HeaderFilterCellComp = props => {
  const [getCssClasses, setCssClasses] = createSignal(new CssClasses());
  const [getCssBodyClasses, setBodyCssClasses] = createSignal(new CssClasses());
  const [getCssButtonWrapperClasses, setButtonWrapperCssClasses] = createSignal(new CssClasses());
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

  const setRef = value => {
    // i don't know why, but react was calling this method multiple
    // times, thus un-setting, them immediately setting the reference again.
    // because we are resolving a promise, it's not good to be resolving
    // the promise multiple times, so we only resolve the first time.
    if (alreadyResolved) {
      return;
    } // we also skip when it's un-setting


    if (value == null) {
      return;
    }

    userCompResolve && userCompResolve(value);
    alreadyResolved = true;
  };

  const {
    ctrl
  } = props;
  onMount(() => {
    const compProxy = {
      addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
      addOrRemoveBodyCssClass: (name, on) => setBodyCssClasses(prev => prev.setClass(name, on)),
      addOrRemoveButtonWrapperCssClass: (name, on) => setButtonWrapperCssClasses(prev => prev.setClass(name, on)),
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
  return (() => {
    const _el$ = _tmpl$$c.cloneNode(true),
          _el$2 = _el$.firstChild,
          _el$3 = _el$2.nextSibling,
          _el$4 = _el$3.firstChild;

    const _ref$ = eGui;
    typeof _ref$ === "function" ? use(_ref$, _el$) : eGui = _el$;
    const _ref$2 = eFloatingFilterBody;
    typeof _ref$2 === "function" ? use(_ref$2, _el$2) : eFloatingFilterBody = _el$2;

    insert(_el$2, (() => {
      const _c$ = memo(() => !!getUserCompDetails(), true);

      return () => _c$() && createComponent(UserComp, {
        get compDetails() {
          return getUserCompDetails();
        },

        ref: setRef
      });
    })());

    const _ref$3 = eButtonWrapper;
    typeof _ref$3 === "function" ? use(_ref$3, _el$3) : eButtonWrapper = _el$3;
    const _ref$4 = eButtonShowMainFilter;
    typeof _ref$4 === "function" ? use(_ref$4, _el$4) : eButtonShowMainFilter = _el$4;

    effect(_p$ => {
      const _v$ = getCssClassesString(),
            _v$2 = getStyle(),
            _v$3 = getBodyCssClassesString(),
            _v$4 = getButtonWrapperCssClassesString();

      _v$ !== _p$._v$ && className(_el$, _p$._v$ = _v$);
      _p$._v$2 = style(_el$, _v$2, _p$._v$2);
      _v$3 !== _p$._v$3 && className(_el$2, _p$._v$3 = _v$3);
      _v$4 !== _p$._v$4 && className(_el$3, _p$._v$4 = _v$4);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined,
      _v$3: undefined,
      _v$4: undefined
    });

    return _el$;
  })();
};

const _tmpl$$b = /*#__PURE__*/template(`<div role="columnheader" tabindex="-1"><div></div></div>`, 4);

const HeaderGroupCellComp = props => {
  const [getCssClasses, setCssClasses] = createSignal(new CssClasses());
  const [getCssResizableClasses, setResizableCssClasses] = createSignal(new CssClasses());
  const [getWidth, setWidth] = createSignal();
  const [getTitle, setTitle] = createSignal();
  const [getColId, setColId] = createSignal();
  const [getAriaExpanded, setAriaExpanded] = createSignal();
  const [getUserCompDetails, setUserCompDetails] = createSignal();
  let eGui;
  let eResize;
  const {
    ctrl
  } = props;
  onMount(() => {
    const compProxy = {
      setWidth: width => setWidth(width),
      addOrRemoveCssClass: (name, on) => setCssClasses(getCssClasses().setClass(name, on)),
      setColId: id => setColId(id),
      setTitle: title => setTitle(title),
      setUserCompDetails: compDetails => setUserCompDetails(compDetails),
      addOrRemoveResizableCssClass: (name, on) => setResizableCssClasses(prev => prev.setClass(name, on)),
      setAriaExpanded: expanded => setAriaExpanded(expanded)
    };
    ctrl.setComp(compProxy, eGui, eResize);
  }); // add drag handling, must be done after component is added to the dom

  createEffect(() => {
    const userCompDetails = getUserCompDetails();

    if (userCompDetails == null) {
      return;
    }

    let userCompDomElement = undefined;
    eGui.childNodes.forEach(node => {
      if (node != null && node !== eResize) {
        userCompDomElement = node;
      }
    });
    userCompDomElement && ctrl.setDragSource(userCompDomElement);
  });
  const style$1 = createMemo(() => ({
    width: getWidth()
  }));
  const getClassName = createMemo(() => 'ag-header-group-cell ' + getCssClasses().toString());
  const getResizableClassName = createMemo(() => 'ag-header-cell-resize ' + getCssResizableClasses().toString());
  return (() => {
    const _el$ = _tmpl$$b.cloneNode(true),
          _el$2 = _el$.firstChild;

    const _ref$ = eGui;
    typeof _ref$ === "function" ? use(_ref$, _el$) : eGui = _el$;

    insert(_el$, (() => {
      const _c$ = memo(() => !!getUserCompDetails(), true);

      return () => _c$() && createComponent(UserComp, {
        get compDetails() {
          return getUserCompDetails();
        }

      });
    })(), _el$2);

    const _ref$2 = eResize;
    typeof _ref$2 === "function" ? use(_ref$2, _el$2) : eResize = _el$2;

    effect(_p$ => {
      const _v$ = getClassName(),
            _v$2 = style$1(),
            _v$3 = getTitle(),
            _v$4 = getColId(),
            _v$5 = getAriaExpanded(),
            _v$6 = getResizableClassName();

      _v$ !== _p$._v$ && className(_el$, _p$._v$ = _v$);
      _p$._v$2 = style(_el$, _v$2, _p$._v$2);
      _v$3 !== _p$._v$3 && setAttribute(_el$, "title", _p$._v$3 = _v$3);
      _v$4 !== _p$._v$4 && setAttribute(_el$, "col-id", _p$._v$4 = _v$4);
      _v$5 !== _p$._v$5 && setAttribute(_el$, "aria-expanded", _p$._v$5 = _v$5);
      _v$6 !== _p$._v$6 && className(_el$2, _p$._v$6 = _v$6);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined,
      _v$3: undefined,
      _v$4: undefined,
      _v$5: undefined,
      _v$6: undefined
    });

    return _el$;
  })();
};

const _tmpl$$a = /*#__PURE__*/template(`<div role="row"></div>`, 2);

const HeaderRowComp = props => {
  const {
    gridOptionsWrapper
  } = useContext(BeansContext);
  const [getTransform, setTransform] = createSignal();
  const [getHeight, setHeight] = createSignal();
  const [getTop, setTop] = createSignal();
  const [getWidth, setWidth] = createSignal();
  const [getAriaRowIndex, setAriaRowIndex] = createSignal();
  const [getCellCtrls, setCellCtrls] = createSignal([]);
  let eGui;
  const {
    ctrl
  } = props;
  const typeColumn = ctrl.getType() === HeaderRowType.COLUMN;
  const typeGroup = ctrl.getType() === HeaderRowType.COLUMN_GROUP;
  const typeFilter = ctrl.getType() === HeaderRowType.FLOATING_FILTER;

  const setCellCtrlsMaintainOrder = next => {
    const prev = getCellCtrls(); // if we are ensuring dom order, we set the ctrls into the dom in the same order they appear on screen

    if (gridOptionsWrapper.isEnsureDomOrder()) {
      return next;
    } // if not maintaining order, we want to keep the dom elements we have and add new ones to the end,
    // otherwise we will loose transition effects as elements are placed in different dom locations


    const prevMap = _.mapById(prev, c => c.getInstanceId());

    const nextMap = _.mapById(next, c => c.getInstanceId());

    const oldCtrlsWeAreKeeping = prev.filter(c => nextMap.has(c.getInstanceId()));
    const newCtrls = next.filter(c => !prevMap.has(c.getInstanceId()));
    const nextOrderMaintained = [...oldCtrlsWeAreKeeping, ...newCtrls];
    setCellCtrls(nextOrderMaintained);
  };

  onMount(() => {
    const compProxy = {
      setTransform: transform => setTransform(transform),
      setHeight: height => setHeight(height),
      setTop: top => setTop(top),
      setHeaderCtrls: ctrls => setCellCtrlsMaintainOrder(ctrls),
      setWidth: width => setWidth(width),
      setAriaRowIndex: rowIndex => setAriaRowIndex(rowIndex)
    };
    ctrl.setComp(compProxy);
  });
  const style$1 = createMemo(() => ({
    transform: getTransform(),
    height: getHeight(),
    top: getTop(),
    width: getWidth()
  }));
  const cssClassesList = [`ag-header-row`];
  typeColumn && cssClassesList.push(`ag-header-row-column`);
  typeGroup && cssClassesList.push(`ag-header-row-column-group`);
  typeFilter && cssClassesList.push(`ag-header-row-column-filter`);
  const cssClasses = cssClassesList.join(' ');

  const createCellJsx = cellCtrl => {
    switch (ctrl.getType()) {
      case HeaderRowType.COLUMN_GROUP:
        return createComponent(HeaderGroupCellComp, {
          ctrl: cellCtrl
        });

      case HeaderRowType.FLOATING_FILTER:
        return createComponent(HeaderFilterCellComp, {
          ctrl: cellCtrl
        });

      default:
        return createComponent(HeaderCellComp, {
          ctrl: cellCtrl
        });
    }
  }; // below, we are not doing floating filters, not yet


  return (() => {
    const _el$ = _tmpl$$a.cloneNode(true);

    const _ref$ = eGui;
    typeof _ref$ === "function" ? use(_ref$, _el$) : eGui = _el$;

    className(_el$, cssClasses);

    insert(_el$, createComponent(For, {
      get each() {
        return getCellCtrls();
      },

      children: (cellCtrl, i) => createCellJsx(cellCtrl)
    }));

    effect(_p$ => {
      const _v$ = style$1(),
            _v$2 = getAriaRowIndex();

      _p$._v$ = style(_el$, _v$, _p$._v$);
      _v$2 !== _p$._v$2 && setAttribute(_el$, "aria-rowindex", _p$._v$2 = _v$2);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined
    });

    return _el$;
  })();
};

const _tmpl$$9 = /*#__PURE__*/template(`<div role="presentation"></div>`, 2),
      _tmpl$2$3 = /*#__PURE__*/template(`<div role="presentation"><div class="ag-header-container" role="rowgroup"></div></div>`, 4);

const HeaderRowContainerComp = props => {
  const [getCssClasses, setCssClasses] = createSignal(new CssClasses());
  const [getCenterContainerWidth, setCenterContainerWidth] = createSignal();
  const [getCenterContainerTransform, setCenterContainerTransform] = createSignal();
  const [getPinnedContainerWidth, setPinnedContainerWidth] = createSignal();
  const [getHeaderRowCtrls, setHeaderRowCtrls] = createSignal([]);
  const {
    context
  } = useContext(BeansContext);
  let eGui;
  const pinnedLeft = props.pinned === Constants.PINNED_LEFT;
  const pinnedRight = props.pinned === Constants.PINNED_RIGHT;
  const centre = !pinnedLeft && !pinnedRight;
  const destroyFuncs = [];
  onCleanup(() => {
    destroyFuncs.forEach(f => f());
    destroyFuncs.length = 0;
  });
  onMount(() => {
    const compProxy = {
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
    destroyFuncs.push(() => context.destroyBean(ctrl));
  });
  const getClassName = createMemo(() => getCssClasses.toString());

  const insertRowsJsx = () => createComponent(For, {
    get each() {
      return getHeaderRowCtrls();
    },

    children: ctrl => createComponent(HeaderRowComp, {
      ctrl: ctrl
    })
  });

  const eCenterContainerStyle = createMemo(() => ({
    width: getCenterContainerWidth(),
    transform: getCenterContainerTransform()
  }));
  const ePinnedStyle = createMemo(() => ({
    width: getPinnedContainerWidth(),
    'min-width': getPinnedContainerWidth(),
    'max-width': getPinnedContainerWidth()
  }));
  return [pinnedLeft && (() => {
    const _el$ = _tmpl$$9.cloneNode(true);

    const _ref$ = eGui;
    typeof _ref$ === "function" ? use(_ref$, _el$) : eGui = _el$;

    insert(_el$, insertRowsJsx);

    effect(_p$ => {
      const _v$ = "ag-pinned-left-header " + getClassName(),
            _v$2 = ePinnedStyle();

      _v$ !== _p$._v$ && className(_el$, _p$._v$ = _v$);
      _p$._v$2 = style(_el$, _v$2, _p$._v$2);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined
    });

    return _el$;
  })(), pinnedRight && (() => {
    const _el$2 = _tmpl$$9.cloneNode(true);

    const _ref$2 = eGui;
    typeof _ref$2 === "function" ? use(_ref$2, _el$2) : eGui = _el$2;

    insert(_el$2, insertRowsJsx);

    effect(_p$ => {
      const _v$3 = "ag-pinned-right-header " + getClassName(),
            _v$4 = ePinnedStyle();

      _v$3 !== _p$._v$3 && className(_el$2, _p$._v$3 = _v$3);
      _p$._v$4 = style(_el$2, _v$4, _p$._v$4);
      return _p$;
    }, {
      _v$3: undefined,
      _v$4: undefined
    });

    return _el$2;
  })(), centre && (() => {
    const _el$3 = _tmpl$2$3.cloneNode(true),
          _el$4 = _el$3.firstChild;

    const _ref$3 = eGui;
    typeof _ref$3 === "function" ? use(_ref$3, _el$3) : eGui = _el$3;

    insert(_el$4, insertRowsJsx);

    effect(_p$ => {
      const _v$5 = "ag-header-viewport " + getClassName(),
            _v$6 = eCenterContainerStyle();

      _v$5 !== _p$._v$5 && className(_el$3, _p$._v$5 = _v$5);
      _p$._v$6 = style(_el$4, _v$6, _p$._v$6);
      return _p$;
    }, {
      _v$5: undefined,
      _v$6: undefined
    });

    return _el$3;
  })()];
};

const _tmpl$$8 = /*#__PURE__*/template(`<div role="presentation"></div>`, 2);

const GridHeaderComp = () => {
  const [getCssClasses, setCssClasses] = createSignal(new CssClasses());
  const [getHeight, setHeight] = createSignal();
  const {
    context
  } = useContext(BeansContext);
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
  const className$1 = createMemo(() => {
    let res = getCssClasses().toString();
    return 'ag-header ' + res;
  });
  const style$1 = createMemo(() => ({
    height: getHeight(),
    'min-height': getHeight()
  }));
  return (() => {
    const _el$ = _tmpl$$8.cloneNode(true);

    const _ref$ = eGui;
    typeof _ref$ === "function" ? use(_ref$, _el$) : eGui = _el$;

    insert(_el$, createComponent(HeaderRowContainerComp, {
      get pinned() {
        return Constants.PINNED_LEFT;
      }

    }), null);

    insert(_el$, createComponent(HeaderRowContainerComp, {
      pinned: null
    }), null);

    insert(_el$, createComponent(HeaderRowContainerComp, {
      get pinned() {
        return Constants.PINNED_RIGHT;
      }

    }), null);

    effect(_p$ => {
      const _v$ = className$1(),
            _v$2 = style$1();

      _v$ !== _p$._v$ && className(_el$, _p$._v$ = _v$);
      _p$._v$2 = style(_el$, _v$2, _p$._v$2);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined
    });

    return _el$;
  })();
};

const PopupEditorComp = props => {
  const {
    context,
    popupService,
    gridOptionsWrapper
  } = useContext(BeansContext);
  const {
    editDetails,
    cellCtrl,
    eParentCell
  } = props;
  const {
    compDetails
  } = editDetails;
  const useModelPopup = gridOptionsWrapper.isStopEditingWhenCellsLoseFocus();
  const wrapper = context.createBean(new PopupEditorWrapper(compDetails.params));
  const ePopupGui = wrapper.getGui();
  const positionParams = {
    column: cellCtrl.getColumn(),
    rowNode: cellCtrl.getRowNode(),
    type: 'popupCellEditor',
    eventSource: eParentCell,
    ePopup: ePopupGui,
    keepWithinBounds: true
  };
  const positionCallback = editDetails.popupPosition === 'under' ? popupService.positionPopupUnderComponent.bind(popupService, positionParams) : popupService.positionPopupOverComponent.bind(popupService, positionParams);
  const translate = gridOptionsWrapper.getLocaleTextFunc();
  const addPopupRes = popupService.addPopup({
    modal: useModelPopup,
    eChild: ePopupGui,
    closeOnEsc: true,
    closedCallback: () => {
      cellCtrl.onPopupEditorClosed();
    },
    anchorToElement: eParentCell,
    positionCallback,
    ariaLabel: translate('ariaLabelCellEditor', 'Cell Editor')
  });
  const hideEditorPopup = addPopupRes ? addPopupRes.hideFunc : undefined;
  onCleanup(() => {
    if (hideEditorPopup != null) {
      hideEditorPopup();
    }

    context.destroyBean(wrapper);
  });
  return createComponent(Portal, {
    mount: ePopupGui,

    get children() {
      return props.children;
    }

  });
};

const ShowEditDetails = props => {
  const getCompDetails = createMemo(() => props.editDetails.compDetails);
  const compDetails = props.editDetails.compDetails; // when editing, we must have a comp, otherwise doesn't work

  if (!compDetails) {
    return [];
  }

  const inPopup = props.editDetails.popup;
  const eGui = props.eGuiFn();
  return [inPopup && createComponent(PopupEditorComp, {
    get cellCtrl() {
      return props.cellCtrl;
    },

    eParentCell: eGui,

    get editDetails() {
      return props.editDetails;
    },

    get children() {
      return createComponent(UserComp, {
        get compDetails() {
          return getCompDetails();
        },

        ref(r$) {
          const _ref$ = props.setPopupRef;
          typeof _ref$ === "function" ? _ref$(r$) : props.setPopupRef = r$;
        }

      });
    }

  }), !inPopup && createComponent(UserComp, {
    get compDetails() {
      return getCompDetails();
    },

    ref(r$) {
      const _ref$2 = props.setInlineRef;
      typeof _ref$2 === "function" ? _ref$2(r$) : props.setInlineRef = r$;
    }

  })];
};

const _tmpl$$7 = /*#__PURE__*/template(`<span role="presentation" class="ag-cell-value"></span>`, 2);

const ToolsComp = props => {
  const {
    context
  } = useContext(BeansContext);

  const CompWrapper = innerProps => {
    const comp = innerProps.createFn();

    if (!comp) {
      return [];
    }

    onCleanup(() => context.destroyBean(comp));
    return memo(() => comp.getGui());
  };

  return [memo((() => {
    const _c$ = memo(() => !!props.includeSelection, true);

    return () => _c$() && createComponent(CompWrapper, {
      createFn: () => props.cellCtrl.createSelectionCheckbox()
    });
  })()), memo((() => {
    const _c$2 = memo(() => !!props.includeDndSource, true);

    return () => _c$2() && createComponent(CompWrapper, {
      createFn: () => props.cellCtrl.createDndSource()
    });
  })()), memo((() => {
    const _c$3 = memo(() => !!props.includeRowDrag, true);

    return () => _c$3() && createComponent(CompWrapper, {
      createFn: () => props.cellCtrl.createRowDragComp()
    });
  })())];
};

const ShowRenderDetails = props => {
  const getCompDetails = createMemo(() => props.showDetails.compDetails);
  const isNoCompDetails = createMemo(() => props.showDetails.compDetails == null); // if we didn't do this, objects would cause error. we depend on objects for things
  // like the aggregation functions avg and count, which return objects and depend on toString()
  // getting called.

  const valueForNoCellRenderer = () => {
    const value = props.showDetails.value;
    return value && value.toString ? value.toString() : value;
  };

  const bodyJsxFunc = () => [memo((() => {
    const _c$4 = memo(() => !!isNoCompDetails(), true);

    return () => _c$4() && memo(valueForNoCellRenderer);
  })()), memo((() => {
    const _c$5 = memo(() => !!getCompDetails(), true);

    return () => _c$5() && createComponent(UserComp, {
      get compDetails() {
        return getCompDetails();
      },

      ref(r$) {
        const _ref$ = props.ref;
        typeof _ref$ === "function" ? _ref$(r$) : props.ref = r$;
      }

    });
  })())];

  return [memo((() => {
    const _c$6 = memo(() => !!props.showTools, true);

    return () => _c$6() && createComponent(ToolsComp, {
      get includeDndSource() {
        return props.includeDndSource;
      },

      get includeRowDrag() {
        return props.includeRowDrag;
      },

      get includeSelection() {
        return props.includeSelection;
      },

      get cellCtrl() {
        return props.cellCtrl;
      }

    });
  })()), memo((() => {
    const _c$7 = memo(() => !!props.showCellWrapper, true);

    return () => _c$7() ? (() => {
      const _el$ = _tmpl$$7.cloneNode(true);

      const _ref$2 = props.setECellValue;
      typeof _ref$2 === "function" ? use(_ref$2, _el$) : props.setECellValue = _el$;

      insert(_el$, bodyJsxFunc);

      effect(() => setAttribute(_el$, "id", `cell-${props.cellInstanceId}`));

      return _el$;
    })() : bodyJsxFunc();
  })())];
};

const _tmpl$$6 = /*#__PURE__*/template(`<div> </div>`, 2),
      _tmpl$2$2 = /*#__PURE__*/template(`<div class="ag-cell-wrapper" role="presentation"></div>`, 2);

const checkCellEditorDeprecations = (popup, cellEditor, cellCtrl) => {
  const col = cellCtrl.getColumn(); // cellEditor is written to be a popup editor, however colDef.cellEditorPopup is not set

  if (!popup && cellEditor.isPopup && cellEditor.isPopup()) {
    const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using SolidJS, specify an editor is a popup using colDef.cellEditorPopup=true. AG Grid SolidJS cannot depend on the editor component specifying if it's in a popup (via the isPopup() method on the editor), as SolidJS needs to know this information BEFORE the component is created.`;

    _.doOnce(() => console.warn(msg), 'jsEditorComp-isPopup-' + cellCtrl.getColumn().getColId());
  } // cellEditor is a popup and is trying to position itself the deprecated way


  if (popup && cellEditor.getPopupPosition && cellEditor.getPopupPosition() != null) {
    const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using SolidJS, specify an editor popup position using colDef.cellEditorPopupPosition=true. AG Grid SolidJS cannot depend on the editor component specifying it's position (via the getPopupPosition() method on the editor), as SolidJS needs to know this information BEFORE the component is created.`;

    _.doOnce(() => console.warn(msg), 'jsEditorComp-getPopupPosition-' + cellCtrl.getColumn().getColId());
  }
};

const CellComp = props => {
  const {
    cellCtrl,
    printLayout,
    editingRow
  } = props;
  const [renderDetails, setRenderDetails] = createSignal();
  const [editDetails, setEditDetails] = createSignal();
  let renderCompVersion = 0;
  const [renderCompVersionList, setRenderCompVersionList] = createSignal([renderCompVersion]);
  const [userStyles, setUserStyles] = createSignal();
  const [tabIndex, setTabIndex] = createSignal();
  const [role, setRole] = createSignal();
  const [colId, setColId] = createSignal();
  const [title, setTitle] = createSignal();
  const [includeSelection, setIncludeSelection] = createSignal(false);
  const [includeRowDrag, setIncludeRowDrag] = createSignal(false);
  const [includeDndSource, setIncludeDndSource] = createSignal(false);
  const forceWrapper = cellCtrl.isForceWrapper();
  let eCellWrapper;
  let eCellValue;

  const setECellValue = val => {
    eCellValue = val;
  };

  let eGui;
  let cellRenderer = null;
  let cellEditor = null;

  const setEditorRef = (popup, ref) => {
    cellEditor = ref;

    if (!cellEditor) {
      return;
    }

    checkCellEditorDeprecations(popup, cellEditor, cellCtrl);
    const editingCancelledByUserComp = cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart();

    if (editingCancelledByUserComp) {
      // we cannot set state inside render, so hack is to do it in next VM turn
      setTimeout(() => cellCtrl.stopEditing(), 0);
    }

    const refAny = ref;

    if (refAny.afterGuiAttached) {
      setTimeout(() => refAny.afterGuiAttached(), 0);
    }
  };

  const setPopupEditorRef = ref => setEditorRef(true, ref);

  const setInlineEditorRef = ref => setEditorRef(false, ref);

  const cssClassManager = new CssClassManager(() => eGui);
  const showTools = createMemo(() => renderDetails() != null && (includeSelection() || includeDndSource() || includeRowDrag()));
  const showCellWrapper = createMemo(() => forceWrapper || showTools());
  const cellInstanceId = cellCtrl.getInstanceId();
  const ariaDescribedBy = createMemo(() => showCellWrapper() ? `cell-${cellInstanceId}` : undefined);
  onMount(() => {
    if (!cellCtrl) {
      return;
    }

    const compProxy = {
      addOrRemoveCssClass: (name, on) => cssClassManager.addOrRemoveCssClass(name, on),
      setUserStyles: styles => setUserStyles(styles),
      getFocusableElement: () => eGui,
      setTabIndex: tabIndex => setTabIndex(tabIndex),
      setRole: role => setRole(role),
      setColId: colId => setColId(colId),
      setTitle: title => setTitle(title),
      setIncludeSelection: include => setIncludeSelection(include),
      setIncludeRowDrag: include => setIncludeRowDrag(include),
      setIncludeDndSource: include => setIncludeDndSource(include),
      getCellEditor: () => cellEditor,
      getCellRenderer: () => cellRenderer ? cellRenderer : null,
      getParentOfValue: () => eCellValue ? eCellValue : eCellWrapper ? eCellWrapper : eGui,
      setRenderDetails: (compDetails, value, force) => {
        setRenderDetails({
          value,
          compDetails,
          force
        });
      },
      setEditDetails: (compDetails, popup, popupPosition) => {
        if (compDetails) {
          // start editing
          setEditDetails({
            compDetails: compDetails,
            popup,
            popupPosition
          });

          if (!popup) {
            setRenderDetails(undefined);
          }
        } else {
          // stop editing
          setEditDetails(undefined);
        }
      }
    };
    cellCtrl.setComp(compProxy, eGui, eCellWrapper, printLayout, editingRow);
  });
  createEffect(() => {
    cssClassManager.addOrRemoveCssClass('ag-cell-value', !showCellWrapper());
  }); // we only do refreshing for JS Comps. for SolidJS, the props will change for the cell renderer.

  let readyForRefresh = false;
  createEffect(() => {
    const details = renderDetails();
    const isJsCellRenderer = details != null && details.compDetails != null && !details.compDetails.componentFromFramework;

    if (!isJsCellRenderer) {
      readyForRefresh = false;
      return;
    }

    if (!readyForRefresh) {
      readyForRefresh = true;
      return;
    }

    if (!cellRenderer) {
      return;
    }

    const params = details.compDetails.params;
    const result = cellRenderer.refresh ? cellRenderer.refresh(params) : false;

    if (result != true) {
      // increasing the render key forces a new instance of ShowRenderDetails,
      // as we iteration through renderCompVersion, if the contents of
      // renderCompVersion changes, that maps to a new ShowRenderDetails instance.
      renderCompVersion++;
      setRenderCompVersionList([renderCompVersion]);
    }
  }); // we pass in eGui as a function below as eGui is not ready
  // when the template is built, only after it. so we defer
  // reading eGui variable until it's needed, after ShowEditDetails
  // is created.

  const eGuiFn = () => eGui;

  const bodyJsxFunc = () => [createComponent(For, {
    get each() {
      return renderCompVersionList();
    },

    children: () => memo((() => {
      const _c$2 = memo(() => !!renderDetails(), true);

      return () => _c$2() && createComponent(ShowRenderDetails, {
        get showDetails() {
          return renderDetails();
        },

        ref(r$) {
          const _ref$ = cellRenderer;
          typeof _ref$ === "function" ? _ref$(r$) : cellRenderer = r$;
        },

        cellInstanceId: cellInstanceId,

        get showCellWrapper() {
          return showCellWrapper();
        },

        cellCtrl: cellCtrl,

        get includeDndSource() {
          return includeDndSource();
        },

        get includeRowDrag() {
          return includeRowDrag();
        },

        get includeSelection() {
          return includeSelection();
        },

        get showTools() {
          return showTools();
        },

        setECellValue: setECellValue
      });
    })())
  }), memo((() => {
    const _c$ = memo(() => !!editDetails(), true);

    return () => _c$() && createComponent(ShowEditDetails, {
      get editDetails() {
        return editDetails();
      },

      cellCtrl: cellCtrl,
      eGuiFn: eGuiFn,
      setInlineRef: setInlineEditorRef,
      setPopupRef: setPopupEditorRef
    });
  })())];

  return (() => {
    const _el$ = _tmpl$$6.cloneNode(true);
          _el$.firstChild;

    const _ref$2 = eGui;
    typeof _ref$2 === "function" ? use(_ref$2, _el$) : eGui = _el$;

    insert(_el$, (() => {
      const _c$3 = memo(() => !!showCellWrapper(), true);

      return () => _c$3() ? (() => {
        const _el$3 = _tmpl$2$2.cloneNode(true);

        const _ref$3 = eCellWrapper;
        typeof _ref$3 === "function" ? use(_ref$3, _el$3) : eCellWrapper = _el$3;

        insert(_el$3, bodyJsxFunc);

        return _el$3;
      })() : bodyJsxFunc();
    })());

    effect(_p$ => {
      const _v$ = userStyles(),
            _v$2 = tabIndex(),
            _v$3 = role(),
            _v$4 = colId(),
            _v$5 = title(),
            _v$6 = ariaDescribedBy();

      _p$._v$ = style(_el$, _v$, _p$._v$);
      _v$2 !== _p$._v$2 && setAttribute(_el$, "tabindex", _p$._v$2 = _v$2);
      _v$3 !== _p$._v$3 && setAttribute(_el$, "role", _p$._v$3 = _v$3);
      _v$4 !== _p$._v$4 && setAttribute(_el$, "col-id", _p$._v$4 = _v$4);
      _v$5 !== _p$._v$5 && setAttribute(_el$, "title", _p$._v$5 = _v$5);
      _v$6 !== _p$._v$6 && setAttribute(_el$, "aria-describedby", _p$._v$6 = _v$6);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined,
      _v$3: undefined,
      _v$4: undefined,
      _v$5: undefined,
      _v$6: undefined
    });

    return _el$;
  })();
};

const _tmpl$$5 = /*#__PURE__*/template(`<div></div>`, 2);

const maintainOrderOnColumns = (prev, next, domOrder) => {
  if (domOrder) {
    const res = {
      list: next,
      instanceIdMap: new Map()
    };
    next.forEach(c => res.instanceIdMap.set(c.getInstanceId(), c));
    return res;
  } // if dom order not important, we don't want to change the order
  // of the elements in the dom, as this would break transition styles


  const oldCellCtrls = [];
  const newCellCtrls = [];
  const newInstanceIdMap = new Map();
  const tempMap = new Map();
  next.forEach(c => tempMap.set(c.getInstanceId(), c));
  prev.list.forEach(c => {
    const instanceId = c.getInstanceId();

    if (tempMap.has(instanceId)) {
      oldCellCtrls.push(c);
      newInstanceIdMap.set(instanceId, c);
    }
  });
  next.forEach(c => {
    const instanceId = c.getInstanceId();

    if (!prev.instanceIdMap.has(instanceId)) {
      newCellCtrls.push(c);
      newInstanceIdMap.set(instanceId, c);
    }
  });
  const res = {
    list: [...oldCellCtrls, ...newCellCtrls],
    instanceIdMap: newInstanceIdMap
  };
  return res;
};

const RowComp = params => {
  const {
    rowCtrl,
    containerType
  } = params;
  const [getRowIndex, setRowIndex] = createSignal();
  const [getRowId, setRowId] = createSignal();
  const [getRole, setRole] = createSignal();
  const [getRowBusinessKey, setRowBusinessKey] = createSignal();
  const [getTabIndex, setTabIndex] = createSignal();
  const [getUserStyles, setUserStyles] = createSignal();
  const [getCellCtrls, setCellCtrls] = createSignal({
    list: [],
    instanceIdMap: new Map()
  });
  const [getFullWidthCompDetails, setFullWidthCompDetails] = createSignal();
  const [getDomOrder, setDomOrder] = createSignal(false); // these styles have initial values, so element is placed into the DOM with them,
  // rather than an transition getting applied.

  const [getTop, setTop] = createSignal(rowCtrl.getInitialRowTop());
  const [getTransform, setTransform] = createSignal(rowCtrl.getInitialTransform());
  let eGui;
  let fullWidthCompRef;

  const setFullWidthRef = newRef => {
    fullWidthCompRef = newRef;
  };

  createEffect(() => {
    const compDetails = getFullWidthCompDetails();

    if (!compDetails) {
      return;
    }

    let tryCount = 0; // puts autoHeight onto full with detail rows. this needs trickery, as we need
    // the HTMLElement for the provided Detail Cell Renderer. this pattern was copied
    // from React, it's possible it's not needed here, however given it's hard to be
    // sure on Solid's async behavious, keeping the patter here.

    const trySetup = () => {
      const eChild = eGui.firstChild;

      if (eChild) {
        rowCtrl.setupDetailRowAutoHeight(eChild);
        return;
      }

      if (tryCount >= 10) {
        return;
      }

      tryCount++;
      setTimeout(trySetup, 0);
    };

    trySetup();
  });
  onMount(() => {
    // because React is asychronous, it's possible the RowCtrl is no longer a valid RowCtrl. This can
    // happen if user calls two API methods one after the other, with the second API invalidating the rows
    // the first call created. Thus the rows for the first call could still get created even though no longer needed.
    if (!rowCtrl.isAlive()) {
      return;
    }

    const cssClassManager = new CssClassManager(() => eGui);
    const compProxy = {
      // the rowTop is managed by state, instead of direct style manipulation by rowCtrl (like all the other styles)
      // as we need to have an initial value when it's placed into he DOM for the first time, for animation to work.
      setTop: value => setTop(value),
      setTransform: value => setTransform(value),
      // i found using React for managing classes at the row level was to slow, as modifying classes caused a lot of
      // React code to execute, so avoiding React for managing CSS Classes made the grid go much faster.
      addOrRemoveCssClass: (name, on) => cssClassManager.addOrRemoveCssClass(name, on),
      setDomOrder: domOrder => setDomOrder(domOrder),
      setRowIndex: value => setRowIndex(value),
      setRowId: value => setRowId(value),
      setRowBusinessKey: value => setRowBusinessKey(value),
      setTabIndex: value => setTabIndex(value),
      setUserStyles: styles => setUserStyles(styles),
      setRole: value => setRole(value),
      // if we don't maintain the order, then cols will be ripped out and into the dom
      // when cols reordered, which would stop the CSS transitions from working
      setCellCtrls: next => setCellCtrls(maintainOrderOnColumns(getCellCtrls(), next, getDomOrder())),
      showFullWidth: compDetails => setFullWidthCompDetails(compDetails),
      getFullWidthCellRenderer: () => fullWidthCompRef
    };
    rowCtrl.setComp(compProxy, eGui, containerType);
  });
  const getRowStyles = createMemo(() => {
    const res = {
      top: getTop(),
      transform: getTransform()
    };
    Object.assign(res, getUserStyles());
    return res;
  });
  const isShowCells = createMemo(() => getCellCtrls() != null);
  const isShowFullWidth = createMemo(() => getFullWidthCompDetails() != null);

  const showCellsJsx = () => createComponent(For, {
    get each() {
      return getCellCtrls().list;
    },

    children: cellCtrl => createComponent(CellComp, {
      cellCtrl: cellCtrl,

      get editingRow() {
        return rowCtrl.isEditing();
      },

      get printLayout() {
        return rowCtrl.isPrintLayout();
      }

    })
  });

  const showFullWidthJsx = () => createComponent(UserComp, {
    get compDetails() {
      return getFullWidthCompDetails();
    },

    ref: setFullWidthRef
  });

  return (() => {
    const _el$ = _tmpl$$5.cloneNode(true);

    const _ref$ = eGui;
    typeof _ref$ === "function" ? use(_ref$, _el$) : eGui = _el$;

    insert(_el$, (() => {
      const _c$ = memo(() => !!isShowFullWidth(), true);

      return () => _c$() && showFullWidthJsx();
    })(), null);

    insert(_el$, (() => {
      const _c$2 = memo(() => !!isShowCells(), true);

      return () => _c$2() && showCellsJsx();
    })(), null);

    effect(_p$ => {
      const _v$ = getRowStyles(),
            _v$2 = getRowIndex(),
            _v$3 = getRowId(),
            _v$4 = getRowBusinessKey(),
            _v$5 = getTabIndex();

      _p$._v$ = style(_el$, _v$, _p$._v$);
      _v$2 !== _p$._v$2 && setAttribute(_el$, "row-index", _p$._v$2 = _v$2);
      _v$3 !== _p$._v$3 && setAttribute(_el$, "row-id", _p$._v$3 = _v$3);
      _v$4 !== _p$._v$4 && setAttribute(_el$, "row-business-key", _p$._v$4 = _v$4);
      _v$5 !== _p$._v$5 && setAttribute(_el$, "tabindex", _p$._v$5 = _v$5);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined,
      _v$3: undefined,
      _v$4: undefined,
      _v$5: undefined
    });

    return _el$;
  })();
};

const _tmpl$$4 = /*#__PURE__*/template(`<div></div>`, 2),
      _tmpl$2$1 = /*#__PURE__*/template(`<div role="presentation"><div role="presentation"></div></div>`, 4),
      _tmpl$3 = /*#__PURE__*/template(`<div role="presentation"></div>`, 2);

const RowContainerComp = props => {
  const {
    context
  } = useContext(BeansContext);
  const [viewportHeight, setViewportHeight] = createSignal('');
  const [rowCtrlsOrdered, setRowCtrlsOrdered] = createSignal([]);
  const [rowCtrls, setRowCtrls] = createSignal([]);
  const [domOrder, setDomOrder] = createSignal(false);
  const [containerWidth, setContainerWidth] = createSignal('');
  const {
    name
  } = props;
  const containerType = createMemo(() => getRowContainerTypeForName(name));
  let eWrapper;
  let eViewport;
  let eContainer;
  const cssClasses = createMemo(() => RowContainerCtrl.getRowContainerCssClasses(name));
  const wrapperClasses = createMemo(() => classesList(cssClasses().wrapper));
  const viewportClasses = createMemo(() => classesList(cssClasses().viewport));
  const containerClasses = createMemo(() => classesList(cssClasses().container)); // no need to useMemo for boolean types

  const template1 = name === RowContainerName.CENTER;
  const template2 = name === RowContainerName.TOP_CENTER || name === RowContainerName.BOTTOM_CENTER || name === RowContainerName.STICKY_TOP_CENTER;
  const template3 = !template1 && !template2; // if domOrder=true, then we just copy rowCtrls into rowCtrlsOrdered observing order,
  // however if false, then we need to keep the order as they are in the dom, otherwise rowAnimation breaks

  let rowCtrlsOrderedCopy = [];
  createEffect(() => {
    if (domOrder()) {
      setRowCtrlsOrdered(rowCtrls());
      return;
    } // if dom order not important, we don't want to change the order
    // of the elements in the dom, as this would break transition styles
    // 
    // we use the rowCtrlsOrderedCopy, to avoid this effect depending on and
    // setting the same value, hence causing an infinite loop


    const prev = rowCtrlsOrderedCopy;
    const oldRows = prev.filter(r => rowCtrls().indexOf(r) >= 0);
    const newRows = rowCtrls().filter(r => oldRows.indexOf(r) < 0);
    const next = [...oldRows, ...newRows];
    setRowCtrlsOrdered(next);
    rowCtrlsOrderedCopy = next;
  });
  onMount(() => {
    const compProxy = {
      setViewportHeight: setViewportHeight,
      setRowCtrls: rowCtrls => setRowCtrls(rowCtrls),
      setDomOrder: domOrder => setDomOrder(domOrder),
      setContainerWidth: width => setContainerWidth(width)
    };
    const ctrl = context.createBean(new RowContainerCtrl(name));
    onCleanup(() => context.destroyBean(ctrl));
    ctrl.setComp(compProxy, eContainer, eViewport, eWrapper);
  });
  const viewportStyle = createMemo(() => ({
    height: viewportHeight()
  }));
  const containerStyle = createMemo(() => ({
    width: containerWidth()
  }));

  const buildContainer = () => (() => {
    const _el$ = _tmpl$$4.cloneNode(true);

    const _ref$ = eContainer;
    typeof _ref$ === "function" ? use(_ref$, _el$) : eContainer = _el$;

    insert(_el$, createComponent(For, {
      get each() {
        return rowCtrlsOrdered();
      },

      children: (rowCtrl, i) => createComponent(RowComp, {
        rowCtrl: rowCtrl,

        get containerType() {
          return containerType();
        }

      })
    }));

    effect(_p$ => {
      const _v$ = containerClasses(),
            _v$2 = rowCtrls().length ? "rowgroup" : "presentation",
            _v$3 = containerStyle();

      _v$ !== _p$._v$ && className(_el$, _p$._v$ = _v$);
      _v$2 !== _p$._v$2 && setAttribute(_el$, "role", _p$._v$2 = _v$2);
      _p$._v$3 = style(_el$, _v$3, _p$._v$3);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined,
      _v$3: undefined
    });

    return _el$;
  })();

  return [template1 && (() => {
    const _el$2 = _tmpl$2$1.cloneNode(true),
          _el$3 = _el$2.firstChild;

    const _ref$2 = eWrapper;
    typeof _ref$2 === "function" ? use(_ref$2, _el$2) : eWrapper = _el$2;
    const _ref$3 = eViewport;
    typeof _ref$3 === "function" ? use(_ref$3, _el$3) : eViewport = _el$3;

    insert(_el$3, buildContainer);

    effect(_p$ => {
      const _v$4 = wrapperClasses(),
            _v$5 = viewportClasses(),
            _v$6 = viewportStyle();

      _v$4 !== _p$._v$4 && className(_el$2, _p$._v$4 = _v$4);
      _v$5 !== _p$._v$5 && className(_el$3, _p$._v$5 = _v$5);
      _p$._v$6 = style(_el$3, _v$6, _p$._v$6);
      return _p$;
    }, {
      _v$4: undefined,
      _v$5: undefined,
      _v$6: undefined
    });

    return _el$2;
  })(), template2 && (() => {
    const _el$4 = _tmpl$3.cloneNode(true);

    const _ref$4 = eViewport;
    typeof _ref$4 === "function" ? use(_ref$4, _el$4) : eViewport = _el$4;

    insert(_el$4, buildContainer);

    effect(_p$ => {
      const _v$7 = viewportClasses(),
            _v$8 = viewportStyle();

      _v$7 !== _p$._v$7 && className(_el$4, _p$._v$7 = _v$7);
      _p$._v$8 = style(_el$4, _v$8, _p$._v$8);
      return _p$;
    }, {
      _v$7: undefined,
      _v$8: undefined
    });

    return _el$4;
  })(), memo(() => template3 && buildContainer())];
};

const _tmpl$$3 = /*#__PURE__*/template(`<div role="grid"><div role="presentation"></div><div role="presentation"></div><div role="presentation"></div><div role="presentation"></div></div>`, 10);

const GridBodyComp = () => {
  const {
    context,
    agStackComponentsRegistry,
    resizeObserverService
  } = useContext(BeansContext);
  const [getRowAnimationClass, setRowAnimationClass] = createSignal('');
  const [getAriaColCount, setAriaColCount] = createSignal(0);
  const [getAriaRowCount, setAriaRowCount] = createSignal(0);
  const [getTopHeight, setTopHeight] = createSignal(0);
  const [getBottomHeight, setBottomHeight] = createSignal(0);
  const [getStickyTopHeight, setStickyTopHeight] = createSignal('0px');
  const [getStickyTopTop, setStickyTopTop] = createSignal('0px');
  const [getStickyTopWidth, setStickyTopWidth] = createSignal('100%');
  const [getTopDisplay, setTopDisplay] = createSignal('');
  const [getBottomDisplay, setBottomDisplay] = createSignal('');
  const [getMovingCss, setMovingCss] = createSignal(null);
  const [getForceVerticalScrollClass, setForceVerticalScrollClass] = createSignal(null);
  const [getTopAndBottomOverflowY, setTopAndBottomOverflowY] = createSignal('');
  const [getCellSelectableCss, setCellSelectableCss] = createSignal(null); // we initialise layoutClass to 'ag-layout-normal', because if we don't, the comp will initially
  // render with no width (as ag-layout-normal sets width to 0, which is needed for flex) which
  // gives the grid a massive width, which then renders a massive amount of columns. this problem
  // is due to React been async, for the non-async version (ie when not using React) this is not a
  // problem as the UI will finish initialising before we set data.

  const [getLayoutClass, setLayoutClass] = createSignal('ag-layout-normal');
  let eRoot;
  let eTop;
  let eStickyTop;
  let eBodyViewport;
  let eBottom;
  const destroyFuncs = [];
  onCleanup(() => {
    destroyFuncs.forEach(f => f());
    destroyFuncs.length = 0;
  });
  onMount(() => {
    if (!context) {
      return;
    }

    const newComp = tag => {
      const CompClass = agStackComponentsRegistry.getComponentClass(tag);
      const comp = context.createBean(new CompClass());
      onCleanup(() => context.destroyBean(comp));
      return comp;
    };

    eRoot.appendChild(newComp('AG-FAKE-HORIZONTAL-SCROLL').getGui());
    eRoot.appendChild(newComp('AG-OVERLAY-WRAPPER').getGui());
    const compProxy = {
      setRowAnimationCssOnBodyViewport: setRowAnimationClass,
      setColumnCount: setAriaColCount,
      setRowCount: setAriaRowCount,
      setTopHeight,
      setBottomHeight,
      setStickyTopHeight,
      setStickyTopTop,
      setStickyTopWidth,
      setTopDisplay,
      setBottomDisplay,
      setColumnMovingCss: setMovingCss,
      updateLayoutClasses: setLayoutClass,
      setAlwaysVerticalScrollClass: setForceVerticalScrollClass,
      setPinnedTopBottomOverflowY: setTopAndBottomOverflowY,
      setCellSelectableCss: setCellSelectableCss,
      registerBodyViewportResizeListener: listener => {
        const unsubscribeFromResize = resizeObserverService.observeResize(eBodyViewport, listener);
        destroyFuncs.push(() => unsubscribeFromResize());
      }
    };
    const ctrl = context.createBean(new GridBodyCtrl());
    onCleanup(() => context.destroyBean(ctrl)); // fixme - should not be in a timeout,
    // was becusae we need GridHeaderComp to be created first

    setTimeout(() => ctrl.setComp(compProxy, eRoot, eBodyViewport, eTop, eBottom, eStickyTop), 0);
  });
  const getRootClasses = createMemo(() => classesList('ag-root', 'ag-unselectable', getMovingCss(), getLayoutClass()));
  const getBodyViewportClasses = createMemo(() => classesList('ag-body-viewport', getRowAnimationClass(), getLayoutClass(), getForceVerticalScrollClass(), getCellSelectableCss()));
  const getTopClasses = createMemo(() => classesList('ag-floating-top', getCellSelectableCss()));
  const getStickyTopClasses = createMemo(() => classesList('ag-sticky-top', getCellSelectableCss()));
  const getBottomClasses = createMemo(() => classesList('ag-floating-bottom', getCellSelectableCss()));
  const getTopStyle = createMemo(() => ({
    height: getTopHeight,
    'min-height': getTopHeight,
    display: getTopDisplay,
    'overflow-y': getTopAndBottomOverflowY
  }));
  const getStickyTopStyle = createMemo(() => ({
    height: getStickyTopHeight,
    top: getStickyTopTop,
    width: getStickyTopWidth
  }));
  const getBottomStyle = createMemo(() => ({
    height: getBottomHeight,
    'min-height': getBottomHeight,
    display: getBottomDisplay,
    'overflow-y': getTopAndBottomOverflowY
  }));
  return (() => {
    const _el$ = _tmpl$$3.cloneNode(true),
          _el$2 = _el$.firstChild,
          _el$3 = _el$2.nextSibling,
          _el$4 = _el$3.nextSibling,
          _el$5 = _el$4.nextSibling;

    const _ref$ = eRoot;
    typeof _ref$ === "function" ? use(_ref$, _el$) : eRoot = _el$;

    insert(_el$, createComponent(GridHeaderComp, {}), _el$2);

    const _ref$2 = eTop;
    typeof _ref$2 === "function" ? use(_ref$2, _el$2) : eTop = _el$2;

    insert(_el$2, createComponent(RowContainerComp, {
      get name() {
        return RowContainerName.TOP_LEFT;
      }

    }), null);

    insert(_el$2, createComponent(RowContainerComp, {
      get name() {
        return RowContainerName.TOP_CENTER;
      }

    }), null);

    insert(_el$2, createComponent(RowContainerComp, {
      get name() {
        return RowContainerName.TOP_RIGHT;
      }

    }), null);

    insert(_el$2, createComponent(RowContainerComp, {
      get name() {
        return RowContainerName.TOP_FULL_WIDTH;
      }

    }), null);

    const _ref$3 = eBodyViewport;
    typeof _ref$3 === "function" ? use(_ref$3, _el$3) : eBodyViewport = _el$3;

    insert(_el$3, createComponent(RowContainerComp, {
      get name() {
        return RowContainerName.LEFT;
      }

    }), null);

    insert(_el$3, createComponent(RowContainerComp, {
      get name() {
        return RowContainerName.CENTER;
      }

    }), null);

    insert(_el$3, createComponent(RowContainerComp, {
      get name() {
        return RowContainerName.RIGHT;
      }

    }), null);

    insert(_el$3, createComponent(RowContainerComp, {
      get name() {
        return RowContainerName.FULL_WIDTH;
      }

    }), null);

    const _ref$4 = eStickyTop;
    typeof _ref$4 === "function" ? use(_ref$4, _el$4) : eStickyTop = _el$4;

    insert(_el$4, createComponent(RowContainerComp, {
      get name() {
        return RowContainerName.STICKY_TOP_LEFT;
      }

    }), null);

    insert(_el$4, createComponent(RowContainerComp, {
      get name() {
        return RowContainerName.STICKY_TOP_CENTER;
      }

    }), null);

    insert(_el$4, createComponent(RowContainerComp, {
      get name() {
        return RowContainerName.STICKY_TOP_RIGHT;
      }

    }), null);

    insert(_el$4, createComponent(RowContainerComp, {
      get name() {
        return RowContainerName.STICKY_TOP_FULL_WIDTH;
      }

    }), null);

    const _ref$5 = eBottom;
    typeof _ref$5 === "function" ? use(_ref$5, _el$5) : eBottom = _el$5;

    insert(_el$5, createComponent(RowContainerComp, {
      get name() {
        return RowContainerName.BOTTOM_LEFT;
      }

    }), null);

    insert(_el$5, createComponent(RowContainerComp, {
      get name() {
        return RowContainerName.BOTTOM_CENTER;
      }

    }), null);

    insert(_el$5, createComponent(RowContainerComp, {
      get name() {
        return RowContainerName.BOTTOM_RIGHT;
      }

    }), null);

    insert(_el$5, createComponent(RowContainerComp, {
      get name() {
        return RowContainerName.BOTTOM_FULL_WIDTH;
      }

    }), null);

    effect(_p$ => {
      const _v$ = getRootClasses(),
            _v$2 = getAriaColCount(),
            _v$3 = getAriaRowCount(),
            _v$4 = getTopClasses(),
            _v$5 = getTopStyle(),
            _v$6 = getBodyViewportClasses(),
            _v$7 = getStickyTopClasses(),
            _v$8 = getStickyTopStyle(),
            _v$9 = getBottomClasses(),
            _v$10 = getBottomStyle();

      _v$ !== _p$._v$ && className(_el$, _p$._v$ = _v$);
      _v$2 !== _p$._v$2 && setAttribute(_el$, "aria-colcount", _p$._v$2 = _v$2);
      _v$3 !== _p$._v$3 && setAttribute(_el$, "aria-rowcount", _p$._v$3 = _v$3);
      _v$4 !== _p$._v$4 && className(_el$2, _p$._v$4 = _v$4);
      _p$._v$5 = style(_el$2, _v$5, _p$._v$5);
      _v$6 !== _p$._v$6 && className(_el$3, _p$._v$6 = _v$6);
      _v$7 !== _p$._v$7 && className(_el$4, _p$._v$7 = _v$7);
      _p$._v$8 = style(_el$4, _v$8, _p$._v$8);
      _v$9 !== _p$._v$9 && className(_el$5, _p$._v$9 = _v$9);
      _p$._v$10 = style(_el$5, _v$10, _p$._v$10);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined,
      _v$3: undefined,
      _v$4: undefined,
      _v$5: undefined,
      _v$6: undefined,
      _v$7: undefined,
      _v$8: undefined,
      _v$9: undefined,
      _v$10: undefined
    });

    return _el$;
  })();
};

const _tmpl$$2 = /*#__PURE__*/template(`<div class="ag-tab-guard ag-tab-guard-top" role="presentation"></div>`, 2),
      _tmpl$2 = /*#__PURE__*/template(`<div class="ag-tab-guard ag-tab-guard-bottom" role="presentation"></div>`, 2);

const TabGuardComp = props => {
  const {
    children,
    eFocusableElement,
    onTabKeyDown,
    gridCtrl
  } = props;
  const [tabIndex, setTabIndex] = createSignal();
  let eTopGuard;
  let eBottomGuard;
  let ctrl;
  const {
    context
  } = useContext(BeansContext);
  onMount(() => {
    const compProxy = {
      setTabIndex: value => value == null ? setTabIndex(undefined) : setTabIndex(parseInt(value, 10))
    };
    ctrl = context.createBean(new TabGuardCtrl({
      comp: compProxy,
      eTopGuard: eTopGuard,
      eBottomGuard: eBottomGuard,
      eFocusableElement: eFocusableElement,
      onTabKeyDown: onTabKeyDown,
      focusInnerElement: fromBottom => gridCtrl.focusInnerElement(fromBottom)
    }));
    props.ref({
      forceFocusOutOfContainer() {
        ctrl.forceFocusOutOfContainer();
      }

    });
  });
  onCleanup(() => context.destroyBean(ctrl));
  return [(() => {
    const _el$ = _tmpl$$2.cloneNode(true);

    const _ref$ = eTopGuard;
    typeof _ref$ === "function" ? use(_ref$, _el$) : eTopGuard = _el$;

    effect(() => setAttribute(_el$, "tabindex", tabIndex()));

    return _el$;
  })(), children, (() => {
    const _el$2 = _tmpl$2.cloneNode(true);

    const _ref$2 = eBottomGuard;
    typeof _ref$2 === "function" ? use(_ref$2, _el$2) : eBottomGuard = _el$2;

    effect(() => setAttribute(_el$2, "tabindex", tabIndex()));

    return _el$2;
  })()];
};

const _tmpl$$1 = /*#__PURE__*/template(`<div><div></div></div>`, 4);

const GridComp = props => {
  const [rtlClass, setRtlClass] = createSignal('');
  const [keyboardFocusClass, setKeyboardFocusClass] = createSignal('');
  const [layoutClass, setLayoutClass] = createSignal('');
  const [cursor, setCursor] = createSignal(null);
  const [userSelect, setUserSelect] = createSignal(null);
  const [initialised, setInitialised] = createSignal(false);
  const {
    context
  } = props;
  const beans = context.getBean('beans');
  let tabGuardRef;

  const setTabGuardRef = newRef => {
    tabGuardRef = newRef;
    tabGuardRef && tabGuardReady();
  };

  let eGui;
  let eBody;
  let gridCtrl;

  const onTabKeyDown = () => undefined;

  const destroyFuncs = [];
  onCleanup(() => {
    destroyFuncs.forEach(f => f());
    destroyFuncs.length = 0;
  });

  const tabGuardReady = () => {
    const beansToDestroy = [];
    const {
      agStackComponentsRegistry
    } = beans;
    const HeaderDropZonesClass = agStackComponentsRegistry.getComponentClass('AG-GRID-HEADER-DROP-ZONES');
    const SideBarClass = agStackComponentsRegistry.getComponentClass('AG-SIDE-BAR');
    const StatusBarClass = agStackComponentsRegistry.getComponentClass('AG-STATUS-BAR');
    const WatermarkClass = agStackComponentsRegistry.getComponentClass('AG-WATERMARK');
    const PaginationClass = agStackComponentsRegistry.getComponentClass('AG-PAGINATION');
    const additionalEls = [];

    if (gridCtrl.showDropZones() && HeaderDropZonesClass) {
      const headerDropZonesComp = context.createBean(new HeaderDropZonesClass());
      const el = headerDropZonesComp.getGui();
      eGui.insertAdjacentElement('afterbegin', el);
      additionalEls.push(el);
      beansToDestroy.push(headerDropZonesComp);
    }

    if (gridCtrl.showSideBar() && SideBarClass) {
      const sideBarComp = context.createBean(new SideBarClass());
      const el = sideBarComp.getGui();
      const bottomTabGuard = eBody.querySelector('.ag-tab-guard-bottom');

      if (bottomTabGuard) {
        bottomTabGuard.insertAdjacentElement('beforebegin', el);
        additionalEls.push(el);
      }

      beansToDestroy.push(sideBarComp);
    }

    if (gridCtrl.showStatusBar() && StatusBarClass) {
      const statusBarComp = context.createBean(new StatusBarClass());
      const el = statusBarComp.getGui();
      eGui.insertAdjacentElement('beforeend', el);
      additionalEls.push(el);
      beansToDestroy.push(statusBarComp);
    }

    if (PaginationClass) {
      const paginationComp = context.createBean(new PaginationClass());
      const el = paginationComp.getGui();
      eGui.insertAdjacentElement('beforeend', el);
      additionalEls.push(el);
      beansToDestroy.push(paginationComp);
    }

    if (gridCtrl.showWatermark() && WatermarkClass) {
      const watermarkComp = context.createBean(new WatermarkClass());
      const el = watermarkComp.getGui();
      eGui.insertAdjacentElement('beforeend', el);
      additionalEls.push(el);
      beansToDestroy.push(watermarkComp);
    }

    destroyFuncs.push(() => {
      context.destroyBeans(beansToDestroy);
      additionalEls.forEach(el => {
        if (el.parentElement) {
          el.parentElement.removeChild(el);
        }
      });
    });
  };

  onMount(() => {
    gridCtrl = context.createBean(new GridCtrl());
    destroyFuncs.push(() => context.destroyBean(gridCtrl));
    const compProxy = {
      destroyGridUi: () => {},
      // do nothing, as framework users destroy grid by removing the comp
      setRtlClass: setRtlClass,
      addOrRemoveKeyboardFocusClass: addOrRemove => setKeyboardFocusClass(addOrRemove ? FocusService.AG_KEYBOARD_FOCUS : ''),
      forceFocusOutOfContainer: () => {
        tabGuardRef && tabGuardRef.forceFocusOutOfContainer();
      },
      updateLayoutClasses: setLayoutClass,
      getFocusableContainers: () => {
        const els = [];
        const gridBodyCompEl = eGui.querySelector('.ag-root');
        const sideBarEl = eGui.querySelector('.ag-side-bar');

        if (gridBodyCompEl) {
          els.push(gridBodyCompEl);
        }

        if (sideBarEl) {
          els.push(sideBarEl);
        }

        return els;
      },
      setCursor,
      setUserSelect
    };
    gridCtrl.setComp(compProxy, eGui, eGui);
    setInitialised(true);
  });
  const cssClasses = createMemo(() => classesList('ag-root-wrapper', rtlClass(), keyboardFocusClass(), layoutClass(), props.class));
  const bodyCssClasses = createMemo(() => classesList('ag-root-wrapper-body', 'ag-focus-managed', layoutClass()));
  const topStyle = createMemo(() => ({
    userSelect: userSelect != null ? userSelect : '',
    WebkitUserSelect: userSelect != null ? userSelect : '',
    cursor: cursor != null ? cursor : ''
  }));
  return (() => {
    const _el$ = _tmpl$$1.cloneNode(true),
          _el$2 = _el$.firstChild;

    const _ref$ = eGui;
    typeof _ref$ === "function" ? use(_ref$, _el$) : eGui = _el$;
    const _ref$2 = eBody;
    typeof _ref$2 === "function" ? use(_ref$2, _el$2) : eBody = _el$2;

    insert(_el$2, (() => {
      const _c$ = memo(() => !!initialised(), true);

      return () => _c$() && // we wait for initialised before rending the children, so GridComp has created and registered with it's
      // GridCtrl before we create the child GridBodyComp. Otherwise the GridBodyComp would initialise first,
      // before we have set the the Layout CSS classes, causing the GridBodyComp to render rows to a grid that
      // doesn't have it's height specified, which would result if all the rows getting rendered (and if many rows,
      // hangs the UI)
      createComponent(BeansContext.Provider, {
        value: beans,

        get children() {
          return createComponent(TabGuardComp, {
            ref: setTabGuardRef,
            eFocusableElement: eGui,
            onTabKeyDown: onTabKeyDown,
            gridCtrl: gridCtrl,

            get children() {
              return createComponent(GridBodyComp, {});
            }

          });
        }

      });
    })());

    effect(_p$ => {
      const _v$ = cssClasses(),
            _v$2 = topStyle(),
            _v$3 = bodyCssClasses();

      _v$ !== _p$._v$ && className(_el$, _p$._v$ = _v$);
      _p$._v$2 = style(_el$, _v$2, _p$._v$2);
      _v$3 !== _p$._v$3 && className(_el$2, _p$._v$3 = _v$3);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined,
      _v$3: undefined
    });

    return _el$;
  })();
};

const _tmpl$ = /*#__PURE__*/template(`<div></div>`, 2);

const AgGridSolid = props => {
  let eGui;
  let gridOptions;
  const [context, setContext] = createSignal();
  const [getPortals, setPortals] = createSignal([]);
  const destroyFuncs = [];
  onCleanup(() => {
    destroyFuncs.forEach(f => f());
    destroyFuncs.length = 0;
  }); // we check for property changes. to get things started, we take a copy
  // of all the properties at the start, and then compare against this for
  // changes.

  const propsCopy = {};
  Object.keys(props).forEach(key => propsCopy[key] = props[key]);
  createEffect(() => {
    const keys = Object.keys(props);
    const changes = {};
    let changesExist = false;
    keys.forEach(key => {
      // this line reads from the prop, which in turn makes
      // this prop a dependency for the effect.
      const currentValue = props[key];
      const previousValue = propsCopy[key];

      if (previousValue !== currentValue) {
        changes[key] = {
          currentValue,
          previousValue
        };
        propsCopy[key] = currentValue;
        changesExist = true;
      }
    });

    if (changesExist) {
      ComponentUtil.processOnChange(changes, gridOptions, gridOptions.api, gridOptions.columnApi);
    }
  });
  onMount(() => {
    const modules = props.modules || [];
    const portalManager = {
      addPortal: info => {
        setPortals([...getPortals(), info]);
      },
      removePortal: info => {
        setPortals(getPortals().filter(item => item != info));
      }
    };
    const gridParams = {
      providedBeanInstances: {
        frameworkComponentWrapper: new SolidCompWrapperFactory(portalManager)
      },
      modules,
      frameworkOverrides: new SolidFrameworkOverrides()
    };
    gridOptions = props.gridOptions || {};
    ComponentUtil.copyAttributesToGridOptions(gridOptions, props);

    const createUiCallback = context => {
      setContext(context); // because React is Async, we need to wait for the UI to be initialised before exposing the API's

      const ctrlsService = context.getBean(CtrlsService.NAME);
      ctrlsService.whenReady(() => {
        const refCallback = props.ref && props.ref;

        if (refCallback) {
          const gridRef = {
            api: gridOptions.api,
            columnApi: gridOptions.columnApi
          };
          refCallback(gridRef);
        }

        destroyFuncs.push(() => gridOptions.api.destroy());
      });
    };

    const acceptChangesCallback = () => {// todo, what goes here?
    };

    const gridCoreCreator = new GridCoreCreator();
    gridCoreCreator.create(eGui, gridOptions, createUiCallback, acceptChangesCallback, gridParams);
  });
  return (() => {
    const _el$ = _tmpl$.cloneNode(true);

    const _ref$ = eGui;
    typeof _ref$ === "function" ? use(_ref$, _el$) : eGui = _el$;

    _el$.style.setProperty("height", "100%");

    insert(_el$, (() => {
      const _c$ = memo(() => !!context(), true);

      return () => _c$() && createComponent(GridComp, {
        get ["class"]() {
          return props.class;
        },

        get context() {
          return context();
        }

      });
    })(), null);

    insert(_el$, createComponent(For, {
      get each() {
        return getPortals();
      },

      children: (info, i) => createComponent(Portal, {
        get mount() {
          return info.mount;
        },

        get children() {
          return createComponent(info.SolidClass, mergeProps(() => info.props, {
            ref(r$) {
              const _ref$2 = info.ref;
              typeof _ref$2 === "function" ? _ref$2(r$) : info.ref = r$;
            }

          }));
        }

      })
    }), null);

    return _el$;
  })();
};

// import { render } from 'solid-js/web';
//
// import './index.css';
// import App from './sampleApp/App';
//
// render(() => <App />, document.getElementById('root') as HTMLElement);

export { AgGridSolid as default };
//# sourceMappingURL=index.js.map
