import React, {Component} from "react";

import "url-search-params-polyfill";

import DynamicComponentsExample from "./dynamicComponentExample/DynamicComponentsExample";
import RichGridExample from "./richGridExample/RichGridExample";
import RichComponentsExample from "./richComponentExample/RichComponentsExample";
import EditorComponentsExample from "./editorComponentExample/EditorComponentsExample";
import PinnedRowComponentExample from "./pinnedRowExample/PinnedRowComponentExample";
import FullWidthComponentExample from "./fullWidthExample/FullWidthComponentExample";
import GroupedRowInnerRendererComponentExample from "./groupedRowInnerRendererExample/GroupedRowInnerRendererComponentExample";
import FilterComponentExample from "./filterComponentExample/FilterComponentExample";
import MasterDetailExample from "./masterDetailExample/MasterDetailExample";
import SimpleReduxExample from "./simpleReduxExample/SimpleReduxExample";
import FloatingFilterGridExample from "./floatingFilter/FloatingFilterGridExample";

class App extends Component {
    constructor(props) {
        super(props);

        let searchParams = new URLSearchParams(window.location.search);
        let fromDocs = searchParams.has("fromDocs");
        let example = searchParams.has("example") ? searchParams.get("example") : 'rich-grid';

        this.state = {
            example,
            fromDocs
        };

        this.setExample = this.setExample.bind(this);
    }

    setExample(example) {
        this.setState({
            example
        })
    }

    render() {
        let header = null;
        if (!this.state.fromDocs) {
            header = (
                <ul className="nav nav-pills">
                    <li role="presentation" className={this.state.example === 'rich-grid' ? 'active' : null} onClick={() => this.setExample("rich-grid")}><a href="#">Rich Grid Example</a></li>
                    <li role="presentation" className={this.state.example === 'dynamic' ? 'active' : null} onClick={() => this.setExample("dynamic")}><a href="#">Dynamic React Component Example</a></li>
                    <li role="presentation" className={this.state.example === 'rich-dynamic' ? 'active' : null} onClick={() => this.setExample("rich-dynamic")}><a href="#">Dynamic React Components - Richer Example</a></li>
                    <li role="presentation" className={this.state.example === 'editor' ? 'active' : null} onClick={() => this.setExample("editor")}><a href="#">Cell Editor Component Example</a></li>
                    <li role="presentation" className={this.state.example === 'pinned-row' ? 'active' : null} onClick={() => this.setExample("pinned-row")}><a href="#">Pinned Row Renderer Example</a></li>
                    <li role="presentation" className={this.state.example === 'full-width' ? 'active' : null} onClick={() => this.setExample("full-width")}><a href="#">Full Width Renderer Example</a></li>
                    <li role="presentation" className={this.state.example === 'group-row' ? 'active' : null} onClick={() => this.setExample("group-row")}><a href="#">Grouped Row Inner Renderer Example</a></li>
                    <li role="presentation" className={this.state.example === 'filter' ? 'active' : null} onClick={() => this.setExample("filter")}><a href="#">Filters Component Example</a></li>
                    <li role="presentation" className={this.state.example === 'floating-filter' ? 'active' : null} onClick={() => this.setExample("floating-filter")}><a href="#">Floating Filters</a></li>
                    <li role="presentation" className={this.state.example === 'master-detail' ? 'active' : null} onClick={() => this.setExample("master-detail")}><a href="#">Master Detail Example</a></li>
                    <li role="presentation" className={this.state.example === 'simple-redux' ? 'active' : null} onClick={() => this.setExample("simple-redux")}><a href="#">Simple Redux Example</a></li>
                </ul>)
        }

        let example = null;
        switch (this.state.example) {
            case 'dynamic':
                example = <DynamicComponentsExample/>;
                break;
            case 'rich-dynamic':
                example = <RichComponentsExample/>;
                break;
            case 'editor':
                example = <EditorComponentsExample/>;
                break;
            case 'pinned-row':
                example = <PinnedRowComponentExample/>;
                break;
            case 'full-width':
                example = <FullWidthComponentExample/>;
                break;
            case 'group-row':
                example = <GroupedRowInnerRendererComponentExample/>;
                break;
            case 'filter':
                example = <FilterComponentExample/>;
                break;
            case 'master-detail':
                example = <MasterDetailExample/>;
                break;
            case 'simple-redux':
                example = <SimpleReduxExample/>;
                break;
            case 'floating-filter':
                example = <FloatingFilterGridExample/>;
                break;
            default:
                example = <RichGridExample/>;
        }

        return (
            <div>
                {header}
                {example}
            </div>
        )
    }
}

export default App
