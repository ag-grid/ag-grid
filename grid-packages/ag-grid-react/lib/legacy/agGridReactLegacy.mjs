// ag-grid-react v30.0.4
import { BaseComponentWrapper, ComponentUtil, Grid, _ } from 'ag-grid-community';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { LegacyReactComponent } from './legacyReactComponent.mjs';
import { NewReactComponent } from '../shared/newReactComponent.mjs';
import { LegacyPortalManager } from '../shared/portalManager.mjs';
import { ReactFrameworkOverrides } from '../shared/reactFrameworkOverrides.mjs';
export class AgGridReactLegacy extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.api = null;
        this.destroyed = false;
        this.SYNCHRONOUS_CHANGE_PROPERTIES = ['context'];
        this.portalManager = new LegacyPortalManager(this, props.componentWrappingElement, props.maxComponentCreationTimeMs);
    }
    render() {
        return React.createElement('div', {
            style: this.createStyleForDiv(),
            className: this.props.className,
            ref: (e) => {
                this.eGridDiv = e;
            }
        }, this.portalManager.getPortals());
    }
    createStyleForDiv() {
        return Object.assign({ height: '100%' }, (this.props.containerStyle || {}));
    }
    componentDidMount() {
        const modules = this.props.modules || [];
        const gridParams = {
            providedBeanInstances: {
                agGridReact: this,
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(this, this.portalManager)
            },
            modules,
            frameworkOverrides: new ReactFrameworkOverrides(false)
        };
        const gridOptions = this.props.gridOptions || {};
        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(gridOptions, this.props);
        this.checkForDeprecations(this.props);
        // don't need the return value
        new Grid(this.eGridDiv, this.gridOptions, gridParams);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;
        this.props.setGridApi(this.api, this.columnApi);
    }
    checkForDeprecations(props) {
        if (props.rowDataChangeDetectionStrategy) {
            _.doOnce(() => console.warn('AG Grid: Since v29 rowDataChangeDetectionStrategy has been deprecated. Row data property changes will be compared by reference via triple equals ===. See https://ag-grid.com/react-data-grid/react-hooks/'), 'rowDataChangeDetectionStrategy_Deprecation');
        }
    }
    shouldComponentUpdate(nextProps) {
        this.processPropsChanges(this.props, nextProps);
        // we want full control of the dom, as AG Grid doesn't use React internally,
        // so for performance reasons we tell React we don't need render called after
        // property changes.
        return false;
    }
    componentDidUpdate(prevProps) {
        this.processPropsChanges(prevProps, this.props);
    }
    processPropsChanges(prevProps, nextProps) {
        const changes = {};
        this.extractGridPropertyChanges(prevProps, nextProps, changes);
        this.processSynchronousChanges(changes);
        this.processAsynchronousChanges(changes);
    }
    extractGridPropertyChanges(prevProps, nextProps, changes) {
        const debugLogging = !!nextProps.debug;
        Object.keys(nextProps).forEach(propKey => {
            if (ComponentUtil.ALL_PROPERTIES_SET.has(propKey)) {
                if (prevProps[propKey] !== nextProps[propKey]) {
                    if (debugLogging) {
                        console.log(`agGridReact: [${propKey}] property changed`);
                    }
                    changes[propKey] = {
                        previousValue: prevProps[propKey],
                        currentValue: nextProps[propKey]
                    };
                }
            }
        });
        ComponentUtil.EVENT_CALLBACKS.forEach(funcName => {
            if (prevProps[funcName] !== nextProps[funcName]) {
                if (debugLogging) {
                    console.log(`agGridReact: [${funcName}] event callback changed`);
                }
                changes[funcName] = {
                    previousValue: prevProps[funcName],
                    currentValue: nextProps[funcName]
                };
            }
        });
    }
    componentWillUnmount() {
        if (this.api) {
            this.api.destroy();
            this.api = null;
        }
        this.destroyed = true;
        this.portalManager.destroy();
    }
    isDisableStaticMarkup() {
        return this.props.disableStaticMarkup === true;
    }
    isLegacyComponentRendering() {
        return this.props.legacyComponentRendering === true;
    }
    processSynchronousChanges(changes) {
        const asyncChanges = Object.assign({}, changes);
        if (Object.keys(asyncChanges).length > 0) {
            const synchronousChanges = {};
            this.SYNCHRONOUS_CHANGE_PROPERTIES.forEach((synchronousChangeProperty) => {
                if (asyncChanges[synchronousChangeProperty]) {
                    synchronousChanges[synchronousChangeProperty] = asyncChanges[synchronousChangeProperty];
                    delete asyncChanges[synchronousChangeProperty];
                }
            });
            if (Object.keys(synchronousChanges).length > 0 && !!this.api) {
                ComponentUtil.processOnChange(synchronousChanges, this.api);
            }
        }
        return asyncChanges;
    }
    processAsynchronousChanges(changes) {
        if (Object.keys(changes).length > 0) {
            window.setTimeout(() => {
                // destroyed?
                if (this.api) {
                    ComponentUtil.processOnChange(changes, this.api);
                }
            });
        }
    }
}
AgGridReactLegacy.MAX_COMPONENT_CREATION_TIME_IN_MS = 1000; // a second should be more than enough to instantiate a component
AgGridReactLegacy.defaultProps = {
    legacyComponentRendering: false,
    disableStaticMarkup: false,
    maxComponentCreationTimeMs: AgGridReactLegacy.MAX_COMPONENT_CREATION_TIME_IN_MS
};
AgGridReactLegacy.propTypes = {
    gridOptions: PropTypes.object
};
addProperties(ComponentUtil.EVENT_CALLBACKS, PropTypes.func);
addProperties(ComponentUtil.BOOLEAN_PROPERTIES, PropTypes.bool);
addProperties(ComponentUtil.STRING_PROPERTIES, PropTypes.string);
addProperties(ComponentUtil.OBJECT_PROPERTIES, PropTypes.object);
addProperties(ComponentUtil.ARRAY_PROPERTIES, PropTypes.array);
addProperties(ComponentUtil.NUMBER_PROPERTIES, PropTypes.number);
addProperties(ComponentUtil.FUNCTION_PROPERTIES, PropTypes.func);
function addProperties(listOfProps, propType) {
    listOfProps.forEach(propKey => {
        AgGridReactLegacy[propKey] = propType;
    });
}
class ReactFrameworkComponentWrapper extends BaseComponentWrapper {
    constructor(agGridReact, portalManager) {
        super();
        this.agGridReact = agGridReact;
        this.portalManager = portalManager;
    }
    createWrapper(UserReactComponent, componentType) {
        if (this.agGridReact.isLegacyComponentRendering()) {
            return new LegacyReactComponent(UserReactComponent, this.agGridReact, this.portalManager, componentType);
        }
        else {
            return new NewReactComponent(UserReactComponent, this.portalManager, componentType);
        }
    }
}
