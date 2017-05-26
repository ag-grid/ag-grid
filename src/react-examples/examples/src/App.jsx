import React, {Component} from "react";
import {hashHistory, Redirect, Route, Switch} from "react-router-dom";

import NavItem from "./NavItem";

import "url-search-params-polyfill";

import DynamicComponentsExample from "./dynamicComponentExample/DynamicComponentsExample";
import RichComponentsExample from "./richComponentExample/RichComponentsExample";
import EditorComponentsExample from "./editorComponentExample/EditorComponentsExample";
import FloatingRowComponentExample from "./floatingRowExample/FloatingRowComponentExample";
import FullWidthComponentExample from "./fullWidthExample/FullWidthComponentExample";
import GroupedRowInnerRendererComponentExample from "./groupedRowInnerRendererExample/GroupedRowInnerRendererComponentExample";
import FilterComponentExample from "./filterComponentExample/FilterComponentExample";
import RichGridExample from "./richGridExample/RichGridExample";
import MasterDetailExample from "./masterDetailExample/MasterDetailExample";

const Header = () => (
    <header>
        <ul className="nav nav-pills">
            <NavItem to='/rich-grid'>Rich Grid Example</NavItem>
            <NavItem to='/dynamic'>Dynamic React Component Example</NavItem>
            <NavItem to='/rich-dynamic'>Dynamic React Components - Richer Example</NavItem>
            <NavItem to='/editor'>Cell Editor Component Example</NavItem>
            <NavItem to='/floating-row'>Floating Row Renderer Example</NavItem>
            <NavItem to='/full-width'>Full Width Renderer Example</NavItem>
            <NavItem to='/group-row'>Grouped Row Inner Renderer Example</NavItem>
            <NavItem to='/filter'>Filters Component Example</NavItem>
            <NavItem to='/master-detail'>Master Detail Example</NavItem>
        </ul>
    </header>
);


class App extends Component {
    constructor(props) {
        super(props);

        let searchParams = new URLSearchParams(window.location.search);
        let fromDocs = searchParams.has("fromDocs");

        let root = window.location.pathname === "/";
        let example = searchParams.has("example");

        this.state = {
            redirectTo: example && root ? searchParams.get("example") : null,
            fromDocs: fromDocs
        };
    }

    componentWillReceiveProps(nextProps, nextState) {
        let searchParams = new URLSearchParams(window.location.search);
        let root = window.location.pathname === "/";
        let example = searchParams.has("example");

        this.setState({
            redirectTo: example && root ? searchParams.get("example") : null
        });
    }

    render() {
        if (this.state.redirectTo) {
            return <Redirect from="/" exact to={this.state.redirectTo}/>
        } else {
            let header = this.state.fromDocs ? null : <Header/>;
            return (
                <div>
                    {header}
                    <Switch>
                        <Redirect from="/" exact to="/rich-grid"/>
                        <Route exact path='/rich-grid' component={RichGridExample}/>
                        <Route exact path='/dynamic' component={DynamicComponentsExample}/>
                        <Route exact path='/rich-dynamic' component={RichComponentsExample}/>
                        <Route exact path='/editor' component={EditorComponentsExample}/>
                        <Route exact path='/floating-row' component={FloatingRowComponentExample}/>
                        <Route exact path='/full-width' component={FullWidthComponentExample}/>
                        <Route exact path='/group-row' component={GroupedRowInnerRendererComponentExample}/>
                        <Route exact path='/filter' component={FilterComponentExample}/>
                        <Route exact path='/master-detail' component={MasterDetailExample}/>
                    </Switch>
                </div>
            )
        }
    }
}

export default App
