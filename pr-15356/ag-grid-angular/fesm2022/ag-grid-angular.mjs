import * as i0 from '@angular/core';
import { inject, ViewContainerRef, Component, Injectable, NgZone, EventEmitter, booleanAttribute, Output, Input, ViewEncapsulation, NgModule } from '@angular/core';
import { BaseComponentWrapper, VanillaFrameworkOverrides, _combineAttributesAndGridOptions, createGrid, _processOnChange, _BOOLEAN_MIXED_GRID_OPTIONS } from 'ag-grid-community';
import { _removeFromParent } from 'ag-stack';

// To speed up the removal of custom components we create a number of shards to contain them.
// Removing a single component calls a function within Angular called removeFromArray.
// This is a lot faster if the array is smaller.
class AgComponentContainer {
    constructor() {
        this.vcr = inject(ViewContainerRef);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.30", ngImport: i0, type: AgComponentContainer, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.30", type: AgComponentContainer, isStandalone: true, selector: "ag-component-container", ngImport: i0, template: '', isInline: true }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.30", ngImport: i0, type: AgComponentContainer, decorators: [{
            type: Component,
            args: [{
                    selector: 'ag-component-container',
                    template: '',
                }]
        }] });
const NUM_SHARDS = 16;
let shardIdx = 0;
function createComponentContainers(vcr) {
    const containerMap = new Map();
    for (let i = 0; i < NUM_SHARDS; i++) {
        const container = vcr.createComponent(AgComponentContainer);
        containerMap.set(i, container);
        _removeFromParent(container.location.nativeElement);
    }
    return containerMap;
}
/**
 * These methods are called on a hot path for every row so we do not want to enter / exit NgZone each time.
 * Also these methods should not be used to update the UI, so we don't need to run them inside Angular.
 */
const runOutsideMethods = new Set(['doesFilterPass', 'isFilterActive']);
class AngularFrameworkComponentWrapper extends BaseComponentWrapper {
    setViewContainerRef(viewContainerRef, angularFrameworkOverrides) {
        this.viewContainerRef = viewContainerRef;
        this.angularFrameworkOverrides = angularFrameworkOverrides;
    }
    createWrapper(OriginalConstructor) {
        const angularFrameworkOverrides = this.angularFrameworkOverrides;
        const that = this;
        that.compShards ??= createComponentContainers(this.viewContainerRef);
        class DynamicAgNg2Component extends BaseGuiComponent {
            init(params) {
                angularFrameworkOverrides.runInsideAngular(() => {
                    super.init(params);
                    this._componentRef.changeDetectorRef.detectChanges();
                });
            }
            createComponent() {
                return that.createComponent(OriginalConstructor);
            }
            hasMethod(name) {
                return wrapper.getFrameworkComponentInstance()[name] != null;
            }
            callMethod(name, args) {
                const componentRef = this.getFrameworkComponentInstance();
                const methodCall = componentRef[name];
                if (runOutsideMethods.has(name)) {
                    return methodCall.apply(componentRef, args);
                }
                return angularFrameworkOverrides.runInsideAngular(() => methodCall.apply(componentRef, args));
            }
            addMethod(name, callback) {
                wrapper[name] = callback;
            }
        }
        const wrapper = new DynamicAgNg2Component();
        return wrapper;
    }
    createComponent(componentType) {
        shardIdx = (shardIdx + 1) % NUM_SHARDS;
        const container = this.compShards.get(shardIdx);
        return container.instance.vcr.createComponent(componentType);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.30", ngImport: i0, type: AngularFrameworkComponentWrapper, deps: null, target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.30", ngImport: i0, type: AngularFrameworkComponentWrapper }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.30", ngImport: i0, type: AngularFrameworkComponentWrapper, decorators: [{
            type: Injectable
        }] });
class BaseGuiComponent {
    init(params) {
        this._params = params;
        this._componentRef = this.createComponent();
        this._agAwareComponent = this._componentRef.instance;
        this._frameworkComponentInstance = this._componentRef.instance;
        this._eGui = this._componentRef.location.nativeElement;
        // Angular appends the component to the DOM, so remove it
        _removeFromParent(this._eGui);
        this._agAwareComponent.agInit(this._params);
    }
    getGui() {
        return this._eGui;
    }
    /** `getGui()` returns the `ng-component` element. This returns the actual root element. */
    getRootElement() {
        const firstChild = this._eGui.firstChild;
        return firstChild;
    }
    destroy() {
        if (this._frameworkComponentInstance && typeof this._frameworkComponentInstance.destroy === 'function') {
            this._frameworkComponentInstance.destroy();
        }
        this._componentRef?.destroy();
    }
    getFrameworkComponentInstance() {
        return this._frameworkComponentInstance;
    }
}

class AngularFrameworkEventListenerService {
    constructor(frameworkOverrides) {
        this.frameworkOverrides = frameworkOverrides;
        // Map from user listener to wrapped listener so we can remove listener provided by user
        this.wrappedListeners = new Map();
        this.wrappedGlobalListeners = new Map();
    }
    wrap(eventType, userListener) {
        const { frameworkOverrides, wrappedListeners } = this;
        let listener = userListener;
        if (frameworkOverrides.shouldWrapOutgoing) {
            listener = (event) => {
                frameworkOverrides.wrapOutgoing(() => userListener(event));
            };
            let eventListeners = wrappedListeners.get(eventType);
            if (!eventListeners) {
                eventListeners = new Map();
                wrappedListeners.set(eventType, eventListeners);
            }
            eventListeners.set(userListener, listener);
        }
        return listener;
    }
    wrapGlobal(userListener) {
        const { frameworkOverrides, wrappedGlobalListeners } = this;
        let listener = userListener;
        if (frameworkOverrides.shouldWrapOutgoing) {
            listener = (eventType, event) => {
                frameworkOverrides.wrapOutgoing(() => userListener(eventType, event));
            };
            wrappedGlobalListeners.set(userListener, listener);
        }
        return listener;
    }
    unwrap(eventType, userListener) {
        const { wrappedListeners } = this;
        const eventListeners = wrappedListeners.get(eventType);
        if (eventListeners) {
            const wrapped = eventListeners.get(userListener);
            if (wrapped) {
                eventListeners.delete(userListener);
                if (eventListeners.size === 0) {
                    wrappedListeners.delete(eventType);
                }
                return wrapped;
            }
        }
        return userListener;
    }
    unwrapGlobal(userListener) {
        const { wrappedGlobalListeners } = this;
        const wrapped = wrappedGlobalListeners.get(userListener);
        if (wrapped) {
            wrappedGlobalListeners.delete(userListener);
            return wrapped;
        }
        return userListener;
    }
}

class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor(_ngZone) {
        super('angular');
        this._ngZone = _ngZone;
        this.batchFrameworkComps = true;
        // Flag used to control Zone behaviour when running tests as many test features rely on Zone.
        this.isRunningWithinTestZone = false;
        // Make all events run outside Angular as they often trigger the setup of event listeners
        // By having the event listeners outside Angular we can avoid triggering change detection
        // This also means that if a user calls an AG Grid API method from within their component
        // the internal side effects will not trigger change detection. Without this the events would
        // run inside Angular and trigger change detection as the source of the event was within the angular zone.
        this.wrapIncoming = (callback, source) => this.runOutside(callback, source);
        /**
         * Make sure that any code that is executed outside of AG Grid is running within the Angular zone.
         * This means users can update templates and use binding without having to do anything extra.
         */
        this.wrapOutgoing = (callback) => this.runInsideAngular(callback);
        this.isRunningWithinTestZone =
            window?.AG_GRID_UNDER_TEST ?? !!window?.Zone?.AsyncTestZoneSpec;
        if (!this._ngZone) {
            this.runOutside = (callback) => callback();
        }
        else if (this.isRunningWithinTestZone) {
            this.runOutside = (callback, source) => {
                if (source === 'resize-observer' || source === 'popupPositioning') {
                    // ensure resize observer callbacks are run outside of Angular even under test due to Jest not supporting ResizeObserver
                    // which means it just loops continuously with a setTimeout with no way to flush the queue or have fixture.whenStable() resolve.
                    return this._ngZone.runOutsideAngular(callback);
                }
                // When under test run inside Angular so that tests can use fixture.whenStable() to wait for async operations to complete.
                return callback();
            };
        }
        else {
            this.runOutside = (callback) => this._ngZone.runOutsideAngular(callback);
        }
    }
    /**
     * The shouldWrapOutgoing property is used to determine if events should be run outside of Angular or not.
     * If an event handler is registered outside of Angular then we should not wrap the event handler
     * with runInsideAngular() as the user may not have wanted this.
     * This is also used to not wrap internal event listeners that are registered with RowNodes and Columns.
     */
    get shouldWrapOutgoing() {
        return this._ngZone && NgZone.isInAngularZone();
    }
    createLocalEventListenerWrapper(existingFrameworkEventListenerService, localEventService) {
        if (this.shouldWrapOutgoing) {
            return (existingFrameworkEventListenerService ??
                (() => {
                    localEventService.setFrameworkOverrides(this);
                    return new AngularFrameworkEventListenerService(this);
                })());
        }
        return undefined;
    }
    createGlobalEventListenerWrapper() {
        return new AngularFrameworkEventListenerService(this);
    }
    isFrameworkComponent(comp) {
        if (!comp) {
            return false;
        }
        const prototype = comp.prototype;
        return prototype && 'agInit' in prototype;
    }
    runInsideAngular(callback) {
        if (!this._ngZone || NgZone.isInAngularZone()) {
            return callback();
        }
        // Check for _ngZone existence as it is not present when Zoneless
        return this._ngZone.run(callback);
    }
    runOutsideAngular(callback, source) {
        return this.runOutside(callback, source);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.30", ngImport: i0, type: AngularFrameworkOverrides, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.30", ngImport: i0, type: AngularFrameworkOverrides }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.30", ngImport: i0, type: AngularFrameworkOverrides, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i0.NgZone }] });

