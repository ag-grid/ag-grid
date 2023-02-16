'use strict';

var web = require('solid-js/web');
var agGridCommunity = require('ag-grid-community');
var solidJs = require('solid-js');

function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
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
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
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

class SolidCompWrapperFactory extends agGridCommunity.BaseComponentWrapper {
  constructor(portalManager) {
    super();
    _defineProperty(this, "portalManager", void 0);
    this.portalManager = portalManager;
  }
  createWrapper(SolidComponentClass) {
    return new SolidCompWrapper(SolidComponentClass, this.portalManager);
  }
}

const BeansContext = solidJs.createContext({});

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
    res.classesMap = {
      ...this.classesMap
    };
    res.classesMap[className] = on;
    return res;
  }
  toString() {
    const res = Object.keys(this.classesMap).filter(key => this.classesMap[key]).join(' ');
    return res;
  }
}

const _tmpl$$f = /*#__PURE__*/web.template(`<div></div>`, 2);
const DetailCellRenderer = props => {
  const {
    ctrlsFactory,
    context,
    gridOptionsService,
    resizeObserverService,
    clientSideRowModel,
    serverSideRowModel
  } = solidJs.useContext(BeansContext);
  const [getCssClasses, setCssClasses] = solidJs.createSignal(new CssClasses());
  const [getGridCssClasses, setGridCssClasses] = solidJs.createSignal(new CssClasses());
  const [getDetailGridOptions, setDetailGridOptions] = solidJs.createSignal();
  const [getDetailRowData, setDetailRowData] = solidJs.createSignal();
  let ctrl;
  let eGuiRef;
  const getCssClassesStr = solidJs.createMemo(() => getCssClasses().toString() + ' ag-details-row');
  const getGridCssClassesStr = solidJs.createMemo(() => getGridCssClasses().toString() + ' ag-details-grid');
  props.ref(() => ({
    // force new instance when grid tries to refresh
    refresh() {
      return ctrl.refresh();
    }
  }));
  solidJs.onMount(() => {
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
    if (gridOptionsService.is('detailRowAutoHeight')) {
      const checkRowSizeFunc = () => {
        // when disposed, current is null, so nothing to do, and the resize observer will
        // be disposed of soon
        if (eGuiRef == null) {
          return;
        }
        const clientHeight = eGuiRef.clientHeight;

        // if the UI is not ready, the height can be 0, which we ignore, as otherwise a flicker will occur
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
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : eGuiRef = _el$;
    web.insert(_el$, (() => {
      const _c$ = web.memo(() => !!getDetailGridOptions());
      return () => _c$() && web.createComponent(AgGridSolid, web.mergeProps({
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
    web.effect(() => web.className(_el$, getCssClassesStr()));
    return _el$;
  })();
};

const JsUserComp = p => {
  const {
    context
  } = solidJs.useContext(BeansContext);
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
  solidJs.onCleanup(() => {
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
  solidJs.onCleanup(() => {
    if (refSet) {
      props.ref && props.ref(undefined);
    }
  });
  return web.createComponent(SolidClass, web.mergeProps({
    ref: setRef
  }, () => props.compDetails.params));
};

const UserComp = p => {
  const showSolidComp = solidJs.createMemo(() => {
    const details = p.compDetails;
    if (!details) {
      return false;
    }
    return details.componentFromFramework;
  });
  const showJsComp = solidJs.createMemo(() => {
    const details = p.compDetails;
    if (!details) {
      return false;
    }
    return !details.componentFromFramework;
  });
  return [web.memo((() => {
    const _c$ = web.memo(() => !!showSolidComp());
    return () => _c$() && web.createComponent(SolidUserComp, {
      get compDetails() {
        return p.compDetails;
      },
      ref(r$) {
        const _ref$ = p.ref;
        typeof _ref$ === "function" ? _ref$(r$) : p.ref = r$;
      }
    });
  })()), web.memo((() => {
    const _c$2 = web.memo(() => !!showJsComp());
    return () => _c$2() && web.createComponent(JsUserComp, {
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

const _tmpl$$e = /*#__PURE__*/web.template(`<span><span></span><span></span><span></span><span class="ag-group-value"></span><span class="ag-group-child-count"></span></span>`, 12);
const GroupCellRenderer = props => {
  const context = solidJs.useContext(BeansContext).context;
  let eGui;
  let eValueRef;
  let eCheckboxRef;
  let eExpandedRef;
  let eContractedRef;
  const [getInnerCompDetails, setInnerCompDetails] = solidJs.createSignal();
  const [getChildCount, setChildCount] = solidJs.createSignal();
  const [getValue, setValue] = solidJs.createSignal();
  const [getCssClasses, setCssClasses] = solidJs.createSignal(new CssClasses());
  const [getExpandedCssClasses, setExpandedCssClasses] = solidJs.createSignal(new CssClasses('ag-hidden'));
  const [getContractedCssClasses, setContractedCssClasses] = solidJs.createSignal(new CssClasses('ag-hidden'));
  const [getCheckboxCssClasses, setCheckboxCssClasses] = solidJs.createSignal(new CssClasses('ag-invisible'));
  props.ref(() => ({
    // force new instance when grid tries to refresh
    refresh() {
      return false;
    }
  }));
  solidJs.onMount(() => {
    const compProxy = {
      setInnerRenderer: (details, valueToDisplay) => {
        setInnerCompDetails(details);
        const escapedValue = agGridCommunity._.escapeString(valueToDisplay, true);
        setValue(escapedValue);
      },
      setChildCount: count => setChildCount(count),
      addOrRemoveCssClass: (name, on) => setCssClasses(getCssClasses().setClass(name, on)),
      setContractedDisplayed: displayed => setContractedCssClasses(getContractedCssClasses().setClass('ag-hidden', !displayed)),
      setExpandedDisplayed: displayed => setExpandedCssClasses(getExpandedCssClasses().setClass('ag-hidden', !displayed)),
      setCheckboxVisible: visible => setCheckboxCssClasses(getCheckboxCssClasses().setClass('ag-invisible', !visible))
    };
    const ctrl = context.createBean(new agGridCommunity.GroupCellRendererCtrl());
    ctrl.init(compProxy, eGui, eCheckboxRef, eExpandedRef, eContractedRef, GroupCellRenderer, props);
    return () => {
      context.destroyBean(ctrl);
    };
  });
  const getClassName = solidJs.createMemo(() => `ag-cell-wrapper ${getCssClasses().toString()}`);
  const getExpandedClassName = solidJs.createMemo(() => `ag-group-expanded ${getExpandedCssClasses().toString()}`);
  const getContractedClassName = solidJs.createMemo(() => `ag-group-contracted ${getContractedCssClasses().toString()}`);
  const getCheckboxClassName = solidJs.createMemo(() => `ag-group-checkbox ${getCheckboxCssClasses().toString()}`);
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
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : eGui = _el$;
    web.spread(_el$, web.mergeProps({
      get ["class"]() {
        return getClassName();
      }
    }, () => !props.colDef ? {
      role: 'gridcell'
    } : {}), false, true);
    const _ref$2 = eExpandedRef;
    typeof _ref$2 === "function" ? web.use(_ref$2, _el$2) : eExpandedRef = _el$2;
    const _ref$3 = eContractedRef;
    typeof _ref$3 === "function" ? web.use(_ref$3, _el$3) : eContractedRef = _el$3;
    const _ref$4 = eCheckboxRef;
    typeof _ref$4 === "function" ? web.use(_ref$4, _el$4) : eCheckboxRef = _el$4;
    const _ref$5 = eValueRef;
    typeof _ref$5 === "function" ? web.use(_ref$5, _el$5) : eValueRef = _el$5;
    web.insert(_el$5, (() => {
      const _c$ = web.memo(() => !!isShowUserComp());
      return () => _c$() && web.createComponent(UserComp, {
        get compDetails() {
          return getInnerCompDetails();
        }
      });
    })(), null);
    web.insert(_el$5, (() => {
      const _c$2 = web.memo(() => !!isShowValue());
      return () => _c$2() && web.memo(getValue);
    })(), null);
    web.insert(_el$6, getChildCount);
    web.effect(_p$ => {
      const _v$ = getExpandedClassName(),
        _v$2 = getContractedClassName(),
        _v$3 = getCheckboxClassName();
      _v$ !== _p$._v$ && web.className(_el$2, _p$._v$ = _v$);
      _v$2 !== _p$._v$2 && web.className(_el$3, _p$._v$2 = _v$2);
      _v$3 !== _p$._v$3 && web.className(_el$4, _p$._v$3 = _v$3);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined,
      _v$3: undefined
    });
    return _el$;
  })();
};

class SolidFrameworkOverrides extends agGridCommunity.VanillaFrameworkOverrides {
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

const _tmpl$$d = /*#__PURE__*/web.template(`<div class="ag-header-cell" role="columnheader" tabindex="-1"><div class="ag-header-cell-resize" role="presentation"></div><div class="ag-header-cell-comp-wrapper" role="presentation"></div></div>`, 6);
const HeaderCellComp = props => {
  const [getWidth, setWidth] = solidJs.createSignal();
  const [getTitle, setTitle] = solidJs.createSignal();
  const [getColId, setColId] = solidJs.createSignal();
  const [getAriaSort, setAriaSort] = solidJs.createSignal();
  const [getAriaDescription, setAriaDescription] = solidJs.createSignal();
  const [getUserCompDetails, setUserCompDetails] = solidJs.createSignal();
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
  const cssClassManager = new agGridCommunity.CssClassManager(() => eGui);
  solidJs.onMount(() => {
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
  const style = solidJs.createMemo(() => ({
    width: getWidth()
  }));
  solidJs.createMemo(() => {
    const details = getUserCompDetails();
    if (!details) {
      return false;
    }
    return details.componentFromFramework;
  });
  solidJs.createMemo(() => {
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
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : eGui = _el$;
    const _ref$2 = eResize;
    typeof _ref$2 === "function" ? web.use(_ref$2, _el$2) : eResize = _el$2;
    const _ref$3 = eHeaderCompWrapper;
    typeof _ref$3 === "function" ? web.use(_ref$3, _el$3) : eHeaderCompWrapper = _el$3;
    web.insert(_el$3, (() => {
      const _c$ = web.memo(() => !!getUserCompDetails());
      return () => _c$() && web.createComponent(UserComp, {
        get compDetails() {
          return getUserCompDetails();
        },
        ref: setRef
      });
    })());
    web.effect(_p$ => {
      const _v$ = style(),
        _v$2 = getTitle(),
        _v$3 = getColId(),
        _v$4 = getAriaSort(),
        _v$5 = getAriaDescription();
      _p$._v$ = web.style(_el$, _v$, _p$._v$);
      _v$2 !== _p$._v$2 && web.setAttribute(_el$, "title", _p$._v$2 = _v$2);
      _v$3 !== _p$._v$3 && web.setAttribute(_el$, "col-id", _p$._v$3 = _v$3);
      _v$4 !== _p$._v$4 && web.setAttribute(_el$, "aria-sort", _p$._v$4 = _v$4);
      _v$5 !== _p$._v$5 && web.setAttribute(_el$, "aria-description", _p$._v$5 = _v$5);
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

const _tmpl$$c = /*#__PURE__*/web.template(`<div role="gridcell" tabindex="-1"><div role="presentation"></div><div role="presentation"><button type="button" aria-label="Open Filter Menu" class="ag-floating-filter-button-button" tabindex="-1"></button></div></div>`, 8);
const HeaderFilterCellComp = props => {
  const [getCssClasses, setCssClasses] = solidJs.createSignal(new CssClasses());
  const [getCssBodyClasses, setBodyCssClasses] = solidJs.createSignal(new CssClasses());
  const [getCssButtonWrapperClasses, setButtonWrapperCssClasses] = solidJs.createSignal(new CssClasses());
  const [getButtonWrapperAriaHidden, setButtonWrapperAriaHidden] = solidJs.createSignal("false");
  const [getWidth, setWidth] = solidJs.createSignal();
  const [getUserCompDetails, setUserCompDetails] = solidJs.createSignal();
  let eGui;
  let eFloatingFilterBody;
  let eButtonWrapper;
  let eButtonShowMainFilter;
  let alreadyResolved = false;
  let userCompResolve;
  let userCompPromise;
  solidJs.onMount(() => {
    userCompPromise = new agGridCommunity.AgPromise(resolve => {
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
    }
    // we also skip when it's un-setting
    if (value == null) {
      return;
    }
    userCompResolve && userCompResolve(value);
    alreadyResolved = true;
  };
  const {
    ctrl
  } = props;
  solidJs.onMount(() => {
    const compProxy = {
      addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
      addOrRemoveBodyCssClass: (name, on) => setBodyCssClasses(prev => prev.setClass(name, on)),
      setButtonWrapperDisplayed: displayed => {
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
  const getStyle = solidJs.createMemo(() => ({
    width: getWidth()
  }));
  const getCssClassesString = solidJs.createMemo(() => 'ag-header-cell ag-floating-filter ' + getCssClasses.toString());
  const getBodyCssClassesString = solidJs.createMemo(() => getCssBodyClasses.toString());
  const getButtonWrapperCssClassesString = solidJs.createMemo(() => 'ag-floating-filter-button ' + getCssButtonWrapperClasses.toString());
  return (() => {
    const _el$ = _tmpl$$c.cloneNode(true),
      _el$2 = _el$.firstChild,
      _el$3 = _el$2.nextSibling,
      _el$4 = _el$3.firstChild;
    const _ref$ = eGui;
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : eGui = _el$;
    const _ref$2 = eFloatingFilterBody;
    typeof _ref$2 === "function" ? web.use(_ref$2, _el$2) : eFloatingFilterBody = _el$2;
    web.insert(_el$2, (() => {
      const _c$ = web.memo(() => !!getUserCompDetails());
      return () => _c$() && web.createComponent(UserComp, {
        get compDetails() {
          return getUserCompDetails();
        },
        ref: setRef
      });
    })());
    const _ref$3 = eButtonWrapper;
    typeof _ref$3 === "function" ? web.use(_ref$3, _el$3) : eButtonWrapper = _el$3;
    const _ref$4 = eButtonShowMainFilter;
    typeof _ref$4 === "function" ? web.use(_ref$4, _el$4) : eButtonShowMainFilter = _el$4;
    web.effect(_p$ => {
      const _v$ = getCssClassesString(),
        _v$2 = getStyle(),
        _v$3 = getBodyCssClassesString(),
        _v$4 = getButtonWrapperAriaHidden(),
        _v$5 = getButtonWrapperCssClassesString();
      _v$ !== _p$._v$ && web.className(_el$, _p$._v$ = _v$);
      _p$._v$2 = web.style(_el$, _v$2, _p$._v$2);
      _v$3 !== _p$._v$3 && web.className(_el$2, _p$._v$3 = _v$3);
      _v$4 !== _p$._v$4 && web.setAttribute(_el$3, "aria-hidden", _p$._v$4 = _v$4);
      _v$5 !== _p$._v$5 && web.className(_el$3, _p$._v$5 = _v$5);
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

const _tmpl$$b = /*#__PURE__*/web.template(`<div role="columnheader" tabindex="-1"><div></div></div>`, 4);
const HeaderGroupCellComp = props => {
  const [getCssClasses, setCssClasses] = solidJs.createSignal(new CssClasses());
  const [getCssResizableClasses, setResizableCssClasses] = solidJs.createSignal(new CssClasses());
  const [getResizableAriaHidden, setResizableAriaHidden] = solidJs.createSignal("false");
  const [getWidth, setWidth] = solidJs.createSignal();
  const [getTitle, setTitle] = solidJs.createSignal();
  const [getColId, setColId] = solidJs.createSignal();
  const [getAriaExpanded, setAriaExpanded] = solidJs.createSignal();
  const [getUserCompDetails, setUserCompDetails] = solidJs.createSignal();
  let eGui;
  let eResize;
  const {
    ctrl
  } = props;
  solidJs.onMount(() => {
    const compProxy = {
      setWidth: width => setWidth(width),
      addOrRemoveCssClass: (name, on) => setCssClasses(getCssClasses().setClass(name, on)),
      setColId: id => setColId(id),
      setTitle: title => setTitle(title),
      setUserCompDetails: compDetails => setUserCompDetails(compDetails),
      setResizableDisplayed: displayed => {
        setResizableCssClasses(prev => prev.setClass('ag-hidden', !displayed));
        setResizableAriaHidden(!displayed ? "true" : "false");
      },
      setAriaExpanded: expanded => setAriaExpanded(expanded)
    };
    ctrl.setComp(compProxy, eGui, eResize);
  });

  // add drag handling, must be done after component is added to the dom
  solidJs.createEffect(() => {
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
  const style = solidJs.createMemo(() => ({
    width: getWidth()
  }));
  const getClassName = solidJs.createMemo(() => 'ag-header-group-cell ' + getCssClasses().toString());
  const getResizableClassName = solidJs.createMemo(() => 'ag-header-cell-resize ' + getCssResizableClasses().toString());
  return (() => {
    const _el$ = _tmpl$$b.cloneNode(true),
      _el$2 = _el$.firstChild;
    const _ref$ = eGui;
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : eGui = _el$;
    web.insert(_el$, (() => {
      const _c$ = web.memo(() => !!getUserCompDetails());
      return () => _c$() && web.createComponent(UserComp, {
        get compDetails() {
          return getUserCompDetails();
        }
      });
    })(), _el$2);
    const _ref$2 = eResize;
    typeof _ref$2 === "function" ? web.use(_ref$2, _el$2) : eResize = _el$2;
    web.effect(_p$ => {
      const _v$ = getClassName(),
        _v$2 = style(),
        _v$3 = getTitle(),
        _v$4 = getColId(),
        _v$5 = getAriaExpanded(),
        _v$6 = getResizableAriaHidden(),
        _v$7 = getResizableClassName();
      _v$ !== _p$._v$ && web.className(_el$, _p$._v$ = _v$);
      _p$._v$2 = web.style(_el$, _v$2, _p$._v$2);
      _v$3 !== _p$._v$3 && web.setAttribute(_el$, "title", _p$._v$3 = _v$3);
      _v$4 !== _p$._v$4 && web.setAttribute(_el$, "col-id", _p$._v$4 = _v$4);
      _v$5 !== _p$._v$5 && web.setAttribute(_el$, "aria-expanded", _p$._v$5 = _v$5);
      _v$6 !== _p$._v$6 && web.setAttribute(_el$2, "aria-hidden", _p$._v$6 = _v$6);
      _v$7 !== _p$._v$7 && web.className(_el$2, _p$._v$7 = _v$7);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined,
      _v$3: undefined,
      _v$4: undefined,
      _v$5: undefined,
      _v$6: undefined,
      _v$7: undefined
    });
    return _el$;
  })();
};

const _tmpl$$a = /*#__PURE__*/web.template(`<div role="row"></div>`, 2);
const HeaderRowComp = props => {
  const {
    gridOptionsService
  } = solidJs.useContext(BeansContext);
  const [getTransform, setTransform] = solidJs.createSignal();
  const [getHeight, setHeight] = solidJs.createSignal();
  const [getTop, setTop] = solidJs.createSignal();
  const [getWidth, setWidth] = solidJs.createSignal();
  const [getAriaRowIndex, setAriaRowIndex] = solidJs.createSignal();
  const [getCellCtrls, setCellCtrls] = solidJs.createSignal([]);
  let eGui;
  const {
    ctrl
  } = props;
  const typeColumn = ctrl.getType() === agGridCommunity.HeaderRowType.COLUMN;
  const typeGroup = ctrl.getType() === agGridCommunity.HeaderRowType.COLUMN_GROUP;
  const typeFilter = ctrl.getType() === agGridCommunity.HeaderRowType.FLOATING_FILTER;
  const setCellCtrlsMaintainOrder = next => {
    const prev = getCellCtrls();
    const isEnsureDomOrder = gridOptionsService.is('ensureDomOrder');
    const isPrintLayout = gridOptionsService.isDomLayout('print');

    // if we are ensuring dom order, we set the ctrls into the dom in the same order they appear on screen
    if (isEnsureDomOrder || isPrintLayout) {
      return next;
    }

    // if not maintaining order, we want to keep the dom elements we have and add new ones to the end,
    // otherwise we will loose transition effects as elements are placed in different dom locations
    const prevMap = agGridCommunity._.mapById(prev, c => c.getInstanceId());
    const nextMap = agGridCommunity._.mapById(next, c => c.getInstanceId());
    const oldCtrlsWeAreKeeping = prev.filter(c => nextMap.has(c.getInstanceId()));
    const newCtrls = next.filter(c => !prevMap.has(c.getInstanceId()));
    const nextOrderMaintained = [...oldCtrlsWeAreKeeping, ...newCtrls];
    setCellCtrls(nextOrderMaintained);
  };
  solidJs.onMount(() => {
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
  const style = solidJs.createMemo(() => ({
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
      case agGridCommunity.HeaderRowType.COLUMN_GROUP:
        return web.createComponent(HeaderGroupCellComp, {
          ctrl: cellCtrl
        });
      case agGridCommunity.HeaderRowType.FLOATING_FILTER:
        return web.createComponent(HeaderFilterCellComp, {
          ctrl: cellCtrl
        });
      default:
        return web.createComponent(HeaderCellComp, {
          ctrl: cellCtrl
        });
    }
  };

  // below, we are not doing floating filters, not yet
  return (() => {
    const _el$ = _tmpl$$a.cloneNode(true);
    const _ref$ = eGui;
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : eGui = _el$;
    web.className(_el$, cssClasses);
    web.insert(_el$, web.createComponent(solidJs.For, {
      get each() {
        return getCellCtrls();
      },
      children: (cellCtrl, i) => createCellJsx(cellCtrl)
    }));
    web.effect(_p$ => {
      const _v$ = style(),
        _v$2 = getAriaRowIndex();
      _p$._v$ = web.style(_el$, _v$, _p$._v$);
      _v$2 !== _p$._v$2 && web.setAttribute(_el$, "aria-rowindex", _p$._v$2 = _v$2);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined
    });
    return _el$;
  })();
};

const _tmpl$$9 = /*#__PURE__*/web.template(`<div role="presentation"></div>`, 2),
  _tmpl$2$2 = /*#__PURE__*/web.template(`<div role="presentation"><div class="ag-header-container" role="rowgroup"></div></div>`, 4);
const HeaderRowContainerComp = props => {
  const [getCssClasses, setCssClasses] = solidJs.createSignal(new CssClasses());
  const [getAriaHidden, setAriaHidden] = solidJs.createSignal(false);
  const [getCenterContainerWidth, setCenterContainerWidth] = solidJs.createSignal();
  const [getCenterContainerTransform, setCenterContainerTransform] = solidJs.createSignal();
  const [getPinnedContainerWidth, setPinnedContainerWidth] = solidJs.createSignal();
  const [getHeaderRowCtrls, setHeaderRowCtrls] = solidJs.createSignal([]);
  const {
    context
  } = solidJs.useContext(BeansContext);
  let eGui;
  const pinnedLeft = props.pinned === 'left';
  const pinnedRight = props.pinned === 'right';
  const centre = !pinnedLeft && !pinnedRight;
  const destroyFuncs = [];
  solidJs.onCleanup(() => {
    destroyFuncs.forEach(f => f());
    destroyFuncs.length = 0;
  });
  solidJs.onMount(() => {
    const compProxy = {
      setDisplayed: displayed => {
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
    const ctrl = context.createBean(new agGridCommunity.HeaderRowContainerCtrl(props.pinned));
    ctrl.setComp(compProxy, eGui);
    destroyFuncs.push(() => context.destroyBean(ctrl));
  });
  const getClassName = solidJs.createMemo(() => getCssClasses.toString());
  const insertRowsJsx = () => web.createComponent(solidJs.For, {
    get each() {
      return getHeaderRowCtrls();
    },
    children: ctrl => web.createComponent(HeaderRowComp, {
      ctrl: ctrl
    })
  });
  const eCenterContainerStyle = solidJs.createMemo(() => ({
    width: getCenterContainerWidth(),
    transform: getCenterContainerTransform()
  }));
  const ePinnedStyle = solidJs.createMemo(() => ({
    width: getPinnedContainerWidth(),
    'min-width': getPinnedContainerWidth(),
    'max-width': getPinnedContainerWidth()
  }));
  return [pinnedLeft && (() => {
    const _el$ = _tmpl$$9.cloneNode(true);
    const _ref$ = eGui;
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : eGui = _el$;
    web.insert(_el$, insertRowsJsx);
    web.effect(_p$ => {
      const _v$ = "ag-pinned-left-header " + getClassName(),
        _v$2 = getAriaHidden(),
        _v$3 = ePinnedStyle();
      _v$ !== _p$._v$ && web.className(_el$, _p$._v$ = _v$);
      _v$2 !== _p$._v$2 && web.setAttribute(_el$, "aria-hidden", _p$._v$2 = _v$2);
      _p$._v$3 = web.style(_el$, _v$3, _p$._v$3);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined,
      _v$3: undefined
    });
    return _el$;
  })(), pinnedRight && (() => {
    const _el$2 = _tmpl$$9.cloneNode(true);
    const _ref$2 = eGui;
    typeof _ref$2 === "function" ? web.use(_ref$2, _el$2) : eGui = _el$2;
    web.insert(_el$2, insertRowsJsx);
    web.effect(_p$ => {
      const _v$4 = "ag-pinned-right-header " + getClassName(),
        _v$5 = getAriaHidden(),
        _v$6 = ePinnedStyle();
      _v$4 !== _p$._v$4 && web.className(_el$2, _p$._v$4 = _v$4);
      _v$5 !== _p$._v$5 && web.setAttribute(_el$2, "aria-hidden", _p$._v$5 = _v$5);
      _p$._v$6 = web.style(_el$2, _v$6, _p$._v$6);
      return _p$;
    }, {
      _v$4: undefined,
      _v$5: undefined,
      _v$6: undefined
    });
    return _el$2;
  })(), centre && (() => {
    const _el$3 = _tmpl$2$2.cloneNode(true),
      _el$4 = _el$3.firstChild;
    const _ref$3 = eGui;
    typeof _ref$3 === "function" ? web.use(_ref$3, _el$3) : eGui = _el$3;
    web.insert(_el$4, insertRowsJsx);
    web.effect(_p$ => {
      const _v$7 = "ag-header-viewport " + getClassName(),
        _v$8 = eCenterContainerStyle();
      _v$7 !== _p$._v$7 && web.className(_el$3, _p$._v$7 = _v$7);
      _p$._v$8 = web.style(_el$4, _v$8, _p$._v$8);
      return _p$;
    }, {
      _v$7: undefined,
      _v$8: undefined
    });
    return _el$3;
  })()];
};

const _tmpl$$8 = /*#__PURE__*/web.template(`<div role="presentation"></div>`, 2);
const GridHeaderComp = () => {
  const [getCssClasses, setCssClasses] = solidJs.createSignal(new CssClasses());
  const [getHeight, setHeight] = solidJs.createSignal();
  const {
    context
  } = solidJs.useContext(BeansContext);
  let eGui;
  const destroyFuncs = [];
  solidJs.onCleanup(() => {
    destroyFuncs.forEach(f => f());
    destroyFuncs.length = 0;
  });
  solidJs.onMount(() => {
    const compProxy = {
      addOrRemoveCssClass: (name, on) => setCssClasses(getCssClasses().setClass(name, on)),
      setHeightAndMinHeight: height => setHeight(height)
    };
    const ctrl = context.createBean(new agGridCommunity.GridHeaderCtrl());
    ctrl.setComp(compProxy, eGui, eGui);
    destroyFuncs.push(() => context.destroyBean(ctrl));
  });
  const className = solidJs.createMemo(() => {
    let res = getCssClasses().toString();
    return 'ag-header ' + res;
  });
  const style = solidJs.createMemo(() => ({
    height: getHeight(),
    'min-height': getHeight()
  }));
  return (() => {
    const _el$ = _tmpl$$8.cloneNode(true);
    const _ref$ = eGui;
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : eGui = _el$;
    web.insert(_el$, web.createComponent(HeaderRowContainerComp, {
      pinned: 'left'
    }), null);
    web.insert(_el$, web.createComponent(HeaderRowContainerComp, {
      pinned: null
    }), null);
    web.insert(_el$, web.createComponent(HeaderRowContainerComp, {
      pinned: 'right'
    }), null);
    web.effect(_p$ => {
      const _v$ = className(),
        _v$2 = style();
      _v$ !== _p$._v$ && web.className(_el$, _p$._v$ = _v$);
      _p$._v$2 = web.style(_el$, _v$2, _p$._v$2);
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
    localeService,
    gridOptionsService
  } = solidJs.useContext(BeansContext);
  const {
    editDetails,
    cellCtrl,
    eParentCell
  } = props;
  const {
    compDetails
  } = editDetails;
  const useModelPopup = gridOptionsService.is('stopEditingWhenCellsLoseFocus');
  const wrapper = context.createBean(new agGridCommunity.PopupEditorWrapper(compDetails.params));
  const ePopupGui = wrapper.getGui();
  const positionParams = {
    column: cellCtrl.getColumn(),
    rowNode: cellCtrl.getRowNode(),
    type: 'popupCellEditor',
    eventSource: eParentCell,
    ePopup: ePopupGui,
    position: editDetails.popupPosition,
    keepWithinBounds: true
  };
  const positionCallback = popupService.positionPopupByComponent.bind(popupService, positionParams);
  const translate = localeService.getLocaleTextFunc();
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
  solidJs.onCleanup(() => {
    if (hideEditorPopup != null) {
      hideEditorPopup();
    }
    context.destroyBean(wrapper);
  });
  return web.createComponent(web.Portal, {
    mount: ePopupGui,
    get children() {
      return props.children;
    }
  });
};

const ShowEditDetails = props => {
  const getCompDetails = solidJs.createMemo(() => props.editDetails.compDetails);
  const compDetails = props.editDetails.compDetails;

  // when editing, we must have a comp, otherwise doesn't work
  if (!compDetails) {
    return [];
  }
  const inPopup = props.editDetails.popup;
  const eGui = props.eGuiFn();
  return [inPopup && web.createComponent(PopupEditorComp, {
    get cellCtrl() {
      return props.cellCtrl;
    },
    eParentCell: eGui,
    get editDetails() {
      return props.editDetails;
    },
    get children() {
      return web.createComponent(UserComp, {
        get compDetails() {
          return getCompDetails();
        },
        ref(r$) {
          const _ref$ = props.setPopupRef;
          typeof _ref$ === "function" ? _ref$(r$) : props.setPopupRef = r$;
        }
      });
    }
  }), !inPopup && web.createComponent(UserComp, {
    get compDetails() {
      return getCompDetails();
    },
    ref(r$) {
      const _ref$2 = props.setInlineRef;
      typeof _ref$2 === "function" ? _ref$2(r$) : props.setInlineRef = r$;
    }
  })];
};

const _tmpl$$7 = /*#__PURE__*/web.template(`<span role="presentation" class="ag-cell-value"></span>`, 2);
const ToolsComp = props => {
  const {
    context
  } = solidJs.useContext(BeansContext);
  const CompWrapper = innerProps => {
    const comp = innerProps.createFn();
    if (!comp) {
      return [];
    }
    solidJs.onCleanup(() => context.destroyBean(comp));
    return web.memo(() => comp.getGui());
  };
  return [web.memo((() => {
    const _c$ = web.memo(() => !!props.includeSelection);
    return () => _c$() && web.createComponent(CompWrapper, {
      createFn: () => {
        const checkboxSelectionComp = props.cellCtrl.createSelectionCheckbox();
        props.setSelectionCheckboxId(checkboxSelectionComp.getCheckboxId());
        return checkboxSelectionComp;
      }
    });
  })()), web.memo((() => {
    const _c$2 = web.memo(() => !!props.includeDndSource);
    return () => _c$2() && web.createComponent(CompWrapper, {
      createFn: () => props.cellCtrl.createDndSource()
    });
  })()), web.memo((() => {
    const _c$3 = web.memo(() => !!props.includeRowDrag);
    return () => _c$3() && web.createComponent(CompWrapper, {
      createFn: () => props.cellCtrl.createRowDragComp()
    });
  })())];
};
const ShowRenderDetails = props => {
  const getCompDetails = solidJs.createMemo(() => props.showDetails.compDetails);
  const isNoCompDetails = solidJs.createMemo(() => props.showDetails.compDetails == null);

  // if we didn't do this, objects would cause error. we depend on objects for things
  // like the aggregation functions avg and count, which return objects and depend on toString()
  // getting called.
  const valueForNoCellRenderer = () => {
    const value = props.showDetails.value;
    return value && value.toString ? value.toString() : value;
  };
  const bodyJsxFunc = () => [web.memo((() => {
    const _c$4 = web.memo(() => !!isNoCompDetails());
    return () => _c$4() && web.memo(valueForNoCellRenderer);
  })()), web.memo((() => {
    const _c$5 = web.memo(() => !!getCompDetails());
    return () => _c$5() && web.createComponent(UserComp, {
      get compDetails() {
        return getCompDetails();
      },
      ref(r$) {
        const _ref$ = props.ref;
        typeof _ref$ === "function" ? _ref$(r$) : props.ref = r$;
      }
    });
  })())];
  return [web.memo((() => {
    const _c$6 = web.memo(() => !!props.showTools);
    return () => _c$6() && web.createComponent(ToolsComp, {
      get includeDndSource() {
        return props.includeDndSource;
      },
      get includeRowDrag() {
        return props.includeRowDrag;
      },
      get includeSelection() {
        return props.includeSelection;
      },
      get setSelectionCheckboxId() {
        return props.setSelectionCheckboxId;
      },
      get cellCtrl() {
        return props.cellCtrl;
      }
    });
  })()), web.memo((() => {
    const _c$7 = web.memo(() => !!props.showCellWrapper);
    return () => _c$7() ? (() => {
      const _el$ = _tmpl$$7.cloneNode(true);
      const _ref$2 = props.setECellValue;
      typeof _ref$2 === "function" ? web.use(_ref$2, _el$) : props.setECellValue = _el$;
      web.insert(_el$, bodyJsxFunc);
      web.effect(() => web.setAttribute(_el$, "id", `cell-${props.cellInstanceId}`));
      return _el$;
    })() : bodyJsxFunc();
  })())];
};

const _tmpl$$6 = /*#__PURE__*/web.template(`<div> </div>`, 2),
  _tmpl$2$1 = /*#__PURE__*/web.template(`<div class="ag-cell-wrapper" role="presentation" aria-hidden="true"></div>`, 2);
const checkCellEditorDeprecations = (popup, cellEditor, cellCtrl) => {
  const col = cellCtrl.getColumn();

  // cellEditor is written to be a popup editor, however colDef.cellEditorPopup is not set
  if (!popup && cellEditor.isPopup && cellEditor.isPopup()) {
    const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using SolidJS, specify an editor is a popup using colDef.cellEditorPopup=true. AG Grid SolidJS cannot depend on the editor component specifying if it's in a popup (via the isPopup() method on the editor), as SolidJS needs to know this information BEFORE the component is created.`;
    agGridCommunity._.doOnce(() => console.warn(msg), 'jsEditorComp-isPopup-' + cellCtrl.getColumn().getColId());
  }

  // cellEditor is a popup and is trying to position itself the deprecated way
  if (popup && cellEditor.getPopupPosition && cellEditor.getPopupPosition() != null) {
    const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using SolidJS, specify an editor popup position using colDef.cellEditorPopupPosition=true. AG Grid SolidJS cannot depend on the editor component specifying it's position (via the getPopupPosition() method on the editor), as SolidJS needs to know this information BEFORE the component is created.`;
    agGridCommunity._.doOnce(() => console.warn(msg), 'jsEditorComp-getPopupPosition-' + cellCtrl.getColumn().getColId());
  }
};
const CellComp = props => {
  const {
    cellCtrl,
    printLayout,
    editingRow
  } = props;
  const [renderDetails, setRenderDetails] = solidJs.createSignal();
  const [editDetails, setEditDetails] = solidJs.createSignal();
  let renderCompVersion = 0;
  const [renderCompVersionList, setRenderCompVersionList] = solidJs.createSignal([renderCompVersion]);
  const [userStyles, setUserStyles] = solidJs.createSignal();
  const [tabIndex, setTabIndex] = solidJs.createSignal();
  const [role, setRole] = solidJs.createSignal();
  const [colId, setColId] = solidJs.createSignal();
  const [title, setTitle] = solidJs.createSignal();
  const [selectionCheckboxId, setSelectionCheckboxId] = solidJs.createSignal();
  const [includeSelection, setIncludeSelection] = solidJs.createSignal(false);
  const [includeRowDrag, setIncludeRowDrag] = solidJs.createSignal(false);
  const [includeDndSource, setIncludeDndSource] = solidJs.createSignal(false);
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
      setTimeout(() => {
        cellCtrl.stopEditing(true);
        cellCtrl.focusCell(true);
      });
    }
    const refAny = ref;
    if (refAny.afterGuiAttached) {
      setTimeout(() => refAny.afterGuiAttached(), 0);
    }
  };
  const setPopupEditorRef = ref => setEditorRef(true, ref);
  const setInlineEditorRef = ref => setEditorRef(false, ref);
  const cssClassManager = new agGridCommunity.CssClassManager(() => eGui);
  const showTools = solidJs.createMemo(() => renderDetails() != null && (includeSelection() || includeDndSource() || includeRowDrag()));
  const showCellWrapper = solidJs.createMemo(() => forceWrapper || showTools());
  const cellInstanceId = cellCtrl.getInstanceId();
  const ariaDescribedBy = solidJs.createMemo(() => {
    const cellId = `cell-${cellInstanceId}`;
    const describedByIds = [];
    if (includeSelection() && selectionCheckboxId()) {
      describedByIds.push(selectionCheckboxId());
    }
    describedByIds.push(cellId);
    return describedByIds.join(' ');
  });
  solidJs.onMount(() => {
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
  solidJs.createEffect(() => {
    const isEditing = !!editDetails();
    const isPopup = isEditing && !!editDetails()?.popup;
    cssClassManager.addOrRemoveCssClass('ag-cell-value', !showCellWrapper());
    cssClassManager.addOrRemoveCssClass('ag-cell-inline-editing', isEditing && !isPopup);
    cssClassManager.addOrRemoveCssClass('ag-cell-popup-editing', isEditing && isPopup);
    cssClassManager.addOrRemoveCssClass('ag-cell-not-inline-editing', !isEditing || isPopup);
    cellCtrl.getRowCtrl()?.setInlineEditingCss(isEditing);
  });

  // we only do refreshing for JS Comps. for SolidJS, the props will change for the cell renderer.
  let readyForRefresh = false;
  solidJs.createEffect(() => {
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
  });

  // we pass in eGui as a function below as eGui is not ready
  // when the template is built, only after it. so we defer
  // reading eGui variable until it's needed, after ShowEditDetails
  // is created.
  const eGuiFn = () => eGui;
  const bodyJsxFunc = () => [web.createComponent(solidJs.For, {
    get each() {
      return renderCompVersionList();
    },
    children: () => web.memo((() => {
      const _c$2 = web.memo(() => !!renderDetails());
      return () => _c$2() && web.createComponent(ShowRenderDetails, {
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
        setSelectionCheckboxId: setSelectionCheckboxId,
        get showTools() {
          return showTools();
        },
        setECellValue: setECellValue
      });
    })())
  }), web.memo((() => {
    const _c$ = web.memo(() => !!editDetails());
    return () => _c$() && web.createComponent(ShowEditDetails, {
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
    typeof _ref$2 === "function" ? web.use(_ref$2, _el$) : eGui = _el$;
    web.insert(_el$, (() => {
      const _c$3 = web.memo(() => !!showCellWrapper());
      return () => _c$3() ? (() => {
        const _el$3 = _tmpl$2$1.cloneNode(true);
        const _ref$3 = eCellWrapper;
        typeof _ref$3 === "function" ? web.use(_ref$3, _el$3) : eCellWrapper = _el$3;
        web.insert(_el$3, bodyJsxFunc);
        return _el$3;
      })() : bodyJsxFunc();
    })(), null);
    web.effect(_p$ => {
      const _v$ = userStyles(),
        _v$2 = tabIndex(),
        _v$3 = role(),
        _v$4 = colId(),
        _v$5 = title(),
        _v$6 = ariaDescribedBy();
      _p$._v$ = web.style(_el$, _v$, _p$._v$);
      _v$2 !== _p$._v$2 && web.setAttribute(_el$, "tabindex", _p$._v$2 = _v$2);
      _v$3 !== _p$._v$3 && web.setAttribute(_el$, "role", _p$._v$3 = _v$3);
      _v$4 !== _p$._v$4 && web.setAttribute(_el$, "col-id", _p$._v$4 = _v$4);
      _v$5 !== _p$._v$5 && web.setAttribute(_el$, "title", _p$._v$5 = _v$5);
      _v$6 !== _p$._v$6 && web.setAttribute(_el$, "aria-describedby", _p$._v$6 = _v$6);
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

const _tmpl$$5 = /*#__PURE__*/web.template(`<div></div>`, 2);
const maintainOrderOnColumns = (prev, next, domOrder) => {
  if (domOrder) {
    const res = {
      list: next,
      instanceIdMap: new Map()
    };
    next.forEach(c => res.instanceIdMap.set(c.getInstanceId(), c));
    return res;
  }

  // if dom order not important, we don't want to change the order
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
  const [getRowIndex, setRowIndex] = solidJs.createSignal();
  const [getRowId, setRowId] = solidJs.createSignal();
  const [getRole, setRole] = solidJs.createSignal();
  const [getRowBusinessKey, setRowBusinessKey] = solidJs.createSignal();
  const [getTabIndex, setTabIndex] = solidJs.createSignal();
  const [getUserStyles, setUserStyles] = solidJs.createSignal();
  const [getCellCtrls, setCellCtrls] = solidJs.createSignal({
    list: [],
    instanceIdMap: new Map()
  });
  const [getFullWidthCompDetails, setFullWidthCompDetails] = solidJs.createSignal();
  const [getDomOrder, setDomOrder] = solidJs.createSignal(false);

  // these styles have initial values, so element is placed into the DOM with them,
  // rather than an transition getting applied.
  const [getTop, setTop] = solidJs.createSignal(rowCtrl.getInitialRowTop(containerType));
  const [getTransform, setTransform] = solidJs.createSignal(rowCtrl.getInitialTransform(containerType));
  let eGui;
  let fullWidthCompRef;
  const setFullWidthRef = newRef => {
    fullWidthCompRef = newRef;
  };
  solidJs.createEffect(() => {
    const compDetails = getFullWidthCompDetails();
    if (!compDetails) {
      return;
    }
    let tryCount = 0;

    // puts autoHeight onto full with detail rows. this needs trickery, as we need
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
  solidJs.onMount(() => {
    // because React is asychronous, it's possible the RowCtrl is no longer a valid RowCtrl. This can
    // happen if user calls two API methods one after the other, with the second API invalidating the rows
    // the first call created. Thus the rows for the first call could still get created even though no longer needed.
    if (!rowCtrl.isAlive()) {
      return;
    }
    const cssClassManager = new agGridCommunity.CssClassManager(() => eGui);
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
    solidJs.onCleanup(() => rowCtrl.unsetComp(containerType));
  });
  const getRowStyles = solidJs.createMemo(() => {
    const res = {
      top: getTop(),
      transform: getTransform()
    };
    Object.assign(res, getUserStyles());
    return res;
  });
  const isShowCells = solidJs.createMemo(() => getCellCtrls() != null);
  const isShowFullWidth = solidJs.createMemo(() => getFullWidthCompDetails() != null);
  const showCellsJsx = () => web.createComponent(solidJs.For, {
    get each() {
      return getCellCtrls().list;
    },
    children: cellCtrl => web.createComponent(CellComp, {
      cellCtrl: cellCtrl,
      get editingRow() {
        return rowCtrl.isEditing();
      },
      get printLayout() {
        return rowCtrl.isPrintLayout();
      }
    })
  });
  const showFullWidthJsx = () => web.createComponent(UserComp, {
    get compDetails() {
      return getFullWidthCompDetails();
    },
    ref: setFullWidthRef
  });
  return (() => {
    const _el$ = _tmpl$$5.cloneNode(true);
    const _ref$ = eGui;
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : eGui = _el$;
    web.insert(_el$, (() => {
      const _c$ = web.memo(() => !!isShowFullWidth());
      return () => _c$() && showFullWidthJsx();
    })(), null);
    web.insert(_el$, (() => {
      const _c$2 = web.memo(() => !!isShowCells());
      return () => _c$2() && showCellsJsx();
    })(), null);
    web.effect(_p$ => {
      const _v$ = getRowStyles(),
        _v$2 = getRowIndex(),
        _v$3 = getRowId(),
        _v$4 = getRowBusinessKey(),
        _v$5 = getTabIndex();
      _p$._v$ = web.style(_el$, _v$, _p$._v$);
      _v$2 !== _p$._v$2 && web.setAttribute(_el$, "row-index", _p$._v$2 = _v$2);
      _v$3 !== _p$._v$3 && web.setAttribute(_el$, "row-id", _p$._v$3 = _v$3);
      _v$4 !== _p$._v$4 && web.setAttribute(_el$, "row-business-key", _p$._v$4 = _v$4);
      _v$5 !== _p$._v$5 && web.setAttribute(_el$, "tabindex", _p$._v$5 = _v$5);
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

const _tmpl$$4 = /*#__PURE__*/web.template(`<div></div>`, 2),
  _tmpl$2 = /*#__PURE__*/web.template(`<div role="presentation"><div role="presentation"></div></div>`, 4),
  _tmpl$3 = /*#__PURE__*/web.template(`<div role="presentation"></div>`, 2);
const RowContainerComp = props => {
  const {
    context
  } = solidJs.useContext(BeansContext);
  const [viewportHeight, setViewportHeight] = solidJs.createSignal('');
  const [rowCtrlsOrdered, setRowCtrlsOrdered] = solidJs.createSignal([]);
  const [rowCtrls, setRowCtrls] = solidJs.createSignal([]);
  const [domOrder, setDomOrder] = solidJs.createSignal(false);
  const [containerWidth, setContainerWidth] = solidJs.createSignal('');
  const {
    name
  } = props;
  const containerType = solidJs.createMemo(() => agGridCommunity.getRowContainerTypeForName(name));
  let eWrapper;
  let eViewport;
  let eContainer;
  const cssClasses = solidJs.createMemo(() => agGridCommunity.RowContainerCtrl.getRowContainerCssClasses(name));
  const wrapperClasses = solidJs.createMemo(() => classesList(cssClasses().wrapper));
  const viewportClasses = solidJs.createMemo(() => classesList(cssClasses().viewport));
  const containerClasses = solidJs.createMemo(() => classesList(cssClasses().container));

  // no need to useMemo for boolean types
  const template1 = name === agGridCommunity.RowContainerName.CENTER;
  const template2 = name === agGridCommunity.RowContainerName.TOP_CENTER || name === agGridCommunity.RowContainerName.BOTTOM_CENTER || name === agGridCommunity.RowContainerName.STICKY_TOP_CENTER;
  const template3 = !template1 && !template2;

  // if domOrder=true, then we just copy rowCtrls into rowCtrlsOrdered observing order,
  // however if false, then we need to keep the order as they are in the dom, otherwise rowAnimation breaks
  let rowCtrlsOrderedCopy = [];
  solidJs.createEffect(() => {
    if (domOrder()) {
      setRowCtrlsOrdered(rowCtrls());
      return;
    }
    // if dom order not important, we don't want to change the order
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
  solidJs.onMount(() => {
    const compProxy = {
      setViewportHeight: setViewportHeight,
      setRowCtrls: rowCtrls => setRowCtrls(rowCtrls),
      setDomOrder: domOrder => setDomOrder(domOrder),
      setContainerWidth: width => setContainerWidth(width)
    };
    const ctrl = context.createBean(new agGridCommunity.RowContainerCtrl(name));
    solidJs.onCleanup(() => context.destroyBean(ctrl));
    ctrl.setComp(compProxy, eContainer, eViewport, eWrapper);
  });
  const viewportStyle = solidJs.createMemo(() => ({
    height: viewportHeight()
  }));
  const containerStyle = solidJs.createMemo(() => ({
    width: containerWidth()
  }));
  const buildContainer = () => (() => {
    const _el$ = _tmpl$$4.cloneNode(true);
    const _ref$ = eContainer;
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : eContainer = _el$;
    web.insert(_el$, web.createComponent(solidJs.For, {
      get each() {
        return rowCtrlsOrdered();
      },
      children: (rowCtrl, i) => web.createComponent(RowComp, {
        rowCtrl: rowCtrl,
        get containerType() {
          return containerType();
        }
      })
    }));
    web.effect(_p$ => {
      const _v$ = containerClasses(),
        _v$2 = rowCtrls().length ? "rowgroup" : "presentation",
        _v$3 = containerStyle();
      _v$ !== _p$._v$ && web.className(_el$, _p$._v$ = _v$);
      _v$2 !== _p$._v$2 && web.setAttribute(_el$, "role", _p$._v$2 = _v$2);
      _p$._v$3 = web.style(_el$, _v$3, _p$._v$3);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined,
      _v$3: undefined
    });
    return _el$;
  })();
  return [template1 && (() => {
    const _el$2 = _tmpl$2.cloneNode(true),
      _el$3 = _el$2.firstChild;
    const _ref$2 = eWrapper;
    typeof _ref$2 === "function" ? web.use(_ref$2, _el$2) : eWrapper = _el$2;
    const _ref$3 = eViewport;
    typeof _ref$3 === "function" ? web.use(_ref$3, _el$3) : eViewport = _el$3;
    web.insert(_el$3, buildContainer);
    web.effect(_p$ => {
      const _v$4 = wrapperClasses(),
        _v$5 = viewportClasses(),
        _v$6 = viewportStyle();
      _v$4 !== _p$._v$4 && web.className(_el$2, _p$._v$4 = _v$4);
      _v$5 !== _p$._v$5 && web.className(_el$3, _p$._v$5 = _v$5);
      _p$._v$6 = web.style(_el$3, _v$6, _p$._v$6);
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
    typeof _ref$4 === "function" ? web.use(_ref$4, _el$4) : eViewport = _el$4;
    web.insert(_el$4, buildContainer);
    web.effect(_p$ => {
      const _v$7 = viewportClasses(),
        _v$8 = viewportStyle();
      _v$7 !== _p$._v$7 && web.className(_el$4, _p$._v$7 = _v$7);
      _p$._v$8 = web.style(_el$4, _v$8, _p$._v$8);
      return _p$;
    }, {
      _v$7: undefined,
      _v$8: undefined
    });
    return _el$4;
  })(), web.memo(() => template3 && buildContainer())];
};

const _tmpl$$3 = /*#__PURE__*/web.template(`<div role="treegrid"><div role="presentation"></div><div role="presentation"><div role="presentation"><div role="presentation"></div></div></div><div role="presentation"></div><div role="presentation"></div></div>`, 14);
const GridBodyComp = () => {
  const {
    context,
    agStackComponentsRegistry,
    resizeObserverService
  } = solidJs.useContext(BeansContext);
  const [getRowAnimationClass, setRowAnimationClass] = solidJs.createSignal('');
  const [getAriaColCount, setAriaColCount] = solidJs.createSignal(0);
  const [getAriaRowCount, setAriaRowCount] = solidJs.createSignal(0);
  const [getTopHeight, setTopHeight] = solidJs.createSignal(0);
  const [getBottomHeight, setBottomHeight] = solidJs.createSignal(0);
  const [getStickyTopHeight, setStickyTopHeight] = solidJs.createSignal('0px');
  const [getStickyTopTop, setStickyTopTop] = solidJs.createSignal('0px');
  const [getStickyTopWidth, setStickyTopWidth] = solidJs.createSignal('100%');
  const [getTopDisplay, setTopDisplay] = solidJs.createSignal('');
  const [getBottomDisplay, setBottomDisplay] = solidJs.createSignal('');
  const [getBodyViewportWidth, setBodyViewportWidth] = solidJs.createSignal('');
  const [getMovingCss, setMovingCss] = solidJs.createSignal(null);
  const [getForceVerticalScrollClass, setForceVerticalScrollClass] = solidJs.createSignal(null);
  const [getTopAndBottomOverflowY, setTopAndBottomOverflowY] = solidJs.createSignal('');
  const [getCellSelectableCss, setCellSelectableCss] = solidJs.createSignal(null);

  // we initialise layoutClass to 'ag-layout-normal', because if we don't, the comp will initially
  // render with no width (as ag-layout-normal sets width to 0, which is needed for flex) which
  // gives the grid a massive width, which then renders a massive amount of columns. this problem
  // is due to React been async, for the non-async version (ie when not using React) this is not a
  // problem as the UI will finish initialising before we set data.
  const [getLayoutClass, setLayoutClass] = solidJs.createSignal('ag-layout-normal');
  let eRoot;
  let eTop;
  let eStickyTop;
  let eBody;
  let eBodyViewport;
  let eBottom;
  const destroyFuncs = [];
  solidJs.onCleanup(() => {
    destroyFuncs.forEach(f => f());
    destroyFuncs.length = 0;
  });
  solidJs.onMount(() => {
    if (!context) {
      return;
    }
    const newComp = tag => {
      const CompClass = agStackComponentsRegistry.getComponentClass(tag);
      const comp = context.createBean(new CompClass());
      solidJs.onCleanup(() => context.destroyBean(comp));
      return comp;
    };
    eRoot.appendChild(newComp('AG-FAKE-HORIZONTAL-SCROLL').getGui());
    eRoot.appendChild(newComp('AG-OVERLAY-WRAPPER').getGui());
    eBody.appendChild(newComp('AG-FAKE-VERTICAL-SCROLL').getGui());
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
      setBodyViewportWidth: setBodyViewportWidth,
      registerBodyViewportResizeListener: listener => {
        const unsubscribeFromResize = resizeObserverService.observeResize(eBodyViewport, listener);
        destroyFuncs.push(() => unsubscribeFromResize());
      }
    };
    const ctrl = context.createBean(new agGridCommunity.GridBodyCtrl());
    solidJs.onCleanup(() => context.destroyBean(ctrl));

    // fixme - should not be in a timeout,
    // was becusae we need GridHeaderComp to be created first
    setTimeout(() => ctrl.setComp(compProxy, eRoot, eBodyViewport, eTop, eBottom, eStickyTop), 0);
  });
  const getRootClasses = solidJs.createMemo(() => classesList('ag-root', 'ag-unselectable', getMovingCss(), getLayoutClass()));
  const getBodyClasses = solidJs.createMemo(() => classesList('ag-body', getLayoutClass()));
  const getBodyClipperClasses = solidJs.createMemo(() => classesList('ag-body-clipper', getLayoutClass()));
  const getBodyViewportClasses = solidJs.createMemo(() => classesList('ag-body-viewport', getRowAnimationClass(), getLayoutClass(), getForceVerticalScrollClass(), getCellSelectableCss()));
  const getTopClasses = solidJs.createMemo(() => classesList('ag-floating-top', getCellSelectableCss()));
  const getStickyTopClasses = solidJs.createMemo(() => classesList('ag-sticky-top', getCellSelectableCss()));
  const getBottomClasses = solidJs.createMemo(() => classesList('ag-floating-bottom', getCellSelectableCss()));
  const getTopStyle = solidJs.createMemo(() => ({
    height: getTopHeight,
    'min-height': getTopHeight,
    display: getTopDisplay,
    'overflow-y': getTopAndBottomOverflowY
  }));
  const getStickyTopStyle = solidJs.createMemo(() => ({
    height: getStickyTopHeight,
    top: getStickyTopTop,
    width: getStickyTopWidth
  }));
  const getBottomStyle = solidJs.createMemo(() => ({
    height: getBottomHeight,
    'min-height': getBottomHeight,
    display: getBottomDisplay,
    'overflow-y': getTopAndBottomOverflowY
  }));
  const getBodyViewportStyle = solidJs.createMemo(() => ({
    width: getBodyViewportWidth()
  }));
  return (() => {
    const _el$ = _tmpl$$3.cloneNode(true),
      _el$2 = _el$.firstChild,
      _el$3 = _el$2.nextSibling,
      _el$4 = _el$3.firstChild,
      _el$5 = _el$4.firstChild,
      _el$6 = _el$3.nextSibling,
      _el$7 = _el$6.nextSibling;
    const _ref$ = eRoot;
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : eRoot = _el$;
    web.insert(_el$, web.createComponent(GridHeaderComp, {}), _el$2);
    const _ref$2 = eTop;
    typeof _ref$2 === "function" ? web.use(_ref$2, _el$2) : eTop = _el$2;
    web.insert(_el$2, web.createComponent(RowContainerComp, {
      get name() {
        return agGridCommunity.RowContainerName.TOP_LEFT;
      }
    }), null);
    web.insert(_el$2, web.createComponent(RowContainerComp, {
      get name() {
        return agGridCommunity.RowContainerName.TOP_CENTER;
      }
    }), null);
    web.insert(_el$2, web.createComponent(RowContainerComp, {
      get name() {
        return agGridCommunity.RowContainerName.TOP_RIGHT;
      }
    }), null);
    web.insert(_el$2, web.createComponent(RowContainerComp, {
      get name() {
        return agGridCommunity.RowContainerName.TOP_FULL_WIDTH;
      }
    }), null);
    const _ref$3 = eBody;
    typeof _ref$3 === "function" ? web.use(_ref$3, _el$3) : eBody = _el$3;
    const _ref$4 = eBodyViewport;
    typeof _ref$4 === "function" ? web.use(_ref$4, _el$5) : eBodyViewport = _el$5;
    web.insert(_el$5, web.createComponent(RowContainerComp, {
      get name() {
        return agGridCommunity.RowContainerName.LEFT;
      }
    }), null);
    web.insert(_el$5, web.createComponent(RowContainerComp, {
      get name() {
        return agGridCommunity.RowContainerName.CENTER;
      }
    }), null);
    web.insert(_el$5, web.createComponent(RowContainerComp, {
      get name() {
        return agGridCommunity.RowContainerName.RIGHT;
      }
    }), null);
    web.insert(_el$5, web.createComponent(RowContainerComp, {
      get name() {
        return agGridCommunity.RowContainerName.FULL_WIDTH;
      }
    }), null);
    const _ref$5 = eStickyTop;
    typeof _ref$5 === "function" ? web.use(_ref$5, _el$6) : eStickyTop = _el$6;
    web.insert(_el$6, web.createComponent(RowContainerComp, {
      get name() {
        return agGridCommunity.RowContainerName.STICKY_TOP_LEFT;
      }
    }), null);
    web.insert(_el$6, web.createComponent(RowContainerComp, {
      get name() {
        return agGridCommunity.RowContainerName.STICKY_TOP_CENTER;
      }
    }), null);
    web.insert(_el$6, web.createComponent(RowContainerComp, {
      get name() {
        return agGridCommunity.RowContainerName.STICKY_TOP_RIGHT;
      }
    }), null);
    web.insert(_el$6, web.createComponent(RowContainerComp, {
      get name() {
        return agGridCommunity.RowContainerName.STICKY_TOP_FULL_WIDTH;
      }
    }), null);
    const _ref$6 = eBottom;
    typeof _ref$6 === "function" ? web.use(_ref$6, _el$7) : eBottom = _el$7;
    web.insert(_el$7, web.createComponent(RowContainerComp, {
      get name() {
        return agGridCommunity.RowContainerName.BOTTOM_LEFT;
      }
    }), null);
    web.insert(_el$7, web.createComponent(RowContainerComp, {
      get name() {
        return agGridCommunity.RowContainerName.BOTTOM_CENTER;
      }
    }), null);
    web.insert(_el$7, web.createComponent(RowContainerComp, {
      get name() {
        return agGridCommunity.RowContainerName.BOTTOM_RIGHT;
      }
    }), null);
    web.insert(_el$7, web.createComponent(RowContainerComp, {
      get name() {
        return agGridCommunity.RowContainerName.BOTTOM_FULL_WIDTH;
      }
    }), null);
    web.effect(_p$ => {
      const _v$ = getRootClasses(),
        _v$2 = getAriaColCount(),
        _v$3 = getAriaRowCount(),
        _v$4 = getTopClasses(),
        _v$5 = getTopStyle(),
        _v$6 = getBodyClasses(),
        _v$7 = getBodyClipperClasses(),
        _v$8 = getBodyViewportClasses(),
        _v$9 = getBodyViewportStyle(),
        _v$10 = getStickyTopClasses(),
        _v$11 = getStickyTopStyle(),
        _v$12 = getBottomClasses(),
        _v$13 = getBottomStyle();
      _v$ !== _p$._v$ && web.className(_el$, _p$._v$ = _v$);
      _v$2 !== _p$._v$2 && web.setAttribute(_el$, "aria-colcount", _p$._v$2 = _v$2);
      _v$3 !== _p$._v$3 && web.setAttribute(_el$, "aria-rowcount", _p$._v$3 = _v$3);
      _v$4 !== _p$._v$4 && web.className(_el$2, _p$._v$4 = _v$4);
      _p$._v$5 = web.style(_el$2, _v$5, _p$._v$5);
      _v$6 !== _p$._v$6 && web.className(_el$3, _p$._v$6 = _v$6);
      _v$7 !== _p$._v$7 && web.className(_el$4, _p$._v$7 = _v$7);
      _v$8 !== _p$._v$8 && web.className(_el$5, _p$._v$8 = _v$8);
      _p$._v$9 = web.style(_el$5, _v$9, _p$._v$9);
      _v$10 !== _p$._v$10 && web.className(_el$6, _p$._v$10 = _v$10);
      _p$._v$11 = web.style(_el$6, _v$11, _p$._v$11);
      _v$12 !== _p$._v$12 && web.className(_el$7, _p$._v$12 = _v$12);
      _p$._v$13 = web.style(_el$7, _v$13, _p$._v$13);
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
      _v$10: undefined,
      _v$11: undefined,
      _v$12: undefined,
      _v$13: undefined
    });
    return _el$;
  })();
};

const _tmpl$$2 = /*#__PURE__*/web.template(`<div role="presentation"></div>`, 2);
const TabGuardComp = props => {
  const {
    children,
    eFocusableElement,
    onTabKeyDown,
    gridCtrl
  } = props;
  const [tabIndex, setTabIndex] = solidJs.createSignal();
  let eTopGuard;
  let eBottomGuard;
  let ctrl;
  const {
    context
  } = solidJs.useContext(BeansContext);
  solidJs.onMount(() => {
    const compProxy = {
      setTabIndex: value => value == null ? setTabIndex(undefined) : setTabIndex(parseInt(value, 10))
    };
    ctrl = context.createBean(new agGridCommunity.TabGuardCtrl({
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
  solidJs.onCleanup(() => context.destroyBean(ctrl));
  return [(() => {
    const _el$ = _tmpl$$2.cloneNode(true);
    const _ref$ = eTopGuard;
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : eTopGuard = _el$;
    web.effect(_p$ => {
      const _v$ = `${agGridCommunity.TabGuardClassNames.TAB_GUARD} ${agGridCommunity.TabGuardClassNames.TAB_GUARD_TOP}`,
        _v$2 = tabIndex();
      _v$ !== _p$._v$ && web.className(_el$, _p$._v$ = _v$);
      _v$2 !== _p$._v$2 && web.setAttribute(_el$, "tabindex", _p$._v$2 = _v$2);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined
    });
    return _el$;
  })(), children, (() => {
    const _el$2 = _tmpl$$2.cloneNode(true);
    const _ref$2 = eBottomGuard;
    typeof _ref$2 === "function" ? web.use(_ref$2, _el$2) : eBottomGuard = _el$2;
    web.effect(_p$ => {
      const _v$3 = `${agGridCommunity.TabGuardClassNames.TAB_GUARD} ${agGridCommunity.TabGuardClassNames.TAB_GUARD_BOTTOM}`,
        _v$4 = tabIndex();
      _v$3 !== _p$._v$3 && web.className(_el$2, _p$._v$3 = _v$3);
      _v$4 !== _p$._v$4 && web.setAttribute(_el$2, "tabindex", _p$._v$4 = _v$4);
      return _p$;
    }, {
      _v$3: undefined,
      _v$4: undefined
    });
    return _el$2;
  })()];
};

const _tmpl$$1 = /*#__PURE__*/web.template(`<div><div></div></div>`, 4);
const GridComp = props => {
  const [rtlClass, setRtlClass] = solidJs.createSignal('');
  const [keyboardFocusClass, setKeyboardFocusClass] = solidJs.createSignal('');
  const [layoutClass, setLayoutClass] = solidJs.createSignal('');
  const [cursor, setCursor] = solidJs.createSignal(null);
  const [userSelect, setUserSelect] = solidJs.createSignal(null);
  const [initialised, setInitialised] = solidJs.createSignal(false);
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
  solidJs.onCleanup(() => {
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
  solidJs.onMount(() => {
    gridCtrl = context.createBean(new agGridCommunity.GridCtrl());
    destroyFuncs.push(() => context.destroyBean(gridCtrl));
    const compProxy = {
      destroyGridUi: () => {},
      // do nothing, as framework users destroy grid by removing the comp
      setRtlClass: setRtlClass,
      addOrRemoveKeyboardFocusClass: addOrRemove => setKeyboardFocusClass(addOrRemove ? agGridCommunity.FocusService.AG_KEYBOARD_FOCUS : ''),
      forceFocusOutOfContainer: () => {
        tabGuardRef && tabGuardRef.forceFocusOutOfContainer();
      },
      updateLayoutClasses: setLayoutClass,
      getFocusableContainers: () => {
        const els = [];
        const gridBodyCompEl = eGui.querySelector('.ag-root');
        const sideBarEl = eGui.querySelector('.ag-side-bar:not(.ag-hidden)');
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
  const cssClasses = solidJs.createMemo(() => classesList('ag-root-wrapper', rtlClass(), keyboardFocusClass(), layoutClass(), props.class));
  const bodyCssClasses = solidJs.createMemo(() => classesList('ag-root-wrapper-body', 'ag-focus-managed', layoutClass()));
  const topStyle = solidJs.createMemo(() => ({
    userSelect: userSelect != null ? userSelect : '',
    WebkitUserSelect: userSelect != null ? userSelect : '',
    cursor: cursor != null ? cursor : ''
  }));
  return (() => {
    const _el$ = _tmpl$$1.cloneNode(true),
      _el$2 = _el$.firstChild;
    const _ref$ = eGui;
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : eGui = _el$;
    const _ref$2 = eBody;
    typeof _ref$2 === "function" ? web.use(_ref$2, _el$2) : eBody = _el$2;
    web.insert(_el$2, (() => {
      const _c$ = web.memo(() => !!initialised());
      return () => _c$() && // we wait for initialised before rending the children, so GridComp has created and registered with it's
      // GridCtrl before we create the child GridBodyComp. Otherwise the GridBodyComp would initialise first,
      // before we have set the the Layout CSS classes, causing the GridBodyComp to render rows to a grid that
      // doesn't have it's height specified, which would result if all the rows getting rendered (and if many rows,
      // hangs the UI)
      web.createComponent(BeansContext.Provider, {
        value: beans,
        get children() {
          return web.createComponent(TabGuardComp, {
            ref: setTabGuardRef,
            eFocusableElement: eGui,
            onTabKeyDown: onTabKeyDown,
            gridCtrl: gridCtrl,
            get children() {
              return web.createComponent(GridBodyComp, {});
            }
          });
        }
      });
    })());
    web.effect(_p$ => {
      const _v$ = cssClasses(),
        _v$2 = topStyle(),
        _v$3 = bodyCssClasses();
      _v$ !== _p$._v$ && web.className(_el$, _p$._v$ = _v$);
      _p$._v$2 = web.style(_el$, _v$2, _p$._v$2);
      _v$3 !== _p$._v$3 && web.className(_el$2, _p$._v$3 = _v$3);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined,
      _v$3: undefined
    });
    return _el$;
  })();
};

const _tmpl$ = /*#__PURE__*/web.template(`<div></div>`, 2);
const AgGridSolid = props => {
  let eGui;
  let gridOptions;
  const [context, setContext] = solidJs.createSignal();
  const [getPortals, setPortals] = solidJs.createSignal([]);
  const destroyFuncs = [];
  solidJs.onCleanup(() => {
    destroyFuncs.forEach(f => f());
    destroyFuncs.length = 0;
  });

  // we check for property changes. to get things started, we take a copy
  // of all the properties at the start, and then compare against this for
  // changes.
  const propsCopy = {};
  Object.keys(props).forEach(key => propsCopy[key] = props[key]);
  solidJs.createEffect(() => {
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
      agGridCommunity.ComponentUtil.processOnChange(changes, gridOptions.api);
    }
  });
  solidJs.onMount(() => {
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
    agGridCommunity.ComponentUtil.copyAttributesToGridOptions(gridOptions, props);
    const createUiCallback = context => {
      setContext(context);
      // because React is Async, we need to wait for the UI to be initialised before exposing the API's
      const ctrlsService = context.getBean(agGridCommunity.CtrlsService.NAME);
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
    const acceptChangesCallback = () => {
      // todo, what goes here?
    };
    const gridCoreCreator = new agGridCommunity.GridCoreCreator();
    gridCoreCreator.create(eGui, gridOptions, createUiCallback, acceptChangesCallback, gridParams);
  });
  return (() => {
    const _el$ = _tmpl$.cloneNode(true);
    const _ref$ = eGui;
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : eGui = _el$;
    _el$.style.setProperty("height", "100%");
    web.insert(_el$, (() => {
      const _c$ = web.memo(() => !!context());
      return () => _c$() && web.createComponent(GridComp, {
        get ["class"]() {
          return props.class;
        },
        get context() {
          return context();
        }
      });
    })(), null);
    web.insert(_el$, web.createComponent(solidJs.For, {
      get each() {
        return getPortals();
      },
      children: (info, i) => web.createComponent(web.Portal, {
        get mount() {
          return info.mount;
        },
        get children() {
          return web.createComponent(info.SolidClass, web.mergeProps(() => info.props, {
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

// /* @refresh reload */
// import { render } from 'solid-js/web';
//
// import './index.css';
// import App from './sampleApp/App';
//
// render(() => <App />, document.getElementById('root') as HTMLElement);

module.exports = AgGridSolid;
//# sourceMappingURL=index.js.map