/* eslint-disable no-duplicate-imports */
// False positive lint error, ElementRef and co can't be type imports
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
class AgGridAngular {
    constructor(elementDef, _viewContainerRef, _angularFrameworkOverrides, _frameworkCompWrapper) {
        this._viewContainerRef = _viewContainerRef;
        this._angularFrameworkOverrides = _angularFrameworkOverrides;
        this._frameworkCompWrapper = _frameworkCompWrapper;
        this._initialised = false;
        this._destroyed = false;
        // in order to ensure firing of gridReady is deterministic
        this._holdEvents = true;
        this._fullyReady = new Promise((resolve) => {
            this._resolveFullyReady = resolve;
        });
        // @START@
        /** Specifies the toolbar items to use in the toolbar.
         * @agModule `ToolbarModule`
         */
        this.toolbar = undefined;
        /** Specifies the status bar components to use in the status bar.
         * @agModule `StatusBarModule`
         */
        this.statusBar = undefined;
        /** Specifies the side bar components.
         * @agModule `SideBarModule`
         */
        this.sideBar = undefined;
        /** Set to `true` to not show the context menu. Use if you don't want to use the default 'right click' context menu.
         * @default false
         */
        this.suppressContextMenu = undefined;
        /** When using `suppressContextMenu`, you can use the `onCellContextMenu` function to provide your own code to handle cell `contextmenu` events.
         * This flag is useful to prevent the browser from showing its default context menu.
         * @default false
         */
        this.preventDefaultOnContextMenu = undefined;
        /** Allows context menu to show, even when `Ctrl` key is held down.
         * @default false
         * @agModule `ContextMenuModule`
         */
        this.allowContextMenuWithControlKey = undefined;
        /** Changes the display type of the column menu.
         * `'new'` just displays the main list of menu items. `'legacy'` displays a tabbed menu.
         * @default 'new'
         * @initial
         */
        this.columnMenu = undefined;
        /** Only recommended for use if `columnMenu = 'legacy'`.
         * When `true`, the column menu button will always be shown.
         * When `false`, the column menu button will only show when the mouse is over the column header.
         * When using `columnMenu = 'legacy'`, this will default to `false` instead of `true`.
         * @default true
         */
        this.suppressMenuHide = undefined;
        /** Set to `true` to use the browser's default tooltip instead of using the grid's Tooltip Component.
         * @default false
         * @initial
         * @agModule `TooltipModule`
         */
        this.enableBrowserTooltips = undefined;
        /** The trigger that will cause tooltips to show and hide.
         *  - `hover` - The tooltip will show/hide when a cell/header is hovered.
         *  - `focus` - The tooltip will show/hide when a cell/header is focused.
         * @default 'hover'
         * @initial
         * @agModule `TooltipModule`
         */
        this.tooltipTrigger = undefined;
        /** The delay in milliseconds that it takes for tooltips to show up once an element is hovered over.
         *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.
         * @default 2000
         * @agModule `TooltipModule`
         */
        this.tooltipShowDelay = undefined;
        /** The delay in milliseconds before a tooltip is shown when moving the pointer from one tooltip-enabled element to
         * another while the previous tooltip is still visible or pending hide.
         *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.
         * @default 200
         * @agModule `TooltipModule`
         */
        this.tooltipSwitchShowDelay = undefined;
        /** The delay in milliseconds that it takes for tooltips to hide once they have been displayed.
         *     **Note:** This property does not work if `enableBrowserTooltips` is `true` and `tooltipHideTriggers` includes `timeout`.
         * @default 10000
         * @agModule `TooltipModule`
         */
        this.tooltipHideDelay = undefined;
        /** Set to `true` to have tooltips follow the cursor once they are displayed.
         * @default false
         * @initial
         * @agModule `TooltipModule`
         */
        this.tooltipMouseTrack = undefined;
        /** This defines when tooltip will show up for Cells, Headers and SetFilter Items.
         *  - `standard` - The tooltip always shows up when the items configured with Tooltips are hovered.
         * - `whenTruncated` - The tooltip will only be displayed when the items hovered have truncated (showing ellipsis) values. This property does not work when `enableBrowserTooltips={true}`.
         * @default `standard`
         * @agModule `TooltipModule`
         */
        this.tooltipShowMode = undefined;
        /** Set to `true` to enable tooltip interaction. When this option is enabled, the tooltip will not hide while the
         * tooltip itself it being hovered or has focus.
         * @default false
         * @initial
         * @agModule `TooltipModule`
         */
        this.tooltipInteraction = undefined;
        /** DOM element to use as the popup parent for grid popups (context menu, column menu etc).
         */
        this.popupParent = undefined;
        /** Set to `true` to also include headers when copying to clipboard using `Ctrl + C` clipboard.
         * @default false
         * @agModule `ClipboardModule`
         */
        this.copyHeadersToClipboard = undefined;
        /** Set to `true` to also include group headers when copying to clipboard using `Ctrl + C` clipboard.
         * @default false
         * @agModule `ClipboardModule`
         */
        this.copyGroupHeadersToClipboard = undefined;
        /** Specify the delimiter to use when copying to clipboard.
         * @default '\t'
         * @agModule `ClipboardModule`
         */
        this.clipboardDelimiter = undefined;
        /** Set to `true` to copy the cell range or focused cell to the clipboard and never the selected rows.
         * @default false
         * @deprecated v32.2 Use `rowSelection.copySelectedRows` instead.
         */
        this.suppressCopyRowsToClipboard = undefined;
        /** Set to `true` to copy rows instead of ranges when a range with only a single cell is selected.
         * @default false
         * @deprecated v32.2 Use `rowSelection.copySelectedRows` instead.
         */
        this.suppressCopySingleCellRanges = undefined;
        /** Set to `true` to work around a bug with Excel (Windows) that adds an extra empty line at the end of ranges copied to the clipboard.
         * @default false
         * @agModule `ClipboardModule`
         */
        this.suppressLastEmptyLineOnPaste = undefined;
        /** Set to `true` to turn off paste operations within the grid.
         * @default false
         * @agModule `ClipboardModule`
         */
        this.suppressClipboardPaste = undefined;
        /** Set to `true` to stop the grid trying to use the Clipboard API, if it is blocked, and immediately fallback to the workaround.
         * @default false
         * @agModule `ClipboardModule`
         */
        this.suppressClipboardApi = undefined;
        /** Set to `true` to block     **cut** operations within the grid.
         * @default false
         * @agModule `ClipboardModule`
         */
        this.suppressCutToClipboard = undefined;
        /** Array of Column / Column Group definitions.
         */
        this.columnDefs = undefined;
        /** A default column definition. Items defined in the actual column definitions get precedence.
         */
        this.defaultColDef = undefined;
        /** A default column group definition. All column group definitions will use these properties. Items defined in the actual column group definition get precedence.
         * @initial
         */
        this.defaultColGroupDef = undefined;
        /** An object map of custom column types which contain groups of properties that column definitions can reuse by referencing in their `type` property.
         */
        this.columnTypes = undefined;
        /** An object map of cell data types to their definitions.
         * Cell data types can either override/update the pre-defined data types
         * (`'text'`, `'number'`, `'boolean'`, `'date'`, `'dateString'`, `'dateTime'`, `'dateTimeString'` or `'object'`),
         * or can be custom data types.
         */
        this.dataTypeDefinitions = undefined;
        /** Enables and configures Calculated Columns.
         * @agModule `CalculatedColumnsModule`
         */
        this.calculatedColumns = undefined;
        /** Configures editing of column and column group header names via the UI. Requires
         * `headerNameEditable` on the relevant Column or Column Group Definitions.
         * @agModule `ColumnHeaderEditModule`
         */
        this.columnHeaderEdit = undefined;
        /** Keeps the order of Columns maintained after new Column Definitions are updated.
         *
         * @default false
         */
        this.maintainColumnOrder = undefined;
        /** Resets pivot column order when impacted by filters, data or configuration changes
         *
         * @default false
         * @agModule `PivotModule`
         */
        this.enableStrictPivotColumnOrder = undefined;
        /** If `true`, then dots in field names (e.g. `'address.firstLine'`) are not treated as deep references. Allows you to use dots in your field name if you prefer.
         * @default false
         */
        this.suppressFieldDotNotation = undefined;
        /** The height in pixels for the row containing the column label header. If not specified, it uses the theme value of `header-height`.
         */
        this.headerHeight = undefined;
        /** The height in pixels for the rows containing header column groups. If not specified, it uses `headerHeight`.
         */
        this.groupHeaderHeight = undefined;
        /** The height in pixels for the row containing the floating filters. If not specified, it uses the theme value of `header-height`.
         */
        this.floatingFiltersHeight = undefined;
        /** The height in pixels for the row containing the columns when in pivot mode. If not specified, it uses `headerHeight`.
         */
        this.pivotHeaderHeight = undefined;
        /** The height in pixels for the row containing header column groups when in pivot mode. If not specified, it uses `groupHeaderHeight`.
         */
        this.pivotGroupHeaderHeight = undefined;
        /** Hide any column header rows that would only contain padded groups.
         */
        this.hidePaddedHeaderRows = undefined;
        /** Allow reordering and pinning columns by dragging columns from the Columns Tool Panel to the grid.
         * @default false
         * @agModule `ColumnsToolPanelModule`
         */
        this.allowDragFromColumnsToolPanel = undefined;
        /** Set to `true` to suppress column moving, i.e. to make the columns fixed position.
         * @default false
         */
        this.suppressMovableColumns = undefined;
        /** If `true`, the `ag-column-moving` class is not added to the grid while columns are moving. In the default themes, this results in no animation when moving columns.
         * @default false
         */
        this.suppressColumnMoveAnimation = undefined;
        /** Set to `true` to suppress moving columns while dragging the Column Header. This option highlights the position where the column will be placed and it will only move it on mouse up.
         * @default false
         */
        this.suppressMoveWhenColumnDragging = undefined;
        /** If `true`, when you drag a column out of the grid (e.g. to the group zone) the column is not hidden.
         * @default false
         */
        this.suppressDragLeaveHidesColumns = undefined;
        /** Enable to prevent column visibility changing when grouped columns are changed.
         * @default false
         */
        this.suppressGroupChangesColumnVisibility = undefined;
        /** By default, when a column is un-grouped, i.e. using the Row Group Panel, it is made visible in the grid. This property stops the column becoming visible again when un-grouping.
         * @default false
         * @deprecated v33.0.0 - Use `suppressGroupChangesColumnVisibility: 'suppressShowOnUngroup'` instead.
         */
        this.suppressMakeColumnVisibleAfterUnGroup = undefined;
        /** If `true`, when you drag a column into a row group panel the column is not hidden.
         * @default false
         * @deprecated v33.0.0 - Use `suppressGroupChangesColumnVisibility: 'suppressHideOnGroup'` instead.
         */
        this.suppressRowGroupHidesColumns = undefined;
        /** Set to `'shift'` to have shift-resize as the default resize operation (same as user holding down `Shift` while resizing).
         */
        this.colResizeDefault = undefined;
        /** Suppresses auto-sizing columns for columns. In other words, double clicking a column's header's edge will not auto-size.
         * @default false
         * @initial
         */
        this.suppressAutoSize = undefined;
        /** Number of pixels to add to a column width after the [auto-sizing](./column-sizing/#auto-size-columns-to-fit-cell-contents) calculation.
         * Set this if you want to add extra room to accommodate (for example) sort icons, or some other dynamic nature of the header.
         * @default 20
         */
        this.autoSizePadding = undefined;
        /** Set this to `true` to skip the `headerName` when `autoSize` is called by default.
         * @default false
         * @initial
         * @agModule `ColumnAutoSizeModule`
         */
        this.skipHeaderOnAutoSize = undefined;
        /** Auto-size the columns when the grid is loaded. Can size to fit the grid width, fit a provided width, or fit the cell contents.
         * @initial
         * @agModule `ColumnAutoSizeModule`
         */
        this.autoSizeStrategy = undefined;
        /** Set to `true` to animate changes to column width when auto-sizing the columns.
         * @default false
         */
        this.animateColumnResizing = undefined;
        /** A map of component names to components.
         * @initial
         */
        this.components = undefined;
        /** Set to `'fullRow'` to enable Full Row Editing. Otherwise leave blank to edit one cell at a time.
         * @agModule `TextEditorModule` / `LargeTextEditorModule` / `NumberEditorModule` / `DateEditorModule` / `CheckboxEditorModule` / `CustomEditorModule` / `SelectEditorModule` / `RichSelectModule`
         */
        this.editType = undefined;
        /** Determine the behavior when navigating to the next/previous editable cell. Default is to begin editing the cell.
         */
        this.suppressStartEditOnTab = undefined;
        /** Validates the Full Row Edit. Return non-empty, user-facing error messages, or `null` when the row is valid.
         * Only relevant when `editType="fullRow"`.
         * @agModule `TextEditorModule` / `LargeTextEditorModule` / `NumberEditorModule` / `DateEditorModule` / `CheckboxEditorModule` / `CustomEditorModule` / `SelectEditorModule` / `RichSelectModule`
         */
        this.getFullRowEditValidationErrors = undefined;
        /** Set to `block` to block the commit of invalid cell edits, keeping editors open.
         */
        this.invalidEditValueMode = undefined;
        /** Set to `true` to enable Single Click Editing for cells, to start editing with a single click.
         * @default false
         * @agModule `TextEditorModule` / `LargeTextEditorModule` / `NumberEditorModule` / `DateEditorModule` / `CheckboxEditorModule` / `CustomEditorModule` / `SelectEditorModule` / `RichSelectModule`
         */
        this.singleClickEdit = undefined;
        /** Set to `true` so that neither single nor double click starts editing.
         * @default false
         * @agModule `TextEditorModule` / `LargeTextEditorModule` / `NumberEditorModule` / `DateEditorModule` / `CheckboxEditorModule` / `CustomEditorModule` / `SelectEditorModule` / `RichSelectModule`
         */
        this.suppressClickEdit = undefined;
        /** Set to `true` to stop the grid updating data after `Edit`, `Clipboard` and `Fill Handle` operations. When this is set, it is intended the application will update the data, eg in an external immutable store, and then pass the new dataset to the grid. <br />**Note:** `rowNode.setDataValue()` does not update the value of the cell when this is `True`, it fires `onCellEditRequest` instead.
         * @default false
         * @agModule `TextEditorModule` / `LargeTextEditorModule` / `NumberEditorModule` / `DateEditorModule` / `CheckboxEditorModule` / `CustomEditorModule` / `SelectEditorModule` / `RichSelectModule`
         */
        this.readOnlyEdit = undefined;
        /** Set this to `true` to stop cell editing when grid loses focus.
         * The default is that the grid stays editing until focus goes onto another cell.
         * @default false
         * @initial
         * @agModule `TextEditorModule` / `LargeTextEditorModule` / `NumberEditorModule` / `DateEditorModule` / `CheckboxEditorModule` / `CustomEditorModule` / `SelectEditorModule` / `RichSelectModule`
         */
        this.stopEditingWhenCellsLoseFocus = undefined;
        /** Set to `true` along with `enterNavigatesVerticallyAfterEdit` to have Excel-style behaviour for the `Enter` key.
         * i.e. pressing the `Enter` key will move down to the cell beneath and `Shift+Enter` will move up to the cell above.
         * @default false
         * @agModule `TextEditorModule` / `LargeTextEditorModule` / `NumberEditorModule` / `DateEditorModule` / `CheckboxEditorModule` / `CustomEditorModule` / `SelectEditorModule` / `RichSelectModule`
         */
        this.enterNavigatesVertically = undefined;
        /** Set to `true` along with `enterNavigatesVertically` to have Excel-style behaviour for the 'Enter' key.
         * i.e. pressing the Enter key will move down to the cell beneath and Shift+Enter key will move up to the cell above.
         * @default false
         * @agModule `TextEditorModule` / `LargeTextEditorModule` / `NumberEditorModule` / `DateEditorModule` / `CheckboxEditorModule` / `CustomEditorModule` / `SelectEditorModule` / `RichSelectModule`
         */
        this.enterNavigatesVerticallyAfterEdit = undefined;
        /** Forces Cell Editing to start when backspace is pressed. This is only relevant for MacOS users.
         * @agModule `TextEditorModule` / `LargeTextEditorModule` / `NumberEditorModule` / `DateEditorModule` / `CheckboxEditorModule` / `CustomEditorModule` / `SelectEditorModule` / `RichSelectModule`
         */
        this.enableCellEditingOnBackspace = undefined;
        /** Set to `true` to enable Undo / Redo while editing.
         * @initial
         * @agModule `UndoRedoEditModule`
         */
        this.undoRedoCellEditing = undefined;
        /** Set the size of the undo / redo stack.
         * @default 10
         * @initial
         * @agModule `UndoRedoEditModule`
         */
        this.undoRedoCellEditingLimit = undefined;
        /** A default configuration object used to export to CSV.
         * @agModule `CsvExportModule`
         */
        this.defaultCsvExportParams = undefined;
        /** Prevents the user from exporting the grid to CSV.
         * @default false
         */
        this.suppressCsvExport = undefined;
        /** A default configuration object used to export to Excel.
         * @agModule `ExcelExportModule`
         */
        this.defaultExcelExportParams = undefined;
        /** Prevents the user from exporting the grid to Excel.
         * @default false
         */
        this.suppressExcelExport = undefined;
        /** A default configuration object used to export to PDF.
         * @agModule `PdfExportModule`
         */
        this.defaultPdfExportParams = undefined;
        /** Prevents the user from exporting the grid to PDF.
         * @default false
         */
        this.suppressPdfExport = undefined;
        /** A list (array) of Excel styles to be used when exporting to Excel with styles.
         * @initial
         * @agModule `ExcelExportModule`
         */
        this.excelStyles = undefined;
        /** Text to find within the grid.
         * @agModule `FindModule`
         */
        this.findSearchValue = undefined;
        /** Options for the Find feature.
         * @agModule `FindModule`
         */
        this.findOptions = undefined;
        /** Rows are filtered using this text as a Quick Filter.
         * Only supported for Client-Side Row Model.
         * @agModule `QuickFilterModule`
         */
        this.quickFilterText = undefined;
        /** Set to `true` to turn on the Quick Filter cache, used to improve performance when using the Quick Filter.
         * @default false
         * @initial
         * @agModule `QuickFilterModule`
         */
        this.cacheQuickFilter = undefined;
        /** Hidden columns are excluded from the Quick Filter by default.
         * To include hidden columns, set to `true`.
         * @default false
         * @agModule `QuickFilterModule`
         */
        this.includeHiddenColumnsInQuickFilter = undefined;
        /** Changes how the Quick Filter splits the Quick Filter text into search terms.
         * @agModule `QuickFilterModule`
         */
        this.quickFilterParser = undefined;
        /** Changes the matching logic for whether a row passes the Quick Filter.
         * @agModule `QuickFilterModule`
         */
        this.quickFilterMatcher = undefined;
        /** When pivoting, Quick Filter is only applied on the pivoted data
         * (or aggregated data if `groupAggFiltering = true`).
         * Set to `true` to apply Quick Filter before pivoting (/aggregating) instead.
         * @default false
         * @agModule `QuickFilterModule`
         */
        this.applyQuickFilterBeforePivotOrAgg = undefined;
        /** Set to `true` to override the default tree data filtering behaviour to instead exclude child nodes from filter results.
         * @default false
         * @agModule `TreeDataModule`
         */
        this.excludeChildrenWhenTreeDataFiltering = undefined;
        /** Set to true to enable the Advanced Filter.
         * @default false
         * @agModule `AdvancedFilterModule`
         */
        this.enableAdvancedFilter = undefined;
        /** Allows rows to always be displayed, even if they don't match the applied filtering.
         * Return `true` for the provided row to always be displayed.
         * Only works with the Client-Side Row Model.
         * @agModule `TextFilterModule` / `NumberFilterModule` / `DateFilterModule` / `SetFilterModule` / `MultiFilterModule` / `CustomFilterModule` / `QuickFilterModule` / `ExternalFilterModule` / `AdvancedFilterModule`
         */
        this.alwaysPassFilter = undefined;
        /** Hidden columns are excluded from the Advanced Filter by default.
         * To include hidden columns, set to `true`.
         * @default false
         * @agModule `AdvancedFilterModule`
         */
        this.includeHiddenColumnsInAdvancedFilter = undefined;
        /** DOM element to use as the parent for the Advanced Filter to allow it to appear outside of the grid.
         * Set to `null` or `undefined` to appear inside the grid.
         * @agModule `AdvancedFilterModule`
         */
        this.advancedFilterParent = undefined;
        /** Customise the parameters passed to the Advanced Filter Builder.
         * @agModule `AdvancedFilterModule`
         */
        this.advancedFilterBuilderParams = undefined;
        /** Customise the parameters passed to the Advanced Filter
         * @agModule `AdvancedFilterModule`
         */
        this.advancedFilterParams = undefined;
        /** @deprecated As of v34, advanced filter no longer uses function evaluation, so this option has no effect.
         * @default true
         * @agModule `AdvancedFilterModule`
         */
        this.suppressAdvancedFilterEval = undefined;
        /** When using AG Grid Enterprise, the Set Filter is used by default when `filter: true` is set on column definitions.
         * Set to `true` to prevent this and instead use the Text Filter, Number Filter or Date Filter based on the cell data type,
         * the same as when using AG Grid Community.
         * @default false
         * @initial
         * @agModule TextFilterModule / NumberFilterModule / DateFilterModule / MultiFilterModule / CustomFilterModule
         */
        this.suppressSetFilterByDefault = undefined;
        /** Enable filter handlers for custom filter components.
         * Requires all custom filters to be implemented using handlers.
         *
         * Note that grid-provided filters (except for the Multi Filter) always use filter handlers.
         * The Multi Filter will also use a filter handler if this is enabled.
         * @initial
         */
        this.enableFilterHandlers = undefined;
        /** A map of filter handler key to filter handler function.
         * Allows for filter handler keys to be used in `colDef.filter.handler`.
         * @initial
         */
        this.filterHandlers = undefined;
        /** Set to `true` to allow users to create Integrated Charts from the grid UI, e.g. via the
         * `chartRange` and `pivotChart` context menu items shown by default. Menu items requested by
         * name via `getContextMenuItems` or `colDef.contextMenuItems` are shown regardless, and charts
         * created programmatically through the Grid API do not require this option.
         * @default false
         * @agModule `IntegratedChartsModule`
         */
        this.enableCharts = undefined;
        /** Hidden columns are included in charts by default, and remain in a chart if hidden after being added.
         * Set to `false` to exclude hidden columns from charts, and to remove a column from a chart when it is hidden.
         * Does not apply to Pivot Charts, whose columns always mirror the grid's displayed columns.
         * @default true
         * @agModule `IntegratedChartsModule`
         */
        this.includeHiddenColumnsInCharts = undefined;
        /** The list of chart themes that a user can choose from in the chart panel.
         * @default ['ag-default', 'ag-material', 'ag-sheets', 'ag-polychroma', 'ag-vivid'];
         * @initial
         * @agModule `IntegratedChartsModule`
         */
        this.chartThemes = undefined;
        /** A map containing custom chart themes.
         * @initial
         * @agModule `IntegratedChartsModule`
         */
        this.customChartThemes = undefined;
        /** Chart theme overrides applied to all themes.
         * @initial
         * @agModule `IntegratedChartsModule`
         */
        this.chartThemeOverrides = undefined;
        /** Allows customisation of the Chart Tool Panels, such as changing the tool panels visibility and order, as well as choosing which charts should be displayed in the chart panel.
         * @initial
         * @agModule `IntegratedChartsModule`
         */
        this.chartToolPanelsDef = undefined;
        /** Get chart menu items. Only applies when using AG Charts Enterprise.
         * @agModule `IntegratedChartsModule`
         */
        this.chartMenuItems = undefined;
        /** Provide your own loading cell renderer to use when data is loading via a DataSource or when a cell renderer is deferred.
         * See [Loading Cell Renderer](https://www.ag-grid.com/javascript-data-grid/component-loading-cell-renderer/) for framework specific implementation details.
         */
        this.loadingCellRenderer = undefined;
        /** Params to be passed to the `loadingCellRenderer` component.
         */
        this.loadingCellRendererParams = undefined;
        /** Callback to select which loading cell renderer to be used when data is loading via a DataSource or when a cell renderer is deferred.
         * @initial
         */
        this.loadingCellRendererSelector = undefined;
        /** A map of key->value pairs for localising text within the grid.
         * @initial
         * @agModule `LocaleModule`
         */
        this.localeText = undefined;
        /** Set to `true` to enable Master Detail.
         * @default false
         * @agModule `MasterDetailModule`
         */
        this.masterDetail = undefined;
        /** Set to `true` to keep detail rows for when they are displayed again.
         * @default false
         * @initial
         * @agModule `MasterDetailModule`
         */
        this.keepDetailRows = undefined;
        /** Sets the number of details rows to keep.
         * @default 10
         * @initial
         * @agModule `MasterDetailModule`
         */
        this.keepDetailRowsCount = undefined;
        /** Provide a custom `detailCellRenderer` to use when a master row is expanded.
         * See [Detail Cell Renderer](https://www.ag-grid.com/javascript-data-grid/master-detail-custom-detail/) for framework specific implementation details.
         * @agModule `MasterDetailModule`
         */
        this.detailCellRenderer = undefined;
        /** Specifies the params to be used by the Detail Cell Renderer. Can also be a function that provides the params to enable dynamic definitions of the params.
         * @agModule `MasterDetailModule`
         */
        this.detailCellRendererParams = undefined;
        /** Set fixed height in pixels for each detail row.
         * @initial
         * @agModule `MasterDetailModule`
         */
        this.detailRowHeight = undefined;
        /** Set to `true` to have the detail grid dynamically change it's height to fit it's rows.
         * @initial
         * @agModule `MasterDetailModule`
         */
        this.detailRowAutoHeight = undefined;
        /** Provides a context object that is provided to different callbacks the grid uses. Used for passing additional information to the callbacks used by your application.
         * @initial
         */
        this.context = undefined;
        /**
         * A list of grids to treat as Aligned Grids.
         * Provide a list if the grids / apis already exist or return via a callback to allow the aligned grids to be retrieved asynchronously.
         * If grids are aligned then the columns and horizontal scrolling will be kept in sync.
         * @agModule `AlignedGridsModule`
         */
        this.alignedGrids = undefined;
        /** Change this value to set the tabIndex order of the Grid within your application.
         * @default 0
         * @initial
         */
        this.tabIndex = undefined;
        /** Set to `true` to hide the clear button shown in supported input fields when they contain a value.
         * @default false
         */
        this.suppressInputClearButton = undefined;
        /** Set to `true` to enable the browser's autocomplete/autofill behaviour for eligible grid input fields.
         * Inputs that provide grid-owned suggestions, such as Rich Select and Advanced Filter inputs, keep browser autocomplete disabled.
         * @default false
         */
        this.enableInputAutoComplete = undefined;
        /** The number of rows rendered outside the viewable area the grid renders.
         * Having a buffer means the grid will have rows ready to show as the user slowly scrolls vertically.
         * @default 10
         */
        this.rowBuffer = undefined;
        /** Set to `true` to turn on the value cache.
         * @default false
         * @initial
         * @agModule `ValueCacheModule`
         */
        this.valueCache = undefined;
        /** Set to `true` to configure the value cache to not expire after data updates.
         * @default false
         * @initial
         * @agModule `ValueCacheModule`
         */
        this.valueCacheNeverExpires = undefined;
        /** Set to `true` to allow cell expressions.
         * @default false
         * @initial
         */
        this.enableCellExpressions = undefined;
        /** Disables touch support (but does not remove the browser's efforts to simulate mouse events on touch).
         * @default false
         * @initial
         */
        this.suppressTouch = undefined;
        /** Set to `true` to not set focus back on the grid after a refresh. This can avoid issues where you want to keep the focus on another part of the browser.
         * @default false
         */
        this.suppressFocusAfterRefresh = undefined;
        /** @deprecated As of v32.2 the grid always uses the browser's ResizeObserver, this grid option has no effect
         * @default false
         * @initial
         */
        this.suppressBrowserResizeObserver = undefined;
        /** @deprecated As of v33 `gridOptions` and `columnDefs` both have a `context` property that should be used for arbitrary user data. This means that column definitions and gridOptions should only contain valid properties making this property redundant.
         * @default false
         * @initial
         */
        this.suppressPropertyNamesCheck = undefined;
        /** Disables change detection.
         * @default false
         */
        this.suppressChangeDetection = undefined;
        /** Set this to `true` to enable debug information from the grid and related components. Will result in additional logging being output, but very useful when investigating problems.
         * It is also recommended to register the `ValidationModule` to identify any misconfigurations.
         * @default false
         * @initial
         */
        this.debug = undefined;
        /** Show or hide the loading UI.
         * - `true`: the loading overlay is shown, or skeleton rows if `loadingRows` is enabled (Client-Side Row Model only).
         * - `false`: the loading UI is hidden.
         * - `undefined`: the grid will automatically show the loading overlay until `rowData` and `columnDefs` are provided. (Client Side Row Model only)
         * @default undefined
         */
        this.loading = undefined;
        /** Display skeleton rows instead of the loading overlay when `loading=true` (Client-Side Row Model only).
         * Set to `true` to display ten rows, or provide options to configure the row count.
         * This option does not start loading; set `loading=true` to show the skeleton rows.
         * @default false
         */
        this.loadingRows = undefined;
        /** Provide a HTML string to override the default loading overlay. Supports non-empty plain text or HTML with a single root element.
         *
         * -     **Prefer `overlayComponent` / `overlayComponentSelector`**
         */
        this.overlayLoadingTemplate = undefined;
        /** Provide a custom loading overlay component.
         *
         * -     **Prefer `overlayComponent` / `overlayComponentSelector`**
         */
        this.loadingOverlayComponent = undefined;
        /** Customise the parameters provided to the loading overlay component.
         *
         * -     **Prefer using `overlayComponentParams`**
         */
        this.loadingOverlayComponentParams = undefined;
        /** Disables the 'loading' overlay.
         * @deprecated v32 - Deprecated. Use `suppressOverlays=['loading']` or `loading=false` instead.
         * @default false
         * @initial
         */
        this.suppressLoadingOverlay = undefined;
        /** Provide a HTML string to override the default no-rows overlay. Supports non-empty plain text or HTML with a single root element.
         *
         * -     **Prefer `overlayComponent` / `overlayComponentSelector`**
         */
        this.overlayNoRowsTemplate = undefined;
        /** Provide a custom no-rows overlay component.
         *
         * -     **Prefer `overlayComponent` / `overlayComponentSelector`**
         */
        this.noRowsOverlayComponent = undefined;
        /** Customise the parameters provided to the no-rows overlay component.
         *
         * -     **Prefer using `overlayComponentParams`**
         */
        this.noRowsOverlayComponentParams = undefined;
        /** Set to `true` to prevent the no-rows overlay being shown when there is no row data.
         *
         * -     **Prefer `suppressOverlays=['noRows']`**
         *
         * @default false
         * @initial
         */
        this.suppressNoRowsOverlay = undefined;
        /** List of provided overlay names to suppress. One of `loading`, `noRows`, `noMatchingRows`, `exporting`, `fileInput`.
         */
        this.suppressOverlays = undefined;
        /** Provide a custom overlay component to be used for all grid provided overlays (loading, no rows, no matching rows, exporting etc).
         * @initial
         */
        this.overlayComponent = undefined;
        /** Customise the parameters provided to the `overlayComponent`.
         * Provided overlays accept parameters specified on the `OverlayComponentUserParams` interface.
         * Any custom parameters can also be provided for custom overlay components.
         */
        this.overlayComponentParams = undefined;
        /** Callback to dynamically provide a custom overlay component complete with custom params based on the selector params.
         * @initial
         */
        this.overlayComponentSelector = undefined;
        /** Display an overlay on demand. If provided takes precedence over the grid provided overlays.
         * - name of a provided overlay, i.e `agLoadingOverlay`, `agNoRowsOverlay`, `agNoMatchingRowsOverlay`, `agExportingOverlay`
         * - component class/function.
         * - key of a custom component registered in the `components` map.
         * - `undefined` to clear.
         */
        this.activeOverlay = undefined;
        /** Custom parameters to be supplied to the `activeOverlay` component in addition to `IOverlayParams`. Updating the params will trigger a refresh of the active overlay.
         */
        this.activeOverlayParams = undefined;
        /** Callback to handle files received via the file input overlay (drag-and-drop or file browser).
         * When provided, the file input overlay is shown when there is no row data.
         * Call `params.success(rowData)` to load parsed data into the grid, or `params.fail(message)` to show an error.
         * @agModule `FileInputOverlayModule`
         */
        this.processFileInput = undefined;
        /** Set whether pagination is enabled.
         * @default false
         * @agModule `PaginationModule`
         */
        this.pagination = undefined;
        /** How many rows to load per page. If `paginationAutoPageSize` is specified, this property is ignored.
         * @default 100
         * @agModule `PaginationModule`
         */
        this.paginationPageSize = undefined;
        /** Determines if the page size selector is shown in the pagination panel or not.
         * Set to an array of values to show the page size selector with custom list of possible page sizes.
         * Set to `true` to show the page size selector with the default page sizes `[20, 50, 100]`.
         * Set to `false` to hide the page size selector.
         * @default true
         * @agModule `PaginationModule`
         */
        this.paginationPageSizeSelector = undefined;
        /** Set to `true` so that the number of rows to load per page is automatically adjusted by the grid so each page shows enough rows to just fill the area designated for the grid. If `false`, `paginationPageSize` is used.
         * @default false
         * @agModule `PaginationModule`
         */
        this.paginationAutoPageSize = undefined;
        /** Set to `true` to have pages split children of groups when using Row Grouping or detail rows with Master Detail.
         * @default false
         * @initial
         * @agModule `PaginationModule`
         */
        this.paginateChildRows = undefined;
        /** If `true`, the default grid controls for navigation are hidden.
         * This is useful if `pagination=true` and you want to provide your own pagination controls.
         * Otherwise, when `pagination=true` the grid automatically shows the necessary controls at the bottom so that the user can navigate through the different pages.
         * @default false
         * @agModule `PaginationModule`
         */
        this.suppressPaginationPanel = undefined;
        /** Controls which built-in components appear in the pagination panel and in what order.
         * Accepts an array of panel names (`'pageSize'`, `'rowSummary'`, `'pageSummary'`) or config objects.
         * Components render in the order they appear in the array. Omitted components are hidden.
         * An empty array hides the pagination panel entirely.
         * When not set, all three components render in the default order: [`pageSize`, `rowSummary`, `pageSummary`].
         * Use `{ type: 'pageSummary', suppressPageInput: true }` to render a read-only page summary.
         * @agModule `PaginationModule`
         */
        this.paginationPanels = undefined;
        /** Set to `true` to enable pivot mode.
         * @default false
         * @agModule `PivotModule`
         */
        this.pivotMode = undefined;
        /** When to show the 'pivot panel' (where you drag rows to pivot) at the top. Note that the pivot panel will never show if `pivotMode` is off.
         * @default 'never'
         * @initial
         * @agModule `RowGroupingPanelModule`
         */
        this.pivotPanelShow = undefined;
        /** The maximum number of generated columns before the grid halts execution. Upon reaching this number, the grid halts generation of columns
         * and triggers a `pivotMaxColumnsExceeded` event. `-1` for no limit.
         * @default -1
         * @agModule `PivotModule`
         */
        this.pivotMaxGeneratedColumns = undefined;
        /** If pivoting, set to the number of column group levels to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything.
         * @default 0
         * @agModule `PivotModule`
         */
        this.pivotDefaultExpanded = undefined;
        /** When set and the grid is in pivot mode, automatically calculated totals will appear within the Pivot Column Groups, in the position specified.
         * @agModule `PivotModule`
         */
        this.pivotColumnGroupTotals = undefined;
        /** When set and the grid is in pivot mode, automatically calculated totals will appear for each value column in the position specified.
         * @agModule `PivotModule`
         */
        this.pivotRowTotals = undefined;
        /** If `true`, the grid will not swap in the grouping column when pivoting. Useful if pivoting using Server Side Row Model or Viewport Row Model and you want full control of all columns including the group column.
         * @default false
         * @initial
         * @agModule `PivotModule`
         */
        this.pivotSuppressAutoColumn = undefined;
        /** When enabled, pivot column groups will appear 'fixed', without the ability to expand and collapse the column groups.
         * @default false
         * @initial
         * @agModule `PivotModule`
         */
        this.suppressExpandablePivotGroups = undefined;
        /** If `true`, then row group, pivot and value aggregation will be read-only from the GUI. The grid will display what values are used for each, but will not allow the user to change the selection.
         * @default false
         * @agModule `RowGroupingModule` / `PivotModule` / `TreeDataModule` / `ServerSideRowModelModule`
         */
        this.functionsReadOnly = undefined;
        /** A map of 'function name' to 'function' for custom aggregation functions.
         * @initial
         * @agModule `RowGroupingModule` / `PivotModule` / `TreeDataModule` / `ServerSideRowModelModule`
         */
        this.aggFuncs = undefined;
        /** Provide a data source to control where formulas are stored and retrieved.
         * If not supplied, formulas are read from and written to the row data.
         * @initial
         * @agModule `FormulaModule`
         */
        this.formulaDataSource = undefined;
        /** Provide a data source to control where notes are stored and retrieved.
         * Can be updated to enable, disable, or replace Notes at runtime.
         * @agModule `NotesModule`
         */
        this.notesDataSource = undefined;
        /** Changes how existing notes are opened.
         *  - `'hover'` - Existing notes open when hovering a noted cell or full width row.
         *  - `'click'` - Existing notes open when clicking a noted cell or full width row.
         * @default 'hover'
         * @agModule `NotesModule`
         */
        this.noteTrigger = undefined;
        /** The delay in milliseconds before a note is shown when hovering a noted cell.
         * Only applies when `noteTrigger = 'hover'`.
         * @default 180
         * @agModule `NotesModule`
         */
        this.noteShowDelay = undefined;
        /** The delay in milliseconds before a note is hidden after the pointer leaves a noted cell or note popup.
         * @default 220
         * @agModule `NotesModule`
         */
        this.noteHideDelay = undefined;
        /** A map of 'function name' to 'function' for custom functions that are used for formulas.
         * @initial
         * @agModule `FormulaModule`
         */
        this.formulaFuncs = undefined;
        /** When `true`, column headers won't include the `aggFunc` name, e.g. `'sum(Bank Balance)`' will just be `'Bank Balance'`.
         * @default false
         * @agModule `RowGroupingModule` / `PivotModule` / `TreeDataModule` / `ServerSideRowModelModule`
         */
        this.suppressAggFuncInHeader = undefined;
        /** When using aggregations, the grid will always calculate the root level aggregation value.
         * @default false
         * @agModule `RowGroupingModule` / `PivotModule` / `TreeDataModule` / `ServerSideRowModelModule`
         */
        this.alwaysAggregateAtRootLevel = undefined;
        /** When using change detection, only the updated column will be re-aggregated.
         * @default false
         * @agModule `RowGroupingModule` / `PivotModule` / `TreeDataModule` / `ServerSideRowModelModule`
         */
        this.aggregateOnlyChangedColumns = undefined;
        /** Set to `true` so that aggregations are not impacted by filtering.
         * @default false
         * @agModule `RowGroupingModule` / `PivotModule` / `TreeDataModule` / `ServerSideRowModelModule`
         */
        this.suppressAggFilteredOnly = undefined;
        /** Set to `true` to omit the value Column header when there is only a single value column.
         * @default false
         * @agModule `PivotModule`
         */
        this.removePivotHeaderRowWhenSingleValueColumn = undefined;
        /** Set to `false` to disable Row Animation which is enabled by default.
         * @default true
         */
        this.animateRows = undefined;
        /** Sets the duration in milliseconds of how long a cell should remain in its "flashed" state.
         * If `0`, the cell will not flash.
         * @default 500
         */
        this.cellFlashDuration = undefined;
        /** Sets the duration in milliseconds of how long the "flashed" state animation takes to fade away after the timer set by `cellFlashDuration` has completed.
         * @default 1000
         */
        this.cellFadeDuration = undefined;
        /** Set to `true` to have cells flash after data changes even when the change is due to filtering.
         * @default false
         * @initial
         */
        this.allowShowChangeAfterFilter = undefined;
        /** Switch between layout options: `normal`, `autoHeight`, `print`.
         * @default 'normal'
         */
        this.domLayout = undefined;
        /** When `true`, the order of rows and columns in the DOM are consistent with what is on screen.
         * Disables row animations.
         * @default false
         * @initial
         */
        this.ensureDomOrder = undefined;
        /** When `true`, enables the cell span feature allowing for the use of the `colDef.spanRows` property.
         * @default false
         * @initial
         * @agModule `CellSpanModule`
         */
        this.enableCellSpan = undefined;
        /** Set to `true` to operate the grid in RTL (Right to Left) mode.
         * @default false
         * @initial
         */
        this.enableRtl = undefined;
        /** Set to `true` so that the grid doesn't virtualise the columns. For example, if you have 100 columns, but only 10 visible due to scrolling, all 100 will always be rendered.
         *     **It is not recommended to set this to `true` as it may cause performance issues.**
         * @default false
         * @initial
         */
        this.suppressColumnVirtualisation = undefined;
        /** By default the grid has a limit of rendering a maximum of 500 rows at once (remember the grid only renders rows you can see, so unless your display shows more than 500 rows without vertically scrolling this will never be an issue).
         * <br />**This is only relevant if you are manually setting `rowBuffer` to a high value (rendering more rows than can be seen), or `suppressRowVirtualisation` is true, or if your grid height is able to display more than 500 rows at once.**
         * @default false
         * @initial
         */
        this.suppressMaxRenderedRowRestriction = undefined;
        /** Set to `true` so that the grid doesn't virtualise the rows. For example, if you have 100 rows, but only 10 visible due to scrolling, all 100 will always be rendered.
         *     **It is not recommended to set this to `true` as it may cause performance issues.**
         * @default false
         * @initial
         */
        this.suppressRowVirtualisation = undefined;
        /** Set to `true` to enable Managed Row Dragging.
         * @default false
         * @agModule `RowDragModule`
         */
        this.rowDragManaged = undefined;
        /** When `true`, the grid re-evaluates the grouping hierarchy after editing a grouped column value,
         * moving the row to the correct group instantly. Also enables managed row dragging to update
         * grouped column values so rows can move between groups.
         * @default false
         * @agModule `RowGroupingModule` / `TreeDataModule`
         */
        this.refreshAfterGroupEdit = undefined;
        /** Used if rowDragManaged is enabled and treeData is enabled,
         * - If the row is already a group, but is not expanded, it will be expanded after rowDragInsertDelay milliseconds of dragging over it.
         * - If the row is a leaf (no children), it will be converted to a group and the row inserted into it after rowDragInsertDelay milliseconds of dragging over it.
         * @default 500
         * @agModule `RowDragModule`
         */
        this.rowDragInsertDelay = undefined;
        /** Set to `true` to suppress row dragging.
         * @default false
         */
        this.suppressRowDrag = undefined;
        /** Set to `true` to suppress moving rows while dragging the `rowDrag` waffle. This option highlights the position where the row will be placed and it will only move the row on mouse up.
         * @default false
         * @agModule `RowDragModule`
         */
        this.suppressMoveWhenRowDragging = undefined;
        /** Set to `true` to enable clicking and dragging anywhere on the row without the need for a drag handle.
         * @default false
         * @agModule `RowDragModule`
         */
        this.rowDragEntireRow = undefined;
        /** Set to `true` to enable dragging multiple rows at the same time.
         * @default false
         * @agModule `RowDragModule`
         */
        this.rowDragMultiRow = undefined;
        /** A callback that should return a string to be displayed by the `rowDragComp` while dragging a row.
         * If this callback is not set, the current cell value will be used.
         * If the `rowDragText` callback is set in the ColDef it will take precedence over this, except when
         * `rowDragEntireRow=true`.
         * @initial
         * @agModule `RowDragModule`
         */
        this.rowDragText = undefined;
        /** Provide a custom drag and drop image component.
         * @initial
         * @agModule `RowDragModule`
         */
        this.dragAndDropImageComponent = undefined;
        /** Customise the parameters provided to the Drag and Drop Image Component.
         * @agModule `RowDragModule`
         */
        this.dragAndDropImageComponentParams = undefined;
        /** Provide your own cell renderer component to use for full width rows.
         * See [Full Width Rows](https://www.ag-grid.com/javascript-data-grid/full-width-rows/) for framework specific implementation details.
         */
        this.fullWidthCellRenderer = undefined;
        /** Customise the parameters provided to the `fullWidthCellRenderer` component.
         */
        this.fullWidthCellRendererParams = undefined;
        /** Set to `true` to have the Full Width Rows embedded in grid's main container so they can be scrolled horizontally.
         */
        this.embedFullWidthRows = undefined;
        /** Specifies how the results of row grouping should be displayed.
         *
         *  The options are:
         *
         * - `'singleColumn'`: single group column automatically added by the grid.
         * - `'multipleColumns'`: a group column per row group is added automatically.
         * - `'groupRows'`: group rows are automatically added instead of group columns.
         * - `'custom'`: informs the grid that group columns will be provided.
         * @agModule `RowGroupingModule`
         */
        this.groupDisplayType = undefined;
        /** If grouping, set to the number of levels to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything.
         * @default 0
         * @agModule `RowGroupingModule` / `TreeDataModule`
         */
        this.groupDefaultExpanded = undefined;
        /** Master Detail: set to the number of levels of master rows to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything. If not set, falls back to `groupDefaultExpanded`.
         * @agModule `MasterDetailModule`
         */
        this.masterDefaultExpanded = undefined;
        /** Allows specifying the group 'auto column' if you are not happy with the default. If grouping, this column definition is included as the first column in the grid. If not grouping, this column is not included.
         * Cell tooltip properties set here (`tooltip`, `tooltipComponent`) apply to leaf rows only; group rows inherit cell tooltips from their underlying column `colDef`. `headerTooltip` continues to apply to the group column header.
         * @agModule `RowGroupingModule` / `TreeDataModule`
         */
        this.autoGroupColumnDef = undefined;
        /** When `true`, sorting on non-group columns does not reorder groups; only the rows within
         * each group are sorted. Group order remains the structural order set at grouping time
         * (data-insertion order, or `initialGroupOrderComparator` if configured) and is preserved
         * across filter changes and transactions. If a group column was sorted via `colDef.sort`
         * and the user later explicitly clears that sort, the structural order is restored.
         *
         * With multi-level row grouping, the order is maintained per level: a sort on a group
         * column at one level only re-orders that level's groups; sibling levels keep their
         * structural order.
         *
         * Applies to row grouping only. Has no effect on tree data, where row order is determined
         * by the tree structure.
         * @default false
         * @agModule `RowGroupingModule`
         */
        this.groupMaintainOrder = undefined;
        /** When `true`, if you select a group, the children of the group will also be selected.
         * @default false
         * @deprecated v32.2 Use `rowSelection.groupSelects` instead
         */
        this.groupSelectsChildren = undefined;
        /** If grouping, locks the group settings of a number of columns, e.g. `0` for no group locking. `1` for first group column locked, `-1` for all group columns locked.
         * @default 0
         * @initial
         * @agModule `RowGroupingModule`
         */
        this.groupLockGroupColumns = undefined;
        /** Set to determine whether filters should be applied on aggregated group values.
         * @default false
         * @agModule `RowGroupingModule`
         */
        this.groupAggFiltering = undefined;
        /** When provided, an extra row group total row will be inserted into row groups at the specified position, to display
         * when the group is expanded. This row will contain the aggregate values for the group. If a callback function is
         * provided, it can be used to selectively determine which groups will have a total row added.
         * @agModule `RowGroupingModule` / `ServerSideRowModelModule`
         */
        this.groupTotalRow = undefined;
        /** When provided, an extra grand total row will be inserted into the grid at the specified position.
         * This row displays the aggregate totals of all rows in the grid.
         * @agModule `RowGroupingModule` / `ServerSideRowModelModule`
         */
        this.grandTotalRow = undefined;
        /** Suppress the sticky behaviour of the total rows, can be suppressed individually by passing `'grand'` or `'group'`.
         * @agModule `RowGroupingModule` / `ServerSideRowModelModule`
         */
        this.suppressStickyTotalRow = undefined;
        /** If `true`, and showing footer, aggregate data will always be displayed at both the header and footer levels. This stops the possibly undesirable behaviour of the header details 'jumping' to the footer on expand.
         * @default false
         * @agModule `RowGroupingModule` / `PivotModule` / `TreeDataModule` / `ServerSideRowModelModule`
         */
        this.groupSuppressBlankHeader = undefined;
        /** If using `groupSelectsChildren`, then only the children that pass the current filter will get selected.
         * @default false
         * @deprecated v32.2 Use `rowSelection.groupSelects` instead
         */
        this.groupSelectsFiltered = undefined;
        /** Shows the open group in the group column for non-group rows.
         * @default false
         * @agModule `RowGroupingModule`
         */
        this.showOpenedGroup = undefined;
        /** Enable to display the child row in place of the group row when the group only has a single child.
         * @default false
         * @agModule `RowGroupingModule`
         */
        this.groupHideParentOfSingleChild = undefined;
        /** Set to `true` to collapse groups that only have one child.
         * @default false
         * @deprecated v33.0.0 - use `groupHideParentOfSingleChild` instead.
         */
        this.groupRemoveSingleChildren = undefined;
        /** Set to `true` to collapse lowest level groups that only have one child.
         * @default false
         * @deprecated v33.0.0 - use `groupHideParentOfSingleChild: 'leafGroupsOnly'` instead.
         */
        this.groupRemoveLowestSingleChildren = undefined;
        /** Set to `true` to hide parents that are open. When used with multiple columns for showing groups, it can give a more pleasing user experience.
         * @default false
         * @agModule `RowGroupingModule`
         */
        this.groupHideOpenParents = undefined;
        /** When using `groupDisplayType='multipleColumns'` or `groupHideOpenParents=true`, hides group columns for levels
         * that have not yet been expanded. Only the top-level group column is initially
         * visible; each subsequent level becomes visible when at least one group at the
         * preceding level is expanded. (Client Side Row Model only)
         * @default false
         * @agModule `RowGroupingModule`
         */
        this.groupHideColumnsUntilExpanded = undefined;
        /** Set to `true` to prevent the grid from creating a '(Blanks)' group for nodes which do not belong to a group, and display the unbalanced nodes alongside group nodes.
         * @default false
         * @agModule `RowGroupingModule`
         */
        this.groupAllowUnbalanced = undefined;
        /** When to show the 'row group panel' (where you drag rows to group) at the top.
         * @default 'never'
         * @agModule `RowGroupingPanelModule`
         */
        this.rowGroupPanelShow = undefined;
        /** Provide the Cell Renderer to use when `groupDisplayType = 'groupRows'`.
         * See [Group Row Cell Renderer](https://www.ag-grid.com/javascript-data-grid/grouping-group-rows/#providing-cell-renderer) for framework specific implementation details.
         * @agModule `RowGroupingModule`
         */
        this.groupRowRenderer = undefined;
        /** Customise the parameters provided to the `groupRowRenderer` component.
         * @agModule `RowGroupingModule`
         */
        this.groupRowRendererParams = undefined;
        /** Set to `true` to enable the Grid to work with Tree Data.
         * You must also implement the `getDataPath(data)` callback.
         * @default false
         * @agModule `TreeDataModule`
         */
        this.treeData = undefined;
        /** The name of the field to use in a data item to retrieve the array of children nodes of a node when while using treeData=true.
         * It supports accessing nested fields using the dot notation.
         * @agModule `TreeDataModule`
         */
        this.treeDataChildrenField = undefined;
        /** The name of the field to use in a data item to find the parent node of a node when using treeData=true.
         * The tree will be constructed via relationships between nodes using this field.
         * getRowId callback need to be provided as well for this to work.
         * It supports accessing nested fields using the dot notation.
         * @agModule `TreeDataModule`
         */
        this.treeDataParentIdField = undefined;
        /** Set to `true` to suppress sort indicators and actions from the row group panel.
         * @default false
         * @agModule `RowGroupingPanelModule`
         */
        this.rowGroupPanelSuppressSort = undefined;
        /** Set to `true` to suppress sort indicators and actions from the pivot panel and the column tool panel pivot pills.
         * @default false
         * @agModule `RowGroupingPanelModule`
         */
        this.pivotPanelSuppressSort = undefined;
        /** Set to `true` prevent Group Rows from sticking to the top of the grid.
         * @default false
         * @initial
         * @agModule `RowGroupingModule` / `TreeDataModule`
         */
        this.suppressGroupRowsSticky = undefined;
        /** Maximum share of the viewport height that each sticky row section (top or bottom) may occupy, as a number between 0 and 1.
         * Rows that do not fit within the resulting height budget do not stick and scroll normally instead.
         * @default 0.5
         * @agModule `RowGroupingModule` / `TreeDataModule` / `ServerSideRowModelModule`
         */
        this.stickyRowsMaxViewportRatio = undefined;
        /** Custom group hierarchy components can be defined here for later use in `colDef.groupHierarchy`
         * @agModule `RowGroupingModule`
         */
        this.groupHierarchyConfig = undefined;
        /** Data to be displayed as pinned top rows in the grid.
         * @agModule `PinnedRowModule`
         */
        this.pinnedTopRowData = undefined;
        /** Data to be displayed as pinned bottom rows in the grid.
         * @agModule `PinnedRowModule`
         */
        this.pinnedBottomRowData = undefined;
        /** Determines whether manual row pinning is enabled via the row context menu.
         *
         * Set to `true` to allow pinning rows to top or bottom.
         * Set to `'top'` to allow pinning rows to the top only.
         * Set to `'bottom'` to allow pinning rows to the bottom only.
         * @agModule `PinnedRowModule`
         */
        this.enableRowPinning = undefined;
        /** Return `true` if the grid should allow the row to be manually pinned.
         * Return `false` if the grid should prevent the row from being pinned
         *
         * When not defined, all rows default to pinnable.
         * @agModule `PinnedRowModule`
         */
        this.isRowPinnable = undefined;
        /** Called for every row in the grid.
         *
         * Return "top", "bottom" if the row should be initially pinned to the top or bottom respectively.
         * Return `null` or `undefined` otherwise.
         * User interactions can subsequently still change the pinned state of a row.
         * @agModule `PinnedRowModule`
         */
        this.isRowPinned = undefined;
        /** Sets the row model type.
         * @default 'clientSide'
         * @initial
         * @agModule `ClientSideRowModelModule` / `InfiniteRowModelModule` / `ServerSideRowModelModule` / `ViewportRowModelModule`
         */
        this.rowModelType = undefined;
        /** Set the data to be displayed as rows in the grid.
         * @agModule `ClientSideRowModelModule`
         */
        this.rowData = undefined;
        /** How many milliseconds to wait before executing a batch of async transactions.
         */
        this.asyncTransactionWaitMillis = undefined;
        /** Prevents Transactions changing sort, filter, group or pivot state when transaction only contains updates.
         * @default false
         */
        this.suppressModelUpdateAfterUpdateTransaction = undefined;
        /** Provide the datasource for infinite scrolling.
         * @agModule `InfiniteRowModelModule`
         */
        this.datasource = undefined;
        /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
         * @default 1
         * @initial
         * @agModule `InfiniteRowModelModule`
         */
        this.cacheOverflowSize = undefined;
        /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
         * @default 1
         * @initial
         * @agModule `InfiniteRowModelModule`
         */
        this.infiniteInitialRowCount = undefined;
        /** Set how many loading rows to display to the user for the root level group.
         * @default 1
         * @initial
         * @agModule `ServerSideRowModelModule`
         */
        this.serverSideInitialRowCount = undefined;
        /** When `true`, the Server-side Row Model will not use a full width loading renderer, instead using the colDef `loadingCellRenderer` if present.
         * @agModule `ServerSideRowModelModule`
         */
        this.suppressServerSideFullWidthLoadingRow = undefined;
        /** How many rows for each block in the store, i.e. how many rows returned from the server at a time.
         * @default 100
         * @agModule `ServerSideRowModelModule` / `InfiniteRowModelModule`
         */
        this.cacheBlockSize = undefined;
        /** How many blocks to keep in the store. Default is no limit, so every requested block is kept. Use this if you have memory concerns, and blocks that were least recently viewed will be purged when the limit is hit. The grid will additionally make sure it has all the blocks needed to display what is currently visible, in case this property is set to a low value.
         * @initial
         * @agModule `ServerSideRowModelModule` / `InfiniteRowModelModule`
         */
        this.maxBlocksInCache = undefined;
        /** How many requests to hit the server with concurrently. If the max is reached, requests are queued.
         * Set to `-1` for no maximum restriction on requests.
         * @default 2
         * @initial
         * @agModule `ServerSideRowModelModule` / `InfiniteRowModelModule`
         */
        this.maxConcurrentDatasourceRequests = undefined;
        /** How many milliseconds to wait before loading a block. Useful when scrolling over many blocks, as it prevents blocks loading until scrolling has settled.
         * @initial
         * @agModule `ServerSideRowModelModule` / `InfiniteRowModelModule`
         */
        this.blockLoadDebounceMillis = undefined;
        /** When enabled, closing group rows will remove children of that row. Next time the row is opened, child rows will be read from the datasource again. This property only applies when there is Row Grouping or Tree Data.
         * @default false
         * @agModule `ServerSideRowModelModule`
         */
        this.purgeClosedRowNodes = undefined;
        /** Provide the `serverSideDatasource` for server side row model.
         * @agModule `ServerSideRowModelModule`
         */
        this.serverSideDatasource = undefined;
        /** When enabled, always refreshes top level groups regardless of which column was sorted. This property only applies when there is Row Grouping & sorting is handled on the server.
         * @default false
         * @agModule `ServerSideRowModelModule`
         */
        this.serverSideSortAllLevels = undefined;
        /** When enabled, sorts fully loaded groups in the browser instead of requesting from the server.
         * @default false
         * @agModule `ServerSideRowModelModule`
         */
        this.serverSideEnableClientSideSort = undefined;
        /** When enabled, only refresh groups directly impacted by a filter. This property only applies when there is Row Grouping & filtering is handled on the server.
         * @default false
         * @initial
         * @agModule `ServerSideRowModelModule`
         */
        this.serverSideOnlyRefreshFilteredGroups = undefined;
        /** Used to split pivot field strings for generating pivot result columns when `pivotResultFields` is provided as part of a `getRows` success.
         * @default '_'
         * @initial
         * @agModule `ServerSideRowModelModule`
         */
        this.serverSidePivotResultFieldSeparator = undefined;
        /** To use the viewport row model you need to provide the grid with a `viewportDatasource`.
         * @agModule `ViewportRowModelModule`
         */
        this.viewportDatasource = undefined;
        /** When using viewport row model, sets the page size for the viewport.
         * @initial
         * @agModule `ViewportRowModelModule`
         */
        this.viewportRowModelPageSize = undefined;
        /** When using viewport row model, sets the buffer size for the viewport.
         * @initial
         * @agModule `ViewportRowModelModule`
         */
        this.viewportRowModelBufferSize = undefined;
        /** Set to `true` to always show the horizontal scrollbar.
         * @default false
         */
        this.alwaysShowHorizontalScroll = undefined;
        /** Set to `true` to always show the vertical scrollbar.
         * @default false
         */
        this.alwaysShowVerticalScroll = undefined;
        /** Set to `true` to debounce the vertical scrollbar. Can provide smoother scrolling on slow machines.
         * @default false
         * @initial
         */
        this.debounceVerticalScrollbar = undefined;
        /** Set to `true` to never show the horizontal scroll. This is useful if the grid is aligned with another grid and will scroll when the other grid scrolls. (Should not be used in combination with `alwaysShowHorizontalScroll`.)
         * @default false
         */
        this.suppressHorizontalScroll = undefined;
        /** When `true`, the grid will not scroll to the top when new row data is provided. Use this if you don't want the default behaviour of scrolling to the top every time you load new data.
         * @default false
         */
        this.suppressScrollOnNewData = undefined;
        /** When `true`, the grid will not allow mousewheel / touchpad scroll when popup elements are present.
         * @default false
         */
        this.suppressScrollWhenPopupsAreOpen = undefined;
        /** When `true`, the grid will not use animation frames when drawing rows while scrolling. Use this if and only if the grid is working fast enough on all users machines and you want to avoid the temporarily empty rows.
         *     **Note:** It is not recommended to set suppressAnimationFrame to `true` in most use cases as this can seriously degrade the user experience as all cells are rendered synchronously blocking the UI thread from scrolling.
         * @default false
         * @initial
         */
        this.suppressAnimationFrame = undefined;
        /** If `true`, middle clicks will result in `click` events for cells and rows. Otherwise the browser will use middle click to scroll the grid.<br />**Note:** Not all browsers fire `click` events with the middle button. Most will fire only `mousedown` and `mouseup` events, which can be used to focus a cell, but will not work to call the `onCellClicked` function.
         * @default false
         */
        this.suppressMiddleClickScrolls = undefined;
        /** If `true`, mouse wheel events will be passed to the browser. Useful if your grid has no vertical scrolls and you want the mouse to scroll the browser page.
         * @default false
         * @initial
         */
        this.suppressPreventDefaultOnMouseWheel = undefined;
        /** Tell the grid how wide in pixels the scrollbar is, which is used in grid width calculations. Set only if using non-standard browser-provided scrollbars, so the grid can use the non-standard size in its calculations.
         * @initial
         */
        this.scrollbarWidth = undefined;
        /** Use the `RowSelectionOptions` object to configure row selection. The string values `'single'` and `'multiple'` are deprecated.
         * @agModule `RowSelectionModule`
         */
        this.rowSelection = undefined;
        /** Configure cell selection.
         * @agModule `CellSelectionModule`
         */
        this.cellSelection = undefined;
        /** Set to `true` to allow multiple rows to be selected using single click.
         * @default false
         * @deprecated v32.2 Use `rowSelection.enableSelectionWithoutKeys` instead
         */
        this.rowMultiSelectWithClick = undefined;
        /** If `true`, rows will not be deselected if you hold down `Ctrl` and click the row or press `Space`.
         * @default false
         * @deprecated v32.2 Use `rowSelection.enableClickSelection` instead
         */
        this.suppressRowDeselection = undefined;
        /** If `true`, row selection won't happen when rows are clicked. Use when you only want checkbox selection.
         * @default false
         * @deprecated v32.2 Use `rowSelection.enableClickSelection` instead
         */
        this.suppressRowClickSelection = undefined;
        /** If `true`, cells won't be focusable. This means keyboard navigation will be disabled for grid cells, but remain enabled in other elements of the grid such as column headers, floating filters, tool panels.
         * @default false
         */
        this.suppressCellFocus = undefined;
        /** If `true`, header cells won't be focusable. This means keyboard navigation will be disabled for grid header cells, but remain enabled in other elements of the grid such as grid cells and tool panels.
         * @default false
         */
        this.suppressHeaderFocus = undefined;
        /** Configure the selection column, used for displaying checkboxes.
         *
         * Note that due to the nature of this column, this type is a subset of `ColDef`, which does not support several normal column features such as editing, pivoting and grouping.
         */
        this.selectionColumnDef = undefined;
        /** Configure the Row Numbers Feature.
         * @default false
         * @agModule `RowNumbersModule`
         */
        this.rowNumbers = undefined;
        /** If `true`, only a single range can be selected.
         * @default false
         * @deprecated v32.2 Use `cellSelection.suppressMultiRanges` instead
         */
        this.suppressMultiRangeSelection = undefined;
        /** Set to `true` to be able to select the text within cells.
         *
         *     **Note:** When this is set to `true`, the clipboard service is disabled and only selected text is copied.
         * @default false
         */
        this.enableCellTextSelection = undefined;
        /** Set to `true` to enable Range Selection.
         * @default false
         * @deprecated v32.2 Use `cellSelection = true` instead
         * @agModule `CellSelectionModule`
         */
        this.enableRangeSelection = undefined;
        /** Set to `true` to enable the Range Handle.
         * @default false
         * @deprecated v32.2 Use `cellSelection.handle` instead
         */
        this.enableRangeHandle = undefined;
        /** Set to `true` to enable the Fill Handle.
         * @default false
         * @deprecated v32.2 Use `cellSelection.handle` instead
         */
        this.enableFillHandle = undefined;
        /** Set to `'x'` to force the fill handle direction to horizontal, or set to `'y'` to force the fill handle direction to vertical.
         * @default 'xy'
         * @deprecated v32.2 Use `cellSelection.handle.direction` instead
         */
        this.fillHandleDirection = undefined;
        /** Set this to `true` to prevent cell values from being cleared when the Range Selection is reduced by the Fill Handle.
         * @default false
         * @deprecated v32.2 Use `cellSelection.suppressClearOnFillReduction` instead
         */
        this.suppressClearOnFillReduction = undefined;
        /** Array defining the order in which sorting occurs (if sorting is enabled). Values can be `'asc'`, `'desc'` or `null`. For example: `sortingOrder: ['asc', 'desc']`.
         * @default ['asc', 'desc', null]
         * @deprecated v33 Use `defaultColDef.sortingOrder` instead
         */
        this.sortingOrder = undefined;
        /** Set to `true` to specify that the sort should take accented characters into account. If this feature is turned on the sort will be slower.
         * @default false
         */
        this.accentedSort = undefined;
        /** Set to `true` to show the 'no sort' icon.
         * @default false
         * @deprecated v33 Use `defaultColDef.unSortIcon` instead
         */
        this.unSortIcon = undefined;
        /** Set to `true` to suppress multi-sort when the user shift-clicks a column header.
         * @default false
         */
        this.suppressMultiSort = undefined;
        /** Set to `true` to always multi-sort when the user clicks a column header, regardless of key presses.
         * @default false
         */
        this.alwaysMultiSort = undefined;
        /** Set to `'ctrl'` to have multi sorting by clicking work using the `Ctrl` (or `Command ⌘` for Mac) key.
         */
        this.multiSortKey = undefined;
        /** Set to `true` to suppress sorting of un-sorted data to match original row data.
         * @default false
         */
        this.suppressMaintainUnsortedOrder = undefined;
        /** Icons to use inside the grid instead of the grid's default icons.
         * @initial
         */
        this.icons = undefined;
        /** Default row height in pixels.
         * @default 25
         */
        this.rowHeight = undefined;
        /** The style properties to apply to all rows. Set to an object of key (style names) and values (style values).
         * @agModule `RowStyleModule`
         */
        this.rowStyle = undefined;
        /** CSS class(es) for all rows. Provide either a string (class name) or array of strings (array of class names).
         * @agModule `RowStyleModule`
         */
        this.rowClass = undefined;
        /** Rules which can be applied to include certain CSS classes.
         * @agModule `RowStyleModule`
         */
        this.rowClassRules = undefined;
        /** Set to `true` to not highlight rows by adding the `ag-row-hover` CSS class.
         * @default false
         */
        this.suppressRowHoverHighlight = undefined;
        /** Uses CSS `top` instead of CSS `transform` for positioning rows. Useful if the transform function is causing issues such as used in row spanning.
         * @default false
         * @initial
         */
        this.suppressRowTransform = undefined;
        /** Setting this option to false is equivalent to setting `enableContentVisibilityAuto` to true. If both are set, `enableContentVisibilityAuto` takes precedence.
         * @default true
         * @initial
         * @deprecated v36.1 use enableContentVisibilityAuto instead
         */
        this.suppressContentVisibilityAuto = undefined;
        /** Set to `true` to enable `content-visibility: auto` on the grid wrapper element. This improves performance by allowing the browser to skip rendering grids that are off screen. JavaScript size measurement APIs like `offsetWidth` or `getBoundingClientRect` will report zero size when the grid is off-screen. This means that APIs that need to measure the size of DOM elements, like `sizeColumnsToFit` will not work either. To ensure that `autoSizeStrategy` works, content-visibility:auto will only be applied 1000ms after rendering the first data. This can be customised with `contentVisibilityAutoDelay`
         * @default false
         * @initial
         */
        this.enableContentVisibilityAuto = undefined;
        /** The delay in ms between the firstDataRendered event and enabling content-visibility:auto on the grid wrapper element
         * @default 1000
         * @initial
         */
        this.contentVisibilityAutoDelay = undefined;
        /** Set to `true` to highlight columns by adding the `ag-column-hover` CSS class.
         * @default false
         * @agModule `ColumnHoverModule`
         */
        this.columnHoverHighlight = undefined;
        /** Provide a custom `gridId` for this instance of the grid. Value will be set on the root DOM node using the attribute `grid-id` as well as being accessible via the `gridApi.getGridId()` method.
         * @initial
         */
        this.gridId = undefined;
        /** When enabled, sorts only the rows added/updated by a transaction.
         *
         * Ignored when `postSortRows` is configured (falls back to full sort).
         * @default false
         */
        this.deltaSort = undefined;
        /** Specifies how tree data should be displayed.
         *
         * The options are:
         *
         * - `'auto'`: group column automatically added by the grid.
         * - `'custom'`: informs the grid that group columns will be provided.
         * @agModule `TreeDataModule`
         */
        this.treeDataDisplayType = undefined;
        /** @initial
         */
        this.enableGroupEdit = undefined;
        /** Initial state for the grid. Only read once on initialization. Can be used in conjunction with `api.getState()` to save and restore grid state.
         * @initial
         * @agModule `GridStateModule`
         */
        this.initialState = undefined;
        /** Theme to apply to the grid, or the string "legacy" to opt back into the
         * v32 style of theming where themes were imported as CSS files and applied
         * by setting a class name on the parent element.
         *
         * @default themeQuartz
         */
        this.theme = undefined;
        /** If your theme uses a font that is available on Google Fonts, pass true to load it from Google's CDN.
         */
        this.loadThemeGoogleFonts = undefined;
        /** The CSS layer that this theme should be rendered onto. When specified,
         * grid CSS will be wrapped in a `@layer ${themeCssLayer} { ... }` block.
         *
         * NOTE: when specifying `themeCssLayer` we recommend setting
         * `themeStyleContainer` to `document.body` to ensure that the grid CSS
         * comes after your application CSS, allowing your application to set the
         * order of layers.
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@layer
         */
        this.themeCssLayer = undefined;
        /** The nonce attribute to set on style elements added to the document by
         * themes. If "foo" is passed to this property, the grid can use the Content
         * Security Policy `style-src 'nonce-foo'`, instead of the less secure
         * `style-src 'unsafe-inline'`.
         *
         * Note: CSP nonces are global to a page, where a page has multiple grids,
         * every one must have the same styleNonce set.
         */
        this.styleNonce = undefined;
        /** An element to insert style elements into when injecting styles into the
         * grid. Styles are inserted at the start of the element.
         *
         * If undefined, styles will be added to the document head for grids
         * rendered in the main document fragment, or to the grid wrapper element
         * for other grids (e.g. those rendered in a shadow DOM or detached from the
         * document).
         *
         * @initial
         */
        this.themeStyleContainer = undefined;
        /** For customising the context menu.
         * @agModule `ContextMenuModule`
         */
        this.getContextMenuItems = undefined;
        /** For customising the main 'column header' menu.
         * @initial
         * @agModule `ColumnMenuModule`
         */
        this.getMainMenuItems = undefined;
        /** For customising the menu items shown for a column across the column menu, the Columns Tool Panel
         * right-click menu, and the Column Chooser. The `source` param indicates which surface the menu is for;
         * branch on it to target a single surface. Takes precedence over `getMainMenuItems` for the column menu.
         * @initial
         * @agModule `ColumnMenuModule` / `ColumnsToolPanelModule`
         */
        this.getColumnMenuItems = undefined;
        /** Allows user to process popups after they are created. Applications can use this if they want to, for example, reposition the popup.
         */
        this.postProcessPopup = undefined;
        /** Allows the user to process the columns being removed from the pinned section because the viewport is too small to accommodate them.
         * Returns an array of columns to be removed from the pinned areas.
         * @initial
         */
        this.processUnpinnedColumns = undefined;
        /** Allows you to process cells for the clipboard. Handy if for example you have `Date` objects that need to have a particular format if importing into Excel.
         * @agModule `ClipboardModule`
         */
        this.processCellForClipboard = undefined;
        /** Allows you to process header values for the clipboard.
         * @agModule `ClipboardModule`
         */
        this.processHeaderForClipboard = undefined;
        /** Allows you to process group header values for the clipboard.
         * @agModule `ClipboardModule`
         */
        this.processGroupHeaderForClipboard = undefined;
        /** Allows you to process cells from the clipboard. Handy if for example you have number fields and want to block non-numbers from getting into the grid.
         * @agModule `ClipboardModule`
         */
        this.processCellFromClipboard = undefined;
        /** Allows you to get the data that would otherwise go to the clipboard. To be used when you want to control the 'copy to clipboard' operation yourself.
         * @agModule `ClipboardModule`
         */
        this.sendToClipboard = undefined;
        /** Allows complete control of the paste operation, including cancelling the operation (so nothing happens) or replacing the data with other data.
         * @agModule `ClipboardModule`
         */
        this.processDataFromClipboard = undefined;
        /** Grid calls this method to know if an external filter is present.
         * Called exactly once every time the grid senses a filter change.
         * Should return `true` if external filtering is active, otherwise `false`.
         * If `true`, `doesExternalFilterPass` is called while filtering, otherwise it is not called.
         * Supplying a new function reference re-runs external filtering.
         * @agModule `ExternalFilterModule`
         */
        this.isExternalFilterPresent = undefined;
        /** Called once for each row node in the grid.
         * Should return `true` if external filter passes, otherwise `false`.
         * If `false`, the node is excluded from the final set.
         * Only runs if `isExternalFilterPresent` returns `true`.
         * Supplying a new function reference re-runs external filtering.
         * @agModule `ExternalFilterModule`
         */
        this.doesExternalFilterPass = undefined;
        /** Callback to be used to customise the chart toolbar items.
         * @initial
         * @agModule `IntegratedChartsModule`
         */
        this.getChartToolbarItems = undefined;
        /** Callback to enable displaying the chart in an alternative chart container.
         * @initial
         * @agModule `IntegratedChartsModule`
         */
        this.createChartContainer = undefined;
        /** Allows overriding the element that will be focused when the grid receives focus from outside elements (tabbing into the grid).
         * @returns `True` if this function should override the grid's default behavior, `False` to allow the grid's default behavior.
         */
        this.focusGridInnerElement = undefined;
        /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.
         */
        this.navigateToNextHeader = undefined;
        /** Allows overriding the default behaviour for when user hits `Tab` key when a header is focused.
         * Return the next header position to navigate to, `true` to stay on the current header,
         * or `false` to let the browser handle the tab behaviour.
         */
        this.tabToNextHeader = undefined;
        /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a cell is focused. Return the next Cell position to navigate to or `null` to stay on current cell.
         */
        this.navigateToNextCell = undefined;
        /** Allows overriding the default behaviour for when user hits `Tab` key when a cell is focused.
         * Return the next cell position to navigate to, `true` to stay on the current cell,
         * or `false` to let the browser handle the tab behaviour.
         */
        this.tabToNextCell = undefined;
        /** Allows overriding the default behaviour when tabbing between core grid containers.
         * Return a container name, a cell position, or a header position to focus that target,
         * `true` to stay on the current focus, `false` to let the browser handle tab behaviour,
         * or `undefined` to use the grid's default behaviour.
         */
        this.tabToNextGridContainer = undefined;
        /** A callback for localising text within the grid.
         * @initial
         * @agModule `LocaleModule`
         */
        this.getLocaleText = undefined;
        /** Allows overriding what `document` is used. Currently used by Drag and Drop (may extend to other places in the future). Use this when you want the grid to use a different `document` than the one available on the global scope. This can happen if docking out components (something which Electron supports)
         */
        this.getDocument = undefined;
        /** Allows user to format the numbers in the pagination panel, i.e. 'row count' and 'page number' labels. This is for pagination panel only, to format numbers inside the grid's cells (i.e. your data), then use `valueFormatter` in the column definitions.
         * @initial
         * @agModule `PaginationModule`
         */
        this.paginationNumberFormatter = undefined;
        /** Callback to use when you need access to more then the current column for aggregation.
         * @agModule `RowGroupingModule` / `PivotModule` / `TreeDataModule` / `ServerSideRowModelModule`
         */
        this.getGroupRowAgg = undefined;
        /** (Client-side Row Model only) Allows group rows to be open by default. For master rows use `isMasterOpenByDefault`.
         * @agModule `RowGroupingModule` / `TreeDataModule`
         */
        this.isGroupOpenByDefault = undefined;
        /** (Client-side Row Model only) Master Detail: allows master rows to be open by default.
         * @agModule `MasterDetailModule`
         */
        this.isMasterOpenByDefault = undefined;
        /** Controls how expand/collapse operations affect all rows and group interactions.
         * If `true`, expandAll / collapseAll applies to all rows (not just loaded ones),
         * and interacting with the group overrides the default expansion state set by `isServerSideGroupOpenByDefault`.
         * @agModule RowGroupingModule / TreeDataModule
         */
        this.ssrmExpandAllAffectsAllRows = undefined;
        /** Allows default sorting of groups.
         * @agModule `RowGroupingModule`
         */
        this.initialGroupOrderComparator = undefined;
        /** Callback for the mutation of the generated pivot result column definitions
         * @agModule `PivotModule`
         */
        this.processPivotResultColDef = undefined;
        /** Callback for the mutation of the generated pivot result column group definitions
         * @agModule `PivotModule`
         */
        this.processPivotResultColGroupDef = undefined;
        /** Callback to be used when working with Tree Data when `treeData = true`.
         * @initial
         * @agModule `TreeDataModule`
         */
        this.getDataPath = undefined;
        /** Allows setting the child count for a group row.
         * @initial
         * @agModule `ServerSideRowModelModule`
         */
        this.getChildCount = undefined;
        /** Allows providing different params for different levels of grouping.
         * @initial
         * @agModule `ServerSideRowModelModule`
         */
        this.getServerSideGroupLevelParams = undefined;
        /** Allows groups to be open by default.
         * @agModule `ServerSideRowModelModule`
         */
        this.isServerSideGroupOpenByDefault = undefined;
        /** Allows cancelling transactions.
         * @agModule `ServerSideRowModelModule`
         */
        this.isApplyServerSideTransaction = undefined;
        /** SSRM Tree Data: Allows specifying which rows are expandable.
         * @agModule `ServerSideRowModelModule`
         */
        this.isServerSideGroup = undefined;
        /** SSRM Tree Data: Allows specifying group keys.
         * @agModule `ServerSideRowModelModule`
         */
        this.getServerSideGroupKey = undefined;
        /** Return a business key for the node. If implemented, each row in the DOM will have an attribute `row-business-key='abc'` where `abc` is what you return as the business key.
         * This is useful for automated testing, as it provides a way for your tool to identify rows based on unique business keys.
         */
        this.getBusinessKeyForNode = undefined;
        /** Provide a pure function that returns a string ID to uniquely identify a given row. This enables the grid to work optimally with data changes and updates.
         * @initial
         */
        this.getRowId = undefined;
        /** When enabled, getRowId() callback is implemented and new Row Data is set, the grid will disregard all previous rows and treat the new Row Data as new data. As a consequence, all Row State (eg selection, rendered rows) will be reset.
         * @default false
         * @agModule `ClientSideRowModelModule`
         */
        this.resetRowDataOnUpdate = undefined;
        /** When enabled, column definitions are generated automatically from the first row of `rowData` whenever row data is set or updated.
         * Set to `true` to use default settings, or provide an `AutoGenerateColumnDefsOptions` object to customise how values are handled.
         * @default false
         * @agModule `AutoGenerateColumnsModule`
         */
        this.autoGenerateColumnDefs = undefined;
        /** Callback fired after auto-generating column definitions and before they are applied to the grid.
         * Return the final `(ColDef | ColGroupDef)[]` to use or void if only mutations of generated columnDefs are required.
         *
         * @agModule `AutoGenerateColumnsModule`
         */
        this.processAutoGeneratedColumnDefs = undefined;
        /** Callback fired after the row is rendered into the DOM. Should not be used to initiate side effects.
         */
        this.processRowPostCreate = undefined;
        /** Callback to be used to determine which rows are selectable. By default rows are selectable, so return `false` to make a row un-selectable.
         * @deprecated v32.2 Use `rowSelection.isRowSelectable` instead
         */
        this.isRowSelectable = undefined;
        /** Callback to be used with Master Detail to determine if a row should be a master row. If `false` is returned no detail row will exist for this row.
         * @agModule `MasterDetailModule`
         */
        this.isRowMaster = undefined;
        /** Callback to fill values instead of simply copying values or increasing number values using linear progression.
         * @deprecated v32.2 Use `cellSelection.handle.setFillValue` instead
         */
        this.fillOperation = undefined;
        /** Callback to perform additional sorting after the grid has sorted the rows.
         *
         * When configured, `deltaSort` is ignored.
         */
        this.postSortRows = undefined;
        /** Callback version of property `rowStyle` to set style for each row individually. Function should return an object of CSS values or undefined for no styles.
         * @agModule `RowStyleModule`
         */
        this.getRowStyle = undefined;
        /** Callback version of property `rowClass` to set class(es) for each row individually. Function should return either a string (class name), array of strings (array of class names) or undefined for no class.
         * @agModule `RowStyleModule`
         */
        this.getRowClass = undefined;
        /** Callback version of property `rowHeight` to set height for each row individually. Function should return a positive number of pixels, or return `null`/`undefined` to use the default row height.
         */
        this.getRowHeight = undefined;
        /** Tells the grid if this row should be rendered as full width.
         */
        this.isFullWidthRow = undefined;
        /** Called by drag and drop when rows are dragged over another row to conditionally prevent dropping the dragged row on the hovered row.
         * The user can cancel the drop by returning `false` or customize the operation by returning a `IsRowValidDropPositionResult`.
         * @agModule `RowDragModule`
         */
        this.isRowValidDropPosition = undefined;
        /** The tool panel visibility has changed. Fires twice if switching between panels - once with the old panel and once with the new panel.
         */
        this.toolPanelVisibleChanged = new EventEmitter();
        /** The tool panel size has been changed.
         */
        this.toolPanelSizeChanged = new EventEmitter();
        /** The column menu visibility has changed. Fires twice if switching between tabs - once with the old tab and once with the new tab.
         */
        this.columnMenuVisibleChanged = new EventEmitter();
        /** The context menu visibility has changed (opened or closed).
         */
        this.contextMenuVisibleChanged = new EventEmitter();
        /** Cut operation has started.
         */
        this.cutStart = new EventEmitter();
        /** Cut operation has ended.
         */
        this.cutEnd = new EventEmitter();
        /** Paste operation has started.
         */
        this.pasteStart = new EventEmitter();
        /** Paste operation has ended.
         */
        this.pasteEnd = new EventEmitter();
        /** A calculated column has been created.
         */
        this.calculatedColumnCreated = new EventEmitter();
        /** A calculated column expression has changed.
         */
        this.calculatedColumnExpressionChanged = new EventEmitter();
        /** A calculated column has been removed.
         */
        this.calculatedColumnRemoved = new EventEmitter();
        /** A calculated column expression has changed between valid and invalid.
         */
        this.calculatedColumnValidationStateChanged = new EventEmitter();
        /** A column, or group of columns, was hidden / shown.
         */
        this.columnVisible = new EventEmitter();
        /** A column, or group of columns, was pinned / unpinned.
         */
        this.columnPinned = new EventEmitter();
        /** A column or column group header name changed. Fires for edits made through the UI header-name
         * editor and for header names applied via column state (e.g. `applyColumnState`, state reset).
         * Inspect `event.source` to distinguish (`'uiColumnHeaderEdit'` for editor changes).
         */
        this.columnHeaderNameChanged = new EventEmitter();
        /** A column was resized.
         */
        this.columnResized = new EventEmitter();
        /** A column was moved.
         */
        this.columnMoved = new EventEmitter();
        /** A value column was added or removed.
         */
        this.columnValueChanged = new EventEmitter();
        /** The pivot mode flag was changed.
         */
        this.columnPivotModeChanged = new EventEmitter();
        /** A pivot column was added, removed or order changed.
         */
        this.columnPivotChanged = new EventEmitter();
        /** A column group was opened / closed.
         */
        this.columnGroupOpened = new EventEmitter();
        /** User set new columns.
         */
        this.newColumnsLoaded = new EventEmitter();
        /** The list of grid columns changed.
         */
        this.gridColumnsChanged = new EventEmitter();
        /** The list of displayed columns changed. This can result from columns open / close, column move, pivot, group, etc.
         */
        this.displayedColumnsChanged = new EventEmitter();
        /** The list of rendered columns changed (only columns in the visible scrolled viewport are rendered by default).
         */
        this.virtualColumnsChanged = new EventEmitter();
        /** @deprecated v32.2 Either use `onDisplayedColumnsChanged` which is fired at the same time,
         * or use one of the more specific column events.
         */
        this.columnEverythingChanged = new EventEmitter();
        /** Columns have been reset to their default state as reflected by the colDefs.
         */
        this.columnsReset = new EventEmitter();
        /** A mouse cursor is initially moved over a column header.
         */
        this.columnHeaderMouseOver = new EventEmitter();
        /** A mouse cursor is moved out of a column header.
         */
        this.columnHeaderMouseLeave = new EventEmitter();
        /** A click is performed on a column header.
         */
        this.columnHeaderClicked = new EventEmitter();
        /** A context menu action, such as right-click or context menu key press, is performed on a column header.
         */
        this.columnHeaderContextMenu = new EventEmitter();
        /** Only used by Angular, React and VueJS AG Grid components (not used if doing plain JavaScript).
         * If the grid receives changes due to bound properties, this event fires after the grid has finished processing the change.
         */
        this.componentStateChanged = new EventEmitter();
        /** Cell value has changed. This occurs after the following scenarios:
         * - Editing. Will not fire if any of the following are true:
         *     new value is the same as old value;
         *     `readOnlyEdit = true`;
         *     editing was cancelled (e.g. Escape key was pressed);
         *     or new value is of the wrong cell data type for the column.
         *  - Cut.
         *  - Paste.
         *  - Cell clear (pressing Delete key).
         *  - Fill handle.
         *  - Copy range down.
         *  - Undo and redo.
         */
        this.cellValueChanged = new EventEmitter();
        /** Value has changed after editing. Only fires when `readOnlyEdit=true`.
         */
        this.cellEditRequest = new EventEmitter();
        /** A cell's value within a row has changed. This event corresponds to Full Row Editing only.
         */
        this.rowValueChanged = new EventEmitter();
        /** Editing a cell has started.
         */
        this.cellEditingStarted = new EventEmitter();
        /** Editing a cell has stopped.
         */
        this.cellEditingStopped = new EventEmitter();
        /** Editing a row has started (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStarted` will be fired for each individual cell. Only fires when doing Full Row Editing.
         */
        this.rowEditingStarted = new EventEmitter();
        /** Editing a row has stopped (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStopped` will be fired for each individual cell. Only fires when doing Full Row Editing.
         */
        this.rowEditingStopped = new EventEmitter();
        /** Bulk editing has started.
         */
        this.bulkEditingStarted = new EventEmitter();
        /** Bulk editing has stopped.
         */
        this.bulkEditingStopped = new EventEmitter();
        /** Fired when the first edit is made after `api.startBatchEdit()` is called.
         * This event fires lazily — not immediately on `api.startBatchEdit()`, but on the first cell value change or editor open within the batch session.
         */
        this.batchEditingStarted = new EventEmitter();
        /** Batch editing has stopped (when batch editing is enabled). Contains a list of edits if the batch was committed via `api.commitBatchEdit()`.
         */
        this.batchEditingStopped = new EventEmitter();
        /** Undo operation has started.
         */
        this.undoStarted = new EventEmitter();
        /** Undo operation has ended.
         */
        this.undoEnded = new EventEmitter();
        /** Redo operation has started.
         */
        this.redoStarted = new EventEmitter();
        /** Redo operation has ended.
         */
        this.redoEnded = new EventEmitter();
        /** Cell selection delete operation (cell clear) has started.
         */
        this.cellSelectionDeleteStart = new EventEmitter();
        /** Cell selection delete operation (cell clear) has ended.
         */
        this.cellSelectionDeleteEnd = new EventEmitter();
        /** Range delete operation (cell clear) has started.
         *
         * @deprecated v32.2 Use `onCellSelectionDeleteStart` instead
         */
        this.rangeDeleteStart = new EventEmitter();
        /** Range delete operation (cell clear) has ended.
         *
         * @deprecated v32.2 Use `onCellSelectionDeleteEnd` instead
         */
        this.rangeDeleteEnd = new EventEmitter();
        /** Fill operation has started.
         */
        this.fillStart = new EventEmitter();
        /** Fill operation has ended.
         */
        this.fillEnd = new EventEmitter();
        /** Filter has been opened.
         */
        this.filterOpened = new EventEmitter();
        /** Filter has been modified and applied.
         */
        this.filterChanged = new EventEmitter();
        /** Filter was modified but not applied  (when using `enableFilterHandlers = false`). Used when filters have 'Apply' buttons.
         */
        this.filterModified = new EventEmitter();
        /** Filter UI was modified (when using `enableFilterHandlers = true`).
         */
        this.filterUiChanged = new EventEmitter();
        /** Floating filter UI modified (when using `enableFilterHandlers = true`).
         */
        this.floatingFilterUiChanged = new EventEmitter();
        /** Advanced Filter Builder visibility has changed (opened or closed).
         */
        this.advancedFilterBuilderVisibleChanged = new EventEmitter();
        /** Find details have changed (e.g. Find search value, active match, or updates to grid cells).
         */
        this.findChanged = new EventEmitter();
        /** A chart has been created.
         */
        this.chartCreated = new EventEmitter();
        /** The data range for the chart has been changed.
         */
        this.chartRangeSelectionChanged = new EventEmitter();
        /** Formatting changes have been made by users through the Customize Panel.
         */
        this.chartOptionsChanged = new EventEmitter();
        /** A chart has been destroyed.
         */
        this.chartDestroyed = new EventEmitter();
        /** DOM event `keyDown` happened on a cell.
         */
        this.cellKeyDown = new EventEmitter();
        /** The grid has initialised and is ready for most api calls, but may not be fully rendered yet      */
        this.gridReady = new EventEmitter();
        /** Fired the first time data is rendered into the grid. Use this event if you want to auto resize columns based on their contents     */
        this.firstDataRendered = new EventEmitter();
        /** The size of the grid `div` has changed. In other words, the grid was resized.
         */
        this.gridSizeChanged = new EventEmitter();
        /** Displayed rows have changed. Triggered after sort, filter or tree expand / collapse events.
         */
        this.modelUpdated = new EventEmitter();
        /** A row was removed from the DOM, for any reason. Use to clean up resources (if any) used by the row.
         */
        this.virtualRowRemoved = new EventEmitter();
        /** Which rows are rendered in the DOM has changed.
         */
        this.viewportChanged = new EventEmitter();
        /** The body was scrolled horizontally or vertically.
         */
        this.bodyScroll = new EventEmitter();
        /** Main body of the grid has stopped scrolling, either horizontally or vertically.
         */
        this.bodyScrollEnd = new EventEmitter();
        /** When dragging starts. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.
         */
        this.dragStarted = new EventEmitter();
        /** When dragging stops. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.
         */
        this.dragStopped = new EventEmitter();
        /** When dragging is cancelled stops. This is caused by pressing `Escape` while dragging elements within the grid that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.
         */
        this.dragCancelled = new EventEmitter();
        /** Grid state has been updated.
         */
        this.stateUpdated = new EventEmitter();
        /** A development-time diagnostic - an error, warning or deprecation - was raised. Fires for every
         * diagnostic, whether or not it is also shown in the validation overlay or thrown by `throwOn`,
         * so tooling can react to it programmatically. Diagnostics raised before the grid is created
         * (e.g. a missing row model module) are reported to the console only, as no grid exists to
         * receive them.
         * @agModule `ValidationModule`
         */
        this.issueRaised = new EventEmitter();
        /** Triggered every time the paging state changes. Some of the most common scenarios for this event to be triggered are:
         *
         *  - The page size changes.
         *  - The current shown page is changed.
         *  - New data is loaded onto the grid.
         */
        this.paginationChanged = new EventEmitter();
        /** A drag has started, or dragging was already started and the mouse has re-entered the grid having previously left the grid.
         */
        this.rowDragEnter = new EventEmitter();
        /** The mouse has moved while dragging.
         */
        this.rowDragMove = new EventEmitter();
        /** The mouse has left the grid while dragging.
         */
        this.rowDragLeave = new EventEmitter();
        /** The drag has finished over the grid.
         */
        this.rowDragEnd = new EventEmitter();
        /** The drag has been cancelled over the grid.
         */
        this.rowDragCancel = new EventEmitter();
        /** The row resize has started (Row Numbers Feature)
         */
        this.rowResizeStarted = new EventEmitter();
        /** The row resize has ended (Row Numbers Feature)
         */
        this.rowResizeEnded = new EventEmitter();
        /** A row group column was added, removed or reordered.
         */
        this.columnRowGroupChanged = new EventEmitter();
        /** A row group was opened or closed.
         */
        this.rowGroupOpened = new EventEmitter();
        /** Fired when calling either of the API methods `expandAll()` or `collapseAll()`.
         */
        this.expandOrCollapseAll = new EventEmitter();
        /** Exceeded the `pivotMaxGeneratedColumns` limit when generating columns.
         */
        this.pivotMaxColumnsExceeded = new EventEmitter();
        /** The client has set new pinned row data into the grid.
         */
        this.pinnedRowDataChanged = new EventEmitter();
        /** A row has been pinned to top or bottom, or unpinned.
         */
        this.pinnedRowsChanged = new EventEmitter();
        /** Client-Side Row Model only. The client has updated data for the grid by either a) setting new Row Data or b) Applying a Row Transaction.
         */
        this.rowDataUpdated = new EventEmitter();
        /** Async transactions have been applied. Contains a list of all transaction results.
         */
        this.asyncTransactionsFlushed = new EventEmitter();
        /** A server side store has finished refreshing.
         */
        this.storeRefreshed = new EventEmitter();
        /** Header is focused.
         */
        this.headerFocused = new EventEmitter();
        /** Cell is clicked.
         */
        this.cellClicked = new EventEmitter();
        /** Cell is double clicked.
         */
        this.cellDoubleClicked = new EventEmitter();
        /** Cell is focused.
         */
        this.cellFocused = new EventEmitter();
        /** Mouse entered cell.
         */
        this.cellMouseOver = new EventEmitter();
        /** Mouse left cell.
         */
        this.cellMouseOut = new EventEmitter();
        /** Mouse down on cell.
         */
        this.cellMouseDown = new EventEmitter();
        /** Row is clicked.
         */
        this.rowClicked = new EventEmitter();
        /** Row is double clicked.
         */
        this.rowDoubleClicked = new EventEmitter();
        /** Row is selected or deselected. The event contains the node in question, so call the node's `isSelected()` method to see if it was just selected or deselected.
         */
        this.rowSelected = new EventEmitter();
        /** Row selection is changed. Use the `selectedNodes` field to get the list of selected nodes at the time of the event. When using the SSRM, `selectedNodes` will be `null`
         * when selecting all nodes. Instead, refer to the `serverSideState` field.
         */
        this.selectionChanged = new EventEmitter();
        /** Cell is right clicked.
         */
        this.cellContextMenu = new EventEmitter();
        /** A change to range selection has occurred.
         *
         * @deprecated v32.2 Use `onCellSelectionChanged` instead
         */
        this.rangeSelectionChanged = new EventEmitter();
        /** A change to cell selection has occurred.
         */
        this.cellSelectionChanged = new EventEmitter();
        /** A tooltip has been displayed     */
        this.tooltipShow = new EventEmitter();
        /** A tooltip was hidden     */
        this.tooltipHide = new EventEmitter();
        /** Sort has changed. The grid also listens for this and updates the model.
         */
        this.sortChanged = new EventEmitter();
        this._nativeElement = elementDef.nativeElement;
        this._fullyReady.then(() => {
            // Register the status flag reset before any events are fired
            // so that we can swap to synchronous event firing as soon as the grid is ready
            this._holdEvents = false;
        });
    }
    ngAfterViewInit() {
        // Run the setup outside of angular so all the event handlers that are created do not trigger change detection
        this._angularFrameworkOverrides.runOutsideAngular(() => {
            this._frameworkCompWrapper.setViewContainerRef(this._viewContainerRef, this._angularFrameworkOverrides);
            // Get all the inputs that are valid GridOptions
            const gridOptionKeys = Object.keys(this).filter((key) => !(key.startsWith('_') ||
                key == 'gridOptions' ||
                key == 'modules' ||
                this[key] instanceof EventEmitter));
            const coercedGridOptions = {};
            for (const key of gridOptionKeys) {
                const valueToUse = getValueOrCoercedValue(key, this[key]);
                coercedGridOptions[key] = valueToUse;
            }
            const mergedGridOps = _combineAttributesAndGridOptions(this.gridOptions, coercedGridOptions, gridOptionKeys);
            const gridParams = {
                globalListener: this.globalListener.bind(this),
                frameworkOverrides: this._angularFrameworkOverrides,
                providedBeanInstances: {
                    frameworkCompWrapper: this._frameworkCompWrapper,
                },
                modules: (this.modules || []),
            };
            const api = createGrid(this._nativeElement, mergedGridOps, gridParams);
            if (api) {
                this.api = api;
            }
            this._initialised = true;
            // sometimes, especially in large client apps gridReady can fire before ngAfterViewInit
            // this ties these together so that gridReady will always fire after agGridAngular's ngAfterViewInit
            // the actual containing component's ngAfterViewInit will fire just after agGridAngular's
            this._resolveFullyReady();
        });
    }
    ngOnChanges(changes) {
        if (this._initialised) {
            // Run the changes outside of angular so any event handlers that are created do not trigger change detection
            this._angularFrameworkOverrides.runOutsideAngular(() => {
                const gridOptions = {};
                for (const key of Object.keys(changes)) {
                    const value = changes[key];
                    gridOptions[key] = value.currentValue;
                }
                _processOnChange(gridOptions, this.api);
            });
        }
    }
    ngOnDestroy() {
        if (this._initialised) {
            // need to do this before the destroy, so we know not to emit any events
            // while tearing down the grid.
            this._destroyed = true;
            // could be null if grid failed to initialise
            this.api?.destroy();
        }
    }
    // we'll emit the emit if a user is listening for a given event either on the component via normal angular binding
    // or via gridOptions
    isEmitterUsed(eventType) {
        const emitter = this[eventType];
        // For RxJs compatibility we need to check for observed v7+ or observers v6
        const emitterAny = emitter;
        const hasEmitter = emitterAny?.observed ?? emitterAny?.observers?.length > 0;
        // gridReady => onGridReady
        const asEventName = `on${eventType.charAt(0).toUpperCase()}${eventType.substring(1)}`;
        const hasGridOptionListener = !!this.gridOptions && !!this.gridOptions[asEventName];
        return hasEmitter || hasGridOptionListener;
    }
    globalListener(eventType, event) {
        // if we are tearing down, don't emit angular events, as this causes
        // problems with the angular router
        if (this._destroyed) {
            return;
        }
        // generically look up the eventType
        const emitter = this[eventType];
        if (emitter && this.isEmitterUsed(eventType)) {
            // Make sure we emit within the angular zone, so change detection works properly
            const fireEmitter = () => this._angularFrameworkOverrides.runInsideAngular(() => emitter.emit(event));
            if (this._holdEvents) {
                // if the user is listening to events, wait for ngAfterViewInit to fire first, then emit the grid events
                this._fullyReady.then(() => fireEmitter());
            }
            else {
                fireEmitter();
            }
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.30", ngImport: i0, type: AgGridAngular, deps: [{ token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: AngularFrameworkOverrides }, { token: AngularFrameworkComponentWrapper }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "20.3.30", type: AgGridAngular, isStandalone: true, selector: "ag-grid-angular", inputs: { gridOptions: "gridOptions", modules: "modules", toolbar: "toolbar", statusBar: "statusBar", sideBar: "sideBar", suppressContextMenu: ["suppressContextMenu", "suppressContextMenu", booleanAttribute], preventDefaultOnContextMenu: ["preventDefaultOnContextMenu", "preventDefaultOnContextMenu", booleanAttribute], allowContextMenuWithControlKey: ["allowContextMenuWithControlKey", "allowContextMenuWithControlKey", booleanAttribute], columnMenu: "columnMenu", suppressMenuHide: ["suppressMenuHide", "suppressMenuHide", booleanAttribute], enableBrowserTooltips: ["enableBrowserTooltips", "enableBrowserTooltips", booleanAttribute], tooltipTrigger: "tooltipTrigger", tooltipShowDelay: "tooltipShowDelay", tooltipSwitchShowDelay: "tooltipSwitchShowDelay", tooltipHideDelay: "tooltipHideDelay", tooltipMouseTrack: ["tooltipMouseTrack", "tooltipMouseTrack", booleanAttribute], tooltipShowMode: "tooltipShowMode", tooltipInteraction: ["tooltipInteraction", "tooltipInteraction", booleanAttribute], popupParent: "popupParent", copyHeadersToClipboard: ["copyHeadersToClipboard", "copyHeadersToClipboard", booleanAttribute], copyGroupHeadersToClipboard: ["copyGroupHeadersToClipboard", "copyGroupHeadersToClipboard", booleanAttribute], clipboardDelimiter: "clipboardDelimiter", suppressCopyRowsToClipboard: ["suppressCopyRowsToClipboard", "suppressCopyRowsToClipboard", booleanAttribute], suppressCopySingleCellRanges: ["suppressCopySingleCellRanges", "suppressCopySingleCellRanges", booleanAttribute], suppressLastEmptyLineOnPaste: ["suppressLastEmptyLineOnPaste", "suppressLastEmptyLineOnPaste", booleanAttribute], suppressClipboardPaste: ["suppressClipboardPaste", "suppressClipboardPaste", booleanAttribute], suppressClipboardApi: ["suppressClipboardApi", "suppressClipboardApi", booleanAttribute], suppressCutToClipboard: ["suppressCutToClipboard", "suppressCutToClipboard", booleanAttribute], columnDefs: "columnDefs", defaultColDef: "defaultColDef", defaultColGroupDef: "defaultColGroupDef", columnTypes: "columnTypes", dataTypeDefinitions: "dataTypeDefinitions", calculatedColumns: "calculatedColumns", columnHeaderEdit: "columnHeaderEdit", maintainColumnOrder: ["maintainColumnOrder", "maintainColumnOrder", booleanAttribute], enableStrictPivotColumnOrder: ["enableStrictPivotColumnOrder", "enableStrictPivotColumnOrder", booleanAttribute], suppressFieldDotNotation: ["suppressFieldDotNotation", "suppressFieldDotNotation", booleanAttribute], headerHeight: "headerHeight", groupHeaderHeight: "groupHeaderHeight", floatingFiltersHeight: "floatingFiltersHeight", pivotHeaderHeight: "pivotHeaderHeight", pivotGroupHeaderHeight: "pivotGroupHeaderHeight", hidePaddedHeaderRows: ["hidePaddedHeaderRows", "hidePaddedHeaderRows", booleanAttribute], allowDragFromColumnsToolPanel: ["allowDragFromColumnsToolPanel", "allowDragFromColumnsToolPanel", booleanAttribute], suppressMovableColumns: ["suppressMovableColumns", "suppressMovableColumns", booleanAttribute], suppressColumnMoveAnimation: ["suppressColumnMoveAnimation", "suppressColumnMoveAnimation", booleanAttribute], suppressMoveWhenColumnDragging: ["suppressMoveWhenColumnDragging", "suppressMoveWhenColumnDragging", booleanAttribute], suppressDragLeaveHidesColumns: ["suppressDragLeaveHidesColumns", "suppressDragLeaveHidesColumns", booleanAttribute], suppressGroupChangesColumnVisibility: "suppressGroupChangesColumnVisibility", suppressMakeColumnVisibleAfterUnGroup: ["suppressMakeColumnVisibleAfterUnGroup", "suppressMakeColumnVisibleAfterUnGroup", booleanAttribute], suppressRowGroupHidesColumns: ["suppressRowGroupHidesColumns", "suppressRowGroupHidesColumns", booleanAttribute], colResizeDefault: "colResizeDefault", suppressAutoSize: ["suppressAutoSize", "suppressAutoSize", booleanAttribute], autoSizePadding: "autoSizePadding", skipHeaderOnAutoSize: ["skipHeaderOnAutoSize", "skipHeaderOnAutoSize", booleanAttribute], autoSizeStrategy: "autoSizeStrategy", animateColumnResizing: ["animateColumnResizing", "animateColumnResizing", booleanAttribute], components: "components", editType: "editType", suppressStartEditOnTab: ["suppressStartEditOnTab", "suppressStartEditOnTab", booleanAttribute], getFullRowEditValidationErrors: "getFullRowEditValidationErrors", invalidEditValueMode: "invalidEditValueMode", singleClickEdit: ["singleClickEdit", "singleClickEdit", booleanAttribute], suppressClickEdit: ["suppressClickEdit", "suppressClickEdit", booleanAttribute], readOnlyEdit: ["readOnlyEdit", "readOnlyEdit", booleanAttribute], stopEditingWhenCellsLoseFocus: ["stopEditingWhenCellsLoseFocus", "stopEditingWhenCellsLoseFocus", booleanAttribute], enterNavigatesVertically: ["enterNavigatesVertically", "enterNavigatesVertically", booleanAttribute], enterNavigatesVerticallyAfterEdit: ["enterNavigatesVerticallyAfterEdit", "enterNavigatesVerticallyAfterEdit", booleanAttribute], enableCellEditingOnBackspace: ["enableCellEditingOnBackspace", "enableCellEditingOnBackspace", booleanAttribute], undoRedoCellEditing: ["undoRedoCellEditing", "undoRedoCellEditing", booleanAttribute], undoRedoCellEditingLimit: "undoRedoCellEditingLimit", defaultCsvExportParams: "defaultCsvExportParams", suppressCsvExport: ["suppressCsvExport", "suppressCsvExport", booleanAttribute], defaultExcelExportParams: "defaultExcelExportParams", suppressExcelExport: ["suppressExcelExport", "suppressExcelExport", booleanAttribute], defaultPdfExportParams: "defaultPdfExportParams", suppressPdfExport: ["suppressPdfExport", "suppressPdfExport", booleanAttribute], excelStyles: "excelStyles", findSearchValue: "findSearchValue", findOptions: "findOptions", quickFilterText: "quickFilterText", cacheQuickFilter: ["cacheQuickFilter", "cacheQuickFilter", booleanAttribute], includeHiddenColumnsInQuickFilter: ["includeHiddenColumnsInQuickFilter", "includeHiddenColumnsInQuickFilter", booleanAttribute], quickFilterParser: "quickFilterParser", quickFilterMatcher: "quickFilterMatcher", applyQuickFilterBeforePivotOrAgg: ["applyQuickFilterBeforePivotOrAgg", "applyQuickFilterBeforePivotOrAgg", booleanAttribute], excludeChildrenWhenTreeDataFiltering: ["excludeChildrenWhenTreeDataFiltering", "excludeChildrenWhenTreeDataFiltering", booleanAttribute], enableAdvancedFilter: ["enableAdvancedFilter", "enableAdvancedFilter", booleanAttribute], alwaysPassFilter: "alwaysPassFilter", includeHiddenColumnsInAdvancedFilter: ["includeHiddenColumnsInAdvancedFilter", "includeHiddenColumnsInAdvancedFilter", booleanAttribute], advancedFilterParent: "advancedFilterParent", advancedFilterBuilderParams: "advancedFilterBuilderParams", advancedFilterParams: "advancedFilterParams", suppressAdvancedFilterEval: ["suppressAdvancedFilterEval", "suppressAdvancedFilterEval", booleanAttribute], suppressSetFilterByDefault: ["suppressSetFilterByDefault", "suppressSetFilterByDefault", booleanAttribute], enableFilterHandlers: ["enableFilterHandlers", "enableFilterHandlers", booleanAttribute], filterHandlers: "filterHandlers", enableCharts: ["enableCharts", "enableCharts", booleanAttribute], includeHiddenColumnsInCharts: ["includeHiddenColumnsInCharts", "includeHiddenColumnsInCharts", booleanAttribute], chartThemes: "chartThemes", customChartThemes: "customChartThemes", chartThemeOverrides: "chartThemeOverrides", chartToolPanelsDef: "chartToolPanelsDef", chartMenuItems: "chartMenuItems", loadingCellRenderer: "loadingCellRenderer", loadingCellRendererParams: "loadingCellRendererParams", loadingCellRendererSelector: "loadingCellRendererSelector", localeText: "localeText", masterDetail: ["masterDetail", "masterDetail", booleanAttribute], keepDetailRows: ["keepDetailRows", "keepDetailRows", booleanAttribute], keepDetailRowsCount: "keepDetailRowsCount", detailCellRenderer: "detailCellRenderer", detailCellRendererParams: "detailCellRendererParams", detailRowHeight: "detailRowHeight", detailRowAutoHeight: ["detailRowAutoHeight", "detailRowAutoHeight", booleanAttribute], context: "context", alignedGrids: "alignedGrids", tabIndex: "tabIndex", suppressInputClearButton: ["suppressInputClearButton", "suppressInputClearButton", booleanAttribute], enableInputAutoComplete: ["enableInputAutoComplete", "enableInputAutoComplete", booleanAttribute], rowBuffer: "rowBuffer", valueCache: ["valueCache", "valueCache", booleanAttribute], valueCacheNeverExpires: ["valueCacheNeverExpires", "valueCacheNeverExpires", booleanAttribute], enableCellExpressions: ["enableCellExpressions", "enableCellExpressions", booleanAttribute], suppressTouch: ["suppressTouch", "suppressTouch", booleanAttribute], suppressFocusAfterRefresh: ["suppressFocusAfterRefresh", "suppressFocusAfterRefresh", booleanAttribute], suppressBrowserResizeObserver: ["suppressBrowserResizeObserver", "suppressBrowserResizeObserver", booleanAttribute], suppressPropertyNamesCheck: ["suppressPropertyNamesCheck", "suppressPropertyNamesCheck", booleanAttribute], suppressChangeDetection: ["suppressChangeDetection", "suppressChangeDetection", booleanAttribute], debug: ["debug", "debug", booleanAttribute], loading: ["loading", "loading", booleanAttribute], loadingRows: "loadingRows", overlayLoadingTemplate: "overlayLoadingTemplate", loadingOverlayComponent: "loadingOverlayComponent", loadingOverlayComponentParams: "loadingOverlayComponentParams", suppressLoadingOverlay: ["suppressLoadingOverlay", "suppressLoadingOverlay", booleanAttribute], overlayNoRowsTemplate: "overlayNoRowsTemplate", noRowsOverlayComponent: "noRowsOverlayComponent", noRowsOverlayComponentParams: "noRowsOverlayComponentParams", suppressNoRowsOverlay: ["suppressNoRowsOverlay", "suppressNoRowsOverlay", booleanAttribute], suppressOverlays: "suppressOverlays", overlayComponent: "overlayComponent", overlayComponentParams: "overlayComponentParams", overlayComponentSelector: "overlayComponentSelector", activeOverlay: "activeOverlay", activeOverlayParams: "activeOverlayParams", processFileInput: "processFileInput", pagination: ["pagination", "pagination", booleanAttribute], paginationPageSize: "paginationPageSize", paginationPageSizeSelector: "paginationPageSizeSelector", paginationAutoPageSize: ["paginationAutoPageSize", "paginationAutoPageSize", booleanAttribute], paginateChildRows: ["paginateChildRows", "paginateChildRows", booleanAttribute], suppressPaginationPanel: ["suppressPaginationPanel", "suppressPaginationPanel", booleanAttribute], paginationPanels: "paginationPanels", pivotMode: ["pivotMode", "pivotMode", booleanAttribute], pivotPanelShow: "pivotPanelShow", pivotMaxGeneratedColumns: "pivotMaxGeneratedColumns", pivotDefaultExpanded: "pivotDefaultExpanded", pivotColumnGroupTotals: "pivotColumnGroupTotals", pivotRowTotals: "pivotRowTotals", pivotSuppressAutoColumn: ["pivotSuppressAutoColumn", "pivotSuppressAutoColumn", booleanAttribute], suppressExpandablePivotGroups: ["suppressExpandablePivotGroups", "suppressExpandablePivotGroups", booleanAttribute], functionsReadOnly: ["functionsReadOnly", "functionsReadOnly", booleanAttribute], aggFuncs: "aggFuncs", formulaDataSource: "formulaDataSource", notesDataSource: "notesDataSource", noteTrigger: "noteTrigger", noteShowDelay: "noteShowDelay", noteHideDelay: "noteHideDelay", formulaFuncs: "formulaFuncs", suppressAggFuncInHeader: ["suppressAggFuncInHeader", "suppressAggFuncInHeader", booleanAttribute], alwaysAggregateAtRootLevel: ["alwaysAggregateAtRootLevel", "alwaysAggregateAtRootLevel", booleanAttribute], aggregateOnlyChangedColumns: ["aggregateOnlyChangedColumns", "aggregateOnlyChangedColumns", booleanAttribute], suppressAggFilteredOnly: ["suppressAggFilteredOnly", "suppressAggFilteredOnly", booleanAttribute], removePivotHeaderRowWhenSingleValueColumn: ["removePivotHeaderRowWhenSingleValueColumn", "removePivotHeaderRowWhenSingleValueColumn", booleanAttribute], animateRows: ["animateRows", "animateRows", booleanAttribute], cellFlashDuration: "cellFlashDuration", cellFadeDuration: "cellFadeDuration", allowShowChangeAfterFilter: ["allowShowChangeAfterFilter", "allowShowChangeAfterFilter", booleanAttribute], domLayout: "domLayout", ensureDomOrder: ["ensureDomOrder", "ensureDomOrder", booleanAttribute], enableCellSpan: ["enableCellSpan", "enableCellSpan", booleanAttribute], enableRtl: ["enableRtl", "enableRtl", booleanAttribute], suppressColumnVirtualisation: ["suppressColumnVirtualisation", "suppressColumnVirtualisation", booleanAttribute], suppressMaxRenderedRowRestriction: ["suppressMaxRenderedRowRestriction", "suppressMaxRenderedRowRestriction", booleanAttribute], suppressRowVirtualisation: ["suppressRowVirtualisation", "suppressRowVirtualisation", booleanAttribute], rowDragManaged: ["rowDragManaged", "rowDragManaged", booleanAttribute], refreshAfterGroupEdit: ["refreshAfterGroupEdit", "refreshAfterGroupEdit", booleanAttribute], rowDragInsertDelay: "rowDragInsertDelay", suppressRowDrag: ["suppressRowDrag", "suppressRowDrag", booleanAttribute], suppressMoveWhenRowDragging: ["suppressMoveWhenRowDragging", "suppressMoveWhenRowDragging", booleanAttribute], rowDragEntireRow: ["rowDragEntireRow", "rowDragEntireRow", booleanAttribute], rowDragMultiRow: ["rowDragMultiRow", "rowDragMultiRow", booleanAttribute], rowDragText: "rowDragText", dragAndDropImageComponent: "dragAndDropImageComponent", dragAndDropImageComponentParams: "dragAndDropImageComponentParams", fullWidthCellRenderer: "fullWidthCellRenderer", fullWidthCellRendererParams: "fullWidthCellRendererParams", embedFullWidthRows: ["embedFullWidthRows", "embedFullWidthRows", booleanAttribute], groupDisplayType: "groupDisplayType", groupDefaultExpanded: "groupDefaultExpanded", masterDefaultExpanded: "masterDefaultExpanded", autoGroupColumnDef: "autoGroupColumnDef", groupMaintainOrder: ["groupMaintainOrder", "groupMaintainOrder", booleanAttribute], groupSelectsChildren: ["groupSelectsChildren", "groupSelectsChildren", booleanAttribute], groupLockGroupColumns: "groupLockGroupColumns", groupAggFiltering: "groupAggFiltering", groupTotalRow: "groupTotalRow", grandTotalRow: "grandTotalRow", suppressStickyTotalRow: "suppressStickyTotalRow", groupSuppressBlankHeader: ["groupSuppressBlankHeader", "groupSuppressBlankHeader", booleanAttribute], groupSelectsFiltered: ["groupSelectsFiltered", "groupSelectsFiltered", booleanAttribute], showOpenedGroup: ["showOpenedGroup", "showOpenedGroup", booleanAttribute], groupHideParentOfSingleChild: "groupHideParentOfSingleChild", groupRemoveSingleChildren: ["groupRemoveSingleChildren", "groupRemoveSingleChildren", booleanAttribute], groupRemoveLowestSingleChildren: ["groupRemoveLowestSingleChildren", "groupRemoveLowestSingleChildren", booleanAttribute], groupHideOpenParents: ["groupHideOpenParents", "groupHideOpenParents", booleanAttribute], groupHideColumnsUntilExpanded: ["groupHideColumnsUntilExpanded", "groupHideColumnsUntilExpanded", booleanAttribute], groupAllowUnbalanced: ["groupAllowUnbalanced", "groupAllowUnbalanced", booleanAttribute], rowGroupPanelShow: "rowGroupPanelShow", groupRowRenderer: "groupRowRenderer", groupRowRendererParams: "groupRowRendererParams", treeData: ["treeData", "treeData", booleanAttribute], treeDataChildrenField: "treeDataChildrenField", treeDataParentIdField: "treeDataParentIdField", rowGroupPanelSuppressSort: ["rowGroupPanelSuppressSort", "rowGroupPanelSuppressSort", booleanAttribute], pivotPanelSuppressSort: ["pivotPanelSuppressSort", "pivotPanelSuppressSort", booleanAttribute], suppressGroupRowsSticky: ["suppressGroupRowsSticky", "suppressGroupRowsSticky", booleanAttribute], stickyRowsMaxViewportRatio: "stickyRowsMaxViewportRatio", groupHierarchyConfig: "groupHierarchyConfig", pinnedTopRowData: "pinnedTopRowData", pinnedBottomRowData: "pinnedBottomRowData", enableRowPinning: "enableRowPinning", isRowPinnable: "isRowPinnable", isRowPinned: "isRowPinned", rowModelType: "rowModelType", rowData: "rowData", asyncTransactionWaitMillis: "asyncTransactionWaitMillis", suppressModelUpdateAfterUpdateTransaction: ["suppressModelUpdateAfterUpdateTransaction", "suppressModelUpdateAfterUpdateTransaction", booleanAttribute], datasource: "datasource", cacheOverflowSize: "cacheOverflowSize", infiniteInitialRowCount: "infiniteInitialRowCount", serverSideInitialRowCount: "serverSideInitialRowCount", suppressServerSideFullWidthLoadingRow: ["suppressServerSideFullWidthLoadingRow", "suppressServerSideFullWidthLoadingRow", booleanAttribute], cacheBlockSize: "cacheBlockSize", maxBlocksInCache: "maxBlocksInCache", maxConcurrentDatasourceRequests: "maxConcurrentDatasourceRequests", blockLoadDebounceMillis: "blockLoadDebounceMillis", purgeClosedRowNodes: ["purgeClosedRowNodes", "purgeClosedRowNodes", booleanAttribute], serverSideDatasource: "serverSideDatasource", serverSideSortAllLevels: ["serverSideSortAllLevels", "serverSideSortAllLevels", booleanAttribute], serverSideEnableClientSideSort: ["serverSideEnableClientSideSort", "serverSideEnableClientSideSort", booleanAttribute], serverSideOnlyRefreshFilteredGroups: ["serverSideOnlyRefreshFilteredGroups", "serverSideOnlyRefreshFilteredGroups", booleanAttribute], serverSidePivotResultFieldSeparator: "serverSidePivotResultFieldSeparator", viewportDatasource: "viewportDatasource", viewportRowModelPageSize: "viewportRowModelPageSize", viewportRowModelBufferSize: "viewportRowModelBufferSize", alwaysShowHorizontalScroll: ["alwaysShowHorizontalScroll", "alwaysShowHorizontalScroll", booleanAttribute], alwaysShowVerticalScroll: ["alwaysShowVerticalScroll", "alwaysShowVerticalScroll", booleanAttribute], debounceVerticalScrollbar: ["debounceVerticalScrollbar", "debounceVerticalScrollbar", booleanAttribute], suppressHorizontalScroll: ["suppressHorizontalScroll", "suppressHorizontalScroll", booleanAttribute], suppressScrollOnNewData: ["suppressScrollOnNewData", "suppressScrollOnNewData", booleanAttribute], suppressScrollWhenPopupsAreOpen: ["suppressScrollWhenPopupsAreOpen", "suppressScrollWhenPopupsAreOpen", booleanAttribute], suppressAnimationFrame: ["suppressAnimationFrame", "suppressAnimationFrame", booleanAttribute], suppressMiddleClickScrolls: ["suppressMiddleClickScrolls", "suppressMiddleClickScrolls", booleanAttribute], suppressPreventDefaultOnMouseWheel: ["suppressPreventDefaultOnMouseWheel", "suppressPreventDefaultOnMouseWheel", booleanAttribute], scrollbarWidth: "scrollbarWidth", rowSelection: "rowSelection", cellSelection: "cellSelection", rowMultiSelectWithClick: ["rowMultiSelectWithClick", "rowMultiSelectWithClick", booleanAttribute], suppressRowDeselection: ["suppressRowDeselection", "suppressRowDeselection", booleanAttribute], suppressRowClickSelection: ["suppressRowClickSelection", "suppressRowClickSelection", booleanAttribute], suppressCellFocus: ["suppressCellFocus", "suppressCellFocus", booleanAttribute], suppressHeaderFocus: ["suppressHeaderFocus", "suppressHeaderFocus", booleanAttribute], selectionColumnDef: "selectionColumnDef", rowNumbers: "rowNumbers", suppressMultiRangeSelection: ["suppressMultiRangeSelection", "suppressMultiRangeSelection", booleanAttribute], enableCellTextSelection: ["enableCellTextSelection", "enableCellTextSelection", booleanAttribute], enableRangeSelection: ["enableRangeSelection", "enableRangeSelection", booleanAttribute], enableRangeHandle: ["enableRangeHandle", "enableRangeHandle", booleanAttribute], enableFillHandle: ["enableFillHandle", "enableFillHandle", booleanAttribute], fillHandleDirection: "fillHandleDirection", suppressClearOnFillReduction: ["suppressClearOnFillReduction", "suppressClearOnFillReduction", booleanAttribute], sortingOrder: "sortingOrder", accentedSort: ["accentedSort", "accentedSort", booleanAttribute], unSortIcon: ["unSortIcon", "unSortIcon", booleanAttribute], suppressMultiSort: ["suppressMultiSort", "suppressMultiSort", booleanAttribute], alwaysMultiSort: ["alwaysMultiSort", "alwaysMultiSort", booleanAttribute], multiSortKey: "multiSortKey", suppressMaintainUnsortedOrder: ["suppressMaintainUnsortedOrder", "suppressMaintainUnsortedOrder", booleanAttribute], icons: "icons", rowHeight: "rowHeight", rowStyle: "rowStyle", rowClass: "rowClass", rowClassRules: "rowClassRules", suppressRowHoverHighlight: ["suppressRowHoverHighlight", "suppressRowHoverHighlight", booleanAttribute], suppressRowTransform: ["suppressRowTransform", "suppressRowTransform", booleanAttribute], suppressContentVisibilityAuto: ["suppressContentVisibilityAuto", "suppressContentVisibilityAuto", booleanAttribute], enableContentVisibilityAuto: ["enableContentVisibilityAuto", "enableContentVisibilityAuto", booleanAttribute], contentVisibilityAutoDelay: "contentVisibilityAutoDelay", columnHoverHighlight: ["columnHoverHighlight", "columnHoverHighlight", booleanAttribute], gridId: "gridId", deltaSort: ["deltaSort", "deltaSort", booleanAttribute], treeDataDisplayType: "treeDataDisplayType", enableGroupEdit: ["enableGroupEdit", "enableGroupEdit", booleanAttribute], initialState: "initialState", theme: "theme", loadThemeGoogleFonts: ["loadThemeGoogleFonts", "loadThemeGoogleFonts", booleanAttribute], themeCssLayer: "themeCssLayer", styleNonce: "styleNonce", themeStyleContainer: "themeStyleContainer", getContextMenuItems: "getContextMenuItems", getMainMenuItems: "getMainMenuItems", getColumnMenuItems: "getColumnMenuItems", postProcessPopup: "postProcessPopup", processUnpinnedColumns: "processUnpinnedColumns", processCellForClipboard: "processCellForClipboard", processHeaderForClipboard: "processHeaderForClipboard", processGroupHeaderForClipboard: "processGroupHeaderForClipboard", processCellFromClipboard: "processCellFromClipboard", sendToClipboard: "sendToClipboard", processDataFromClipboard: "processDataFromClipboard", isExternalFilterPresent: "isExternalFilterPresent", doesExternalFilterPass: "doesExternalFilterPass", getChartToolbarItems: "getChartToolbarItems", createChartContainer: "createChartContainer", focusGridInnerElement: "focusGridInnerElement", navigateToNextHeader: "navigateToNextHeader", tabToNextHeader: "tabToNextHeader", navigateToNextCell: "navigateToNextCell", tabToNextCell: "tabToNextCell", tabToNextGridContainer: "tabToNextGridContainer", getLocaleText: "getLocaleText", getDocument: "getDocument", paginationNumberFormatter: "paginationNumberFormatter", getGroupRowAgg: "getGroupRowAgg", isGroupOpenByDefault: "isGroupOpenByDefault", isMasterOpenByDefault: "isMasterOpenByDefault", ssrmExpandAllAffectsAllRows: ["ssrmExpandAllAffectsAllRows", "ssrmExpandAllAffectsAllRows", booleanAttribute], initialGroupOrderComparator: "initialGroupOrderComparator", processPivotResultColDef: "processPivotResultColDef", processPivotResultColGroupDef: "processPivotResultColGroupDef", getDataPath: "getDataPath", getChildCount: "getChildCount", getServerSideGroupLevelParams: "getServerSideGroupLevelParams", isServerSideGroupOpenByDefault: "isServerSideGroupOpenByDefault", isApplyServerSideTransaction: "isApplyServerSideTransaction", isServerSideGroup: "isServerSideGroup", getServerSideGroupKey: "getServerSideGroupKey", getBusinessKeyForNode: "getBusinessKeyForNode", getRowId: "getRowId", resetRowDataOnUpdate: ["resetRowDataOnUpdate", "resetRowDataOnUpdate", booleanAttribute], autoGenerateColumnDefs: "autoGenerateColumnDefs", processAutoGeneratedColumnDefs: "processAutoGeneratedColumnDefs", processRowPostCreate: "processRowPostCreate", isRowSelectable: "isRowSelectable", isRowMaster: "isRowMaster", fillOperation: "fillOperation", postSortRows: "postSortRows", getRowStyle: "getRowStyle", getRowClass: "getRowClass", getRowHeight: "getRowHeight", isFullWidthRow: "isFullWidthRow", isRowValidDropPosition: "isRowValidDropPosition" }, outputs: { toolPanelVisibleChanged: "toolPanelVisibleChanged", toolPanelSizeChanged: "toolPanelSizeChanged", columnMenuVisibleChanged: "columnMenuVisibleChanged", contextMenuVisibleChanged: "contextMenuVisibleChanged", cutStart: "cutStart", cutEnd: "cutEnd", pasteStart: "pasteStart", pasteEnd: "pasteEnd", calculatedColumnCreated: "calculatedColumnCreated", calculatedColumnExpressionChanged: "calculatedColumnExpressionChanged", calculatedColumnRemoved: "calculatedColumnRemoved", calculatedColumnValidationStateChanged: "calculatedColumnValidationStateChanged", columnVisible: "columnVisible", columnPinned: "columnPinned", columnHeaderNameChanged: "columnHeaderNameChanged", columnResized: "columnResized", columnMoved: "columnMoved", columnValueChanged: "columnValueChanged", columnPivotModeChanged: "columnPivotModeChanged", columnPivotChanged: "columnPivotChanged", columnGroupOpened: "columnGroupOpened", newColumnsLoaded: "newColumnsLoaded", gridColumnsChanged: "gridColumnsChanged", displayedColumnsChanged: "displayedColumnsChanged", virtualColumnsChanged: "virtualColumnsChanged", columnEverythingChanged: "columnEverythingChanged", columnsReset: "columnsReset", columnHeaderMouseOver: "columnHeaderMouseOver", columnHeaderMouseLeave: "columnHeaderMouseLeave", columnHeaderClicked: "columnHeaderClicked", columnHeaderContextMenu: "columnHeaderContextMenu", componentStateChanged: "componentStateChanged", cellValueChanged: "cellValueChanged", cellEditRequest: "cellEditRequest", rowValueChanged: "rowValueChanged", cellEditingStarted: "cellEditingStarted", cellEditingStopped: "cellEditingStopped", rowEditingStarted: "rowEditingStarted", rowEditingStopped: "rowEditingStopped", bulkEditingStarted: "bulkEditingStarted", bulkEditingStopped: "bulkEditingStopped", batchEditingStarted: "batchEditingStarted", batchEditingStopped: "batchEditingStopped", undoStarted: "undoStarted", undoEnded: "undoEnded", redoStarted: "redoStarted", redoEnded: "redoEnded", cellSelectionDeleteStart: "cellSelectionDeleteStart", cellSelectionDeleteEnd: "cellSelectionDeleteEnd", rangeDeleteStart: "rangeDeleteStart", rangeDeleteEnd: "rangeDeleteEnd", fillStart: "fillStart", fillEnd: "fillEnd", filterOpened: "filterOpened", filterChanged: "filterChanged", filterModified: "filterModified", filterUiChanged: "filterUiChanged", floatingFilterUiChanged: "floatingFilterUiChanged", advancedFilterBuilderVisibleChanged: "advancedFilterBuilderVisibleChanged", findChanged: "findChanged", chartCreated: "chartCreated", chartRangeSelectionChanged: "chartRangeSelectionChanged", chartOptionsChanged: "chartOptionsChanged", chartDestroyed: "chartDestroyed", cellKeyDown: "cellKeyDown", gridReady: "gridReady", firstDataRendered: "firstDataRendered", gridSizeChanged: "gridSizeChanged", modelUpdated: "modelUpdated", virtualRowRemoved: "virtualRowRemoved", viewportChanged: "viewportChanged", bodyScroll: "bodyScroll", bodyScrollEnd: "bodyScrollEnd", dragStarted: "dragStarted", dragStopped: "dragStopped", dragCancelled: "dragCancelled", stateUpdated: "stateUpdated", issueRaised: "issueRaised", paginationChanged: "paginationChanged", rowDragEnter: "rowDragEnter", rowDragMove: "rowDragMove", rowDragLeave: "rowDragLeave", rowDragEnd: "rowDragEnd", rowDragCancel: "rowDragCancel", rowResizeStarted: "rowResizeStarted", rowResizeEnded: "rowResizeEnded", columnRowGroupChanged: "columnRowGroupChanged", rowGroupOpened: "rowGroupOpened", expandOrCollapseAll: "expandOrCollapseAll", pivotMaxColumnsExceeded: "pivotMaxColumnsExceeded", pinnedRowDataChanged: "pinnedRowDataChanged", pinnedRowsChanged: "pinnedRowsChanged", rowDataUpdated: "rowDataUpdated", asyncTransactionsFlushed: "asyncTransactionsFlushed", storeRefreshed: "storeRefreshed", headerFocused: "headerFocused", cellClicked: "cellClicked", cellDoubleClicked: "cellDoubleClicked", cellFocused: "cellFocused", cellMouseOver: "cellMouseOver", cellMouseOut: "cellMouseOut", cellMouseDown: "cellMouseDown", rowClicked: "rowClicked", rowDoubleClicked: "rowDoubleClicked", rowSelected: "rowSelected", selectionChanged: "selectionChanged", cellContextMenu: "cellContextMenu", rangeSelectionChanged: "rangeSelectionChanged", cellSelectionChanged: "cellSelectionChanged", tooltipShow: "tooltipShow", tooltipHide: "tooltipHide", sortChanged: "sortChanged" }, providers: [AngularFrameworkOverrides, AngularFrameworkComponentWrapper], usesOnChanges: true, ngImport: i0, template: '', isInline: true, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.30", ngImport: i0, type: AgGridAngular, decorators: [{
            type: Component,
            args: [{
                    selector: 'ag-grid-angular',
                    standalone: true,
                    template: '',
                    providers: [AngularFrameworkOverrides, AngularFrameworkComponentWrapper],
                    // tell angular we don't want view encapsulation, we don't want a shadow root
                    encapsulation: ViewEncapsulation.None,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.ViewContainerRef }, { type: AngularFrameworkOverrides }, { type: AngularFrameworkComponentWrapper }], propDecorators: { gridOptions: [{
                type: Input
            }], modules: [{
                type: Input
            }], toolbar: [{
                type: Input
            }], statusBar: [{
                type: Input
            }], sideBar: [{
                type: Input
            }], suppressContextMenu: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], preventDefaultOnContextMenu: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], allowContextMenuWithControlKey: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], columnMenu: [{
                type: Input
            }], suppressMenuHide: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], enableBrowserTooltips: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], tooltipTrigger: [{
                type: Input
            }], tooltipShowDelay: [{
                type: Input
            }], tooltipSwitchShowDelay: [{
                type: Input
            }], tooltipHideDelay: [{
                type: Input
            }], tooltipMouseTrack: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], tooltipShowMode: [{
                type: Input
            }], tooltipInteraction: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], popupParent: [{
                type: Input
            }], copyHeadersToClipboard: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], copyGroupHeadersToClipboard: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], clipboardDelimiter: [{
                type: Input
            }], suppressCopyRowsToClipboard: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressCopySingleCellRanges: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressLastEmptyLineOnPaste: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressClipboardPaste: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressClipboardApi: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressCutToClipboard: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], columnDefs: [{
                type: Input
            }], defaultColDef: [{
                type: Input
            }], defaultColGroupDef: [{
                type: Input
            }], columnTypes: [{
                type: Input
            }], dataTypeDefinitions: [{
                type: Input
            }], calculatedColumns: [{
                type: Input
            }], columnHeaderEdit: [{
                type: Input
            }], maintainColumnOrder: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], enableStrictPivotColumnOrder: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressFieldDotNotation: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], headerHeight: [{
                type: Input
            }], groupHeaderHeight: [{
                type: Input
            }], floatingFiltersHeight: [{
                type: Input
            }], pivotHeaderHeight: [{
                type: Input
            }], pivotGroupHeaderHeight: [{
                type: Input
            }], hidePaddedHeaderRows: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], allowDragFromColumnsToolPanel: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressMovableColumns: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressColumnMoveAnimation: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressMoveWhenColumnDragging: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressDragLeaveHidesColumns: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressGroupChangesColumnVisibility: [{
                type: Input
            }], suppressMakeColumnVisibleAfterUnGroup: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressRowGroupHidesColumns: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], colResizeDefault: [{
                type: Input
            }], suppressAutoSize: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], autoSizePadding: [{
                type: Input
            }], skipHeaderOnAutoSize: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], autoSizeStrategy: [{
                type: Input
            }], animateColumnResizing: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], components: [{
                type: Input
            }], editType: [{
                type: Input
            }], suppressStartEditOnTab: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], getFullRowEditValidationErrors: [{
                type: Input
            }], invalidEditValueMode: [{
                type: Input
            }], singleClickEdit: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressClickEdit: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], readOnlyEdit: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], stopEditingWhenCellsLoseFocus: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], enterNavigatesVertically: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], enterNavigatesVerticallyAfterEdit: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], enableCellEditingOnBackspace: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], undoRedoCellEditing: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], undoRedoCellEditingLimit: [{
                type: Input
            }], defaultCsvExportParams: [{
                type: Input
            }], suppressCsvExport: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], defaultExcelExportParams: [{
                type: Input
            }], suppressExcelExport: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], defaultPdfExportParams: [{
                type: Input
            }], suppressPdfExport: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], excelStyles: [{
                type: Input
            }], findSearchValue: [{
                type: Input
            }], findOptions: [{
                type: Input
            }], quickFilterText: [{
                type: Input
            }], cacheQuickFilter: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], includeHiddenColumnsInQuickFilter: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], quickFilterParser: [{
                type: Input
            }], quickFilterMatcher: [{
                type: Input
            }], applyQuickFilterBeforePivotOrAgg: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], excludeChildrenWhenTreeDataFiltering: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], enableAdvancedFilter: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], alwaysPassFilter: [{
                type: Input
            }], includeHiddenColumnsInAdvancedFilter: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], advancedFilterParent: [{
                type: Input
            }], advancedFilterBuilderParams: [{
                type: Input
            }], advancedFilterParams: [{
                type: Input
            }], suppressAdvancedFilterEval: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressSetFilterByDefault: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], enableFilterHandlers: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], filterHandlers: [{
                type: Input
            }], enableCharts: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], includeHiddenColumnsInCharts: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], chartThemes: [{
                type: Input
            }], customChartThemes: [{
                type: Input
            }], chartThemeOverrides: [{
                type: Input
            }], chartToolPanelsDef: [{
                type: Input
            }], chartMenuItems: [{
                type: Input
            }], loadingCellRenderer: [{
                type: Input
            }], loadingCellRendererParams: [{
                type: Input
            }], loadingCellRendererSelector: [{
                type: Input
            }], localeText: [{
                type: Input
            }], masterDetail: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], keepDetailRows: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], keepDetailRowsCount: [{
                type: Input
            }], detailCellRenderer: [{
                type: Input
            }], detailCellRendererParams: [{
                type: Input
            }], detailRowHeight: [{
                type: Input
            }], detailRowAutoHeight: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], context: [{
                type: Input
            }], alignedGrids: [{
                type: Input
            }], tabIndex: [{
                type: Input
            }], suppressInputClearButton: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], enableInputAutoComplete: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], rowBuffer: [{
                type: Input
            }], valueCache: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], valueCacheNeverExpires: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], enableCellExpressions: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressTouch: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressFocusAfterRefresh: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressBrowserResizeObserver: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressPropertyNamesCheck: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressChangeDetection: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], debug: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], loading: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], loadingRows: [{
                type: Input
            }], overlayLoadingTemplate: [{
                type: Input
            }], loadingOverlayComponent: [{
                type: Input
            }], loadingOverlayComponentParams: [{
                type: Input
            }], suppressLoadingOverlay: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], overlayNoRowsTemplate: [{
                type: Input
            }], noRowsOverlayComponent: [{
                type: Input
            }], noRowsOverlayComponentParams: [{
                type: Input
            }], suppressNoRowsOverlay: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressOverlays: [{
                type: Input
            }], overlayComponent: [{
                type: Input
            }], overlayComponentParams: [{
                type: Input
            }], overlayComponentSelector: [{
                type: Input
            }], activeOverlay: [{
                type: Input
            }], activeOverlayParams: [{
                type: Input
            }], processFileInput: [{
                type: Input
            }], pagination: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], paginationPageSize: [{
                type: Input
            }], paginationPageSizeSelector: [{
                type: Input
            }], paginationAutoPageSize: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], paginateChildRows: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressPaginationPanel: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], paginationPanels: [{
                type: Input
            }], pivotMode: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], pivotPanelShow: [{
                type: Input
            }], pivotMaxGeneratedColumns: [{
                type: Input
            }], pivotDefaultExpanded: [{
                type: Input
            }], pivotColumnGroupTotals: [{
                type: Input
            }], pivotRowTotals: [{
                type: Input
            }], pivotSuppressAutoColumn: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressExpandablePivotGroups: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], functionsReadOnly: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], aggFuncs: [{
                type: Input
            }], formulaDataSource: [{
                type: Input
            }], notesDataSource: [{
                type: Input
            }], noteTrigger: [{
                type: Input
            }], noteShowDelay: [{
                type: Input
            }], noteHideDelay: [{
                type: Input
            }], formulaFuncs: [{
                type: Input
            }], suppressAggFuncInHeader: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], alwaysAggregateAtRootLevel: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], aggregateOnlyChangedColumns: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressAggFilteredOnly: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], removePivotHeaderRowWhenSingleValueColumn: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], animateRows: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], cellFlashDuration: [{
                type: Input
            }], cellFadeDuration: [{
                type: Input
            }], allowShowChangeAfterFilter: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], domLayout: [{
                type: Input
            }], ensureDomOrder: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], enableCellSpan: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], enableRtl: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressColumnVirtualisation: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressMaxRenderedRowRestriction: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressRowVirtualisation: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], rowDragManaged: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], refreshAfterGroupEdit: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], rowDragInsertDelay: [{
                type: Input
            }], suppressRowDrag: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressMoveWhenRowDragging: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], rowDragEntireRow: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], rowDragMultiRow: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], rowDragText: [{
                type: Input
            }], dragAndDropImageComponent: [{
                type: Input
            }], dragAndDropImageComponentParams: [{
                type: Input
            }], fullWidthCellRenderer: [{
                type: Input
            }], fullWidthCellRendererParams: [{
                type: Input
            }], embedFullWidthRows: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], groupDisplayType: [{
                type: Input
            }], groupDefaultExpanded: [{
                type: Input
            }], masterDefaultExpanded: [{
                type: Input
            }], autoGroupColumnDef: [{
                type: Input
            }], groupMaintainOrder: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], groupSelectsChildren: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], groupLockGroupColumns: [{
                type: Input
            }], groupAggFiltering: [{
                type: Input
            }], groupTotalRow: [{
                type: Input
            }], grandTotalRow: [{
                type: Input
            }], suppressStickyTotalRow: [{
                type: Input
            }], groupSuppressBlankHeader: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], groupSelectsFiltered: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], showOpenedGroup: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], groupHideParentOfSingleChild: [{
                type: Input
            }], groupRemoveSingleChildren: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], groupRemoveLowestSingleChildren: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], groupHideOpenParents: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], groupHideColumnsUntilExpanded: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], groupAllowUnbalanced: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], rowGroupPanelShow: [{
                type: Input
            }], groupRowRenderer: [{
                type: Input
            }], groupRowRendererParams: [{
                type: Input
            }], treeData: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], treeDataChildrenField: [{
                type: Input
            }], treeDataParentIdField: [{
                type: Input
            }], rowGroupPanelSuppressSort: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], pivotPanelSuppressSort: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressGroupRowsSticky: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], stickyRowsMaxViewportRatio: [{
                type: Input
            }], groupHierarchyConfig: [{
                type: Input
            }], pinnedTopRowData: [{
                type: Input
            }], pinnedBottomRowData: [{
                type: Input
            }], enableRowPinning: [{
                type: Input
            }], isRowPinnable: [{
                type: Input
            }], isRowPinned: [{
                type: Input
            }], rowModelType: [{
                type: Input
            }], rowData: [{
                type: Input
            }], asyncTransactionWaitMillis: [{
                type: Input
            }], suppressModelUpdateAfterUpdateTransaction: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], datasource: [{
                type: Input
            }], cacheOverflowSize: [{
                type: Input
            }], infiniteInitialRowCount: [{
                type: Input
            }], serverSideInitialRowCount: [{
                type: Input
            }], suppressServerSideFullWidthLoadingRow: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], cacheBlockSize: [{
                type: Input
            }], maxBlocksInCache: [{
                type: Input
            }], maxConcurrentDatasourceRequests: [{
                type: Input
            }], blockLoadDebounceMillis: [{
                type: Input
            }], purgeClosedRowNodes: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], serverSideDatasource: [{
                type: Input
            }], serverSideSortAllLevels: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], serverSideEnableClientSideSort: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], serverSideOnlyRefreshFilteredGroups: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], serverSidePivotResultFieldSeparator: [{
                type: Input
            }], viewportDatasource: [{
                type: Input
            }], viewportRowModelPageSize: [{
                type: Input
            }], viewportRowModelBufferSize: [{
                type: Input
            }], alwaysShowHorizontalScroll: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], alwaysShowVerticalScroll: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], debounceVerticalScrollbar: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressHorizontalScroll: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressScrollOnNewData: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressScrollWhenPopupsAreOpen: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressAnimationFrame: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressMiddleClickScrolls: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressPreventDefaultOnMouseWheel: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], scrollbarWidth: [{
                type: Input
            }], rowSelection: [{
                type: Input
            }], cellSelection: [{
                type: Input
            }], rowMultiSelectWithClick: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressRowDeselection: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressRowClickSelection: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressCellFocus: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressHeaderFocus: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], selectionColumnDef: [{
                type: Input
            }], rowNumbers: [{
                type: Input
            }], suppressMultiRangeSelection: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], enableCellTextSelection: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], enableRangeSelection: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], enableRangeHandle: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], enableFillHandle: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], fillHandleDirection: [{
                type: Input
            }], suppressClearOnFillReduction: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], sortingOrder: [{
                type: Input
            }], accentedSort: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], unSortIcon: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressMultiSort: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], alwaysMultiSort: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], multiSortKey: [{
                type: Input
            }], suppressMaintainUnsortedOrder: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], icons: [{
                type: Input
            }], rowHeight: [{
                type: Input
            }], rowStyle: [{
                type: Input
            }], rowClass: [{
                type: Input
            }], rowClassRules: [{
                type: Input
            }], suppressRowHoverHighlight: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressRowTransform: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], suppressContentVisibilityAuto: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], enableContentVisibilityAuto: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], contentVisibilityAutoDelay: [{
                type: Input
            }], columnHoverHighlight: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], gridId: [{
                type: Input
            }], deltaSort: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], treeDataDisplayType: [{
                type: Input
            }], enableGroupEdit: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], initialState: [{
                type: Input
            }], theme: [{
                type: Input
            }], loadThemeGoogleFonts: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], themeCssLayer: [{
                type: Input
            }], styleNonce: [{
                type: Input
            }], themeStyleContainer: [{
                type: Input
            }], getContextMenuItems: [{
                type: Input
            }], getMainMenuItems: [{
                type: Input
            }], getColumnMenuItems: [{
                type: Input
            }], postProcessPopup: [{
                type: Input
            }], processUnpinnedColumns: [{
                type: Input
            }], processCellForClipboard: [{
                type: Input
            }], processHeaderForClipboard: [{
                type: Input
            }], processGroupHeaderForClipboard: [{
                type: Input
            }], processCellFromClipboard: [{
                type: Input
            }], sendToClipboard: [{
                type: Input
            }], processDataFromClipboard: [{
                type: Input
            }], isExternalFilterPresent: [{
                type: Input
            }], doesExternalFilterPass: [{
                type: Input
            }], getChartToolbarItems: [{
                type: Input
            }], createChartContainer: [{
                type: Input
            }], focusGridInnerElement: [{
                type: Input
            }], navigateToNextHeader: [{
                type: Input
            }], tabToNextHeader: [{
                type: Input
            }], navigateToNextCell: [{
                type: Input
            }], tabToNextCell: [{
                type: Input
            }], tabToNextGridContainer: [{
                type: Input
            }], getLocaleText: [{
                type: Input
            }], getDocument: [{
                type: Input
            }], paginationNumberFormatter: [{
                type: Input
            }], getGroupRowAgg: [{
                type: Input
            }], isGroupOpenByDefault: [{
                type: Input
            }], isMasterOpenByDefault: [{
                type: Input
            }], ssrmExpandAllAffectsAllRows: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], initialGroupOrderComparator: [{
                type: Input
            }], processPivotResultColDef: [{
                type: Input
            }], processPivotResultColGroupDef: [{
                type: Input
            }], getDataPath: [{
                type: Input
            }], getChildCount: [{
                type: Input
            }], getServerSideGroupLevelParams: [{
                type: Input
            }], isServerSideGroupOpenByDefault: [{
                type: Input
            }], isApplyServerSideTransaction: [{
                type: Input
            }], isServerSideGroup: [{
                type: Input
            }], getServerSideGroupKey: [{
                type: Input
            }], getBusinessKeyForNode: [{
                type: Input
            }], getRowId: [{
                type: Input
            }], resetRowDataOnUpdate: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], autoGenerateColumnDefs: [{
                type: Input
            }], processAutoGeneratedColumnDefs: [{
                type: Input
            }], processRowPostCreate: [{
                type: Input
            }], isRowSelectable: [{
                type: Input
            }], isRowMaster: [{
                type: Input
            }], fillOperation: [{
                type: Input
            }], postSortRows: [{
                type: Input
            }], getRowStyle: [{
                type: Input
            }], getRowClass: [{
                type: Input
            }], getRowHeight: [{
                type: Input
            }], isFullWidthRow: [{
                type: Input
            }], isRowValidDropPosition: [{
                type: Input
            }], toolPanelVisibleChanged: [{
                type: Output
            }], toolPanelSizeChanged: [{
                type: Output
            }], columnMenuVisibleChanged: [{
                type: Output
            }], contextMenuVisibleChanged: [{
                type: Output
            }], cutStart: [{
                type: Output
            }], cutEnd: [{
                type: Output
            }], pasteStart: [{
                type: Output
            }], pasteEnd: [{
                type: Output
            }], calculatedColumnCreated: [{
                type: Output
            }], calculatedColumnExpressionChanged: [{
                type: Output
            }], calculatedColumnRemoved: [{
                type: Output
            }], calculatedColumnValidationStateChanged: [{
                type: Output
            }], columnVisible: [{
                type: Output
            }], columnPinned: [{
                type: Output
            }], columnHeaderNameChanged: [{
                type: Output
            }], columnResized: [{
                type: Output
            }], columnMoved: [{
                type: Output
            }], columnValueChanged: [{
                type: Output
            }], columnPivotModeChanged: [{
                type: Output
            }], columnPivotChanged: [{
                type: Output
            }], columnGroupOpened: [{
                type: Output
            }], newColumnsLoaded: [{
                type: Output
            }], gridColumnsChanged: [{
                type: Output
            }], displayedColumnsChanged: [{
                type: Output
            }], virtualColumnsChanged: [{
                type: Output
            }], columnEverythingChanged: [{
                type: Output
            }], columnsReset: [{
                type: Output
            }], columnHeaderMouseOver: [{
                type: Output
            }], columnHeaderMouseLeave: [{
                type: Output
            }], columnHeaderClicked: [{
                type: Output
            }], columnHeaderContextMenu: [{
                type: Output
            }], componentStateChanged: [{
                type: Output
            }], cellValueChanged: [{
                type: Output
            }], cellEditRequest: [{
                type: Output
            }], rowValueChanged: [{
                type: Output
            }], cellEditingStarted: [{
                type: Output
            }], cellEditingStopped: [{
                type: Output
            }], rowEditingStarted: [{
                type: Output
            }], rowEditingStopped: [{
                type: Output
            }], bulkEditingStarted: [{
                type: Output
            }], bulkEditingStopped: [{
                type: Output
            }], batchEditingStarted: [{
                type: Output
            }], batchEditingStopped: [{
                type: Output
            }], undoStarted: [{
                type: Output
            }], undoEnded: [{
                type: Output
            }], redoStarted: [{
                type: Output
            }], redoEnded: [{
                type: Output
            }], cellSelectionDeleteStart: [{
                type: Output
            }], cellSelectionDeleteEnd: [{
                type: Output
            }], rangeDeleteStart: [{
                type: Output
            }], rangeDeleteEnd: [{
                type: Output
            }], fillStart: [{
                type: Output
            }], fillEnd: [{
                type: Output
            }], filterOpened: [{
                type: Output
            }], filterChanged: [{
                type: Output
            }], filterModified: [{
                type: Output
            }], filterUiChanged: [{
                type: Output
            }], floatingFilterUiChanged: [{
                type: Output
            }], advancedFilterBuilderVisibleChanged: [{
                type: Output
            }], findChanged: [{
                type: Output
            }], chartCreated: [{
                type: Output
            }], chartRangeSelectionChanged: [{
                type: Output
            }], chartOptionsChanged: [{
                type: Output
            }], chartDestroyed: [{
                type: Output
            }], cellKeyDown: [{
                type: Output
            }], gridReady: [{
                type: Output
            }], firstDataRendered: [{
                type: Output
            }], gridSizeChanged: [{
                type: Output
            }], modelUpdated: [{
                type: Output
            }], virtualRowRemoved: [{
                type: Output
            }], viewportChanged: [{
                type: Output
            }], bodyScroll: [{
                type: Output
            }], bodyScrollEnd: [{
                type: Output
            }], dragStarted: [{
                type: Output
            }], dragStopped: [{
                type: Output
            }], dragCancelled: [{
                type: Output
            }], stateUpdated: [{
                type: Output
            }], issueRaised: [{
                type: Output
            }], paginationChanged: [{
                type: Output
            }], rowDragEnter: [{
                type: Output
            }], rowDragMove: [{
                type: Output
            }], rowDragLeave: [{
                type: Output
            }], rowDragEnd: [{
                type: Output
            }], rowDragCancel: [{
                type: Output
            }], rowResizeStarted: [{
                type: Output
            }], rowResizeEnded: [{
                type: Output
            }], columnRowGroupChanged: [{
                type: Output
            }], rowGroupOpened: [{
                type: Output
            }], expandOrCollapseAll: [{
                type: Output
            }], pivotMaxColumnsExceeded: [{
                type: Output
            }], pinnedRowDataChanged: [{
                type: Output
            }], pinnedRowsChanged: [{
                type: Output
            }], rowDataUpdated: [{
                type: Output
            }], asyncTransactionsFlushed: [{
                type: Output
            }], storeRefreshed: [{
                type: Output
            }], headerFocused: [{
                type: Output
            }], cellClicked: [{
                type: Output
            }], cellDoubleClicked: [{
                type: Output
            }], cellFocused: [{
                type: Output
            }], cellMouseOver: [{
                type: Output
            }], cellMouseOut: [{
                type: Output
            }], cellMouseDown: [{
                type: Output
            }], rowClicked: [{
                type: Output
            }], rowDoubleClicked: [{
                type: Output
            }], rowSelected: [{
                type: Output
            }], selectionChanged: [{
                type: Output
            }], cellContextMenu: [{
                type: Output
            }], rangeSelectionChanged: [{
                type: Output
            }], cellSelectionChanged: [{
                type: Output
            }], tooltipShow: [{
                type: Output
            }], tooltipHide: [{
                type: Output
            }], sortChanged: [{
                type: Output
            }] } });
const booleanMixedGridOptions = new Set(_BOOLEAN_MIXED_GRID_OPTIONS);
/**
 * Used to support the user setting combined boolean and string / object properties
 * as plain HTML attributes and us correctly mapping that to true.
 * For example cellSection can be boolean or an object
 */
function getValueOrCoercedValue(key, valueToUse) {
    if (booleanMixedGridOptions.has(key)) {
        // Handle plain HTML boolean attributes and convert them to boolean values
        // Also handle the false string case to match Angular boolean attributes
        return valueToUse === '' ? true : valueToUse === 'false' ? false : valueToUse;
    }
    return valueToUse;
}

class AgGridModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.30", ngImport: i0, type: AgGridModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "20.3.30", ngImport: i0, type: AgGridModule, imports: [AgGridAngular], exports: [AgGridAngular] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "20.3.30", ngImport: i0, type: AgGridModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.30", ngImport: i0, type: AgGridModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [AgGridAngular],
                    exports: [AgGridAngular],
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { AgComponentContainer, AgGridAngular, AgGridModule, AngularFrameworkComponentWrapper, AngularFrameworkOverrides };
//# sourceMappingURL=ag-grid-angular.mjs.map
