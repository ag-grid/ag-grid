import React from "react";
import * as PropTypes from "prop-types";

// Header component to be used as default for all the columns.
export default class SortableHeaderComponent extends React.Component {

    constructor(props) {
        super(props);

        // this.sortChanged = this.onSortChanged.bind(this);
        this.props.column.addEventListener('sortChanged', this.onSortChanged);

        //The state of this component contains the current sort state of this column
        //The possible values are: 'asc', 'desc' and ''
        this.state = {
            sorted: ''
        }
    }

    componentWillUnmount() {
        this.props.column.removeEventListener('sortChanged', this.onSortChanged);
    }

    render() {
        let sortElements = [];
        if (this.props.enableSorting) {
            let downArrowClass = "customSortDownLabel " + (this.state.sorted === 'desc' ? " active" : "");
            let upArrowClass = "customSortUpLabel " + (this.state.sorted === 'asc' ? " active" : "");
            let removeArrowClass = "customSortRemoveLabel " + (this.state.sorted === '' ? " active" : "");

            sortElements.push(<div key={`up${this.props.displayName}`} className={downArrowClass}
                                   onClick={this.onSortRequested.bind(this, 'desc')}><i
                className="fa fa-long-arrow-down"/></div>);
            sortElements.push(<div key={`down${this.props.displayName}`} className={upArrowClass}
                                   onClick={this.onSortRequested.bind(this, 'asc')}><i
                className="fa fa-long-arrow-up"/></div>);
            sortElements.push(<div key={`minus${this.props.displayName}`} className={removeArrowClass}
                                   onClick={this.onSortRequested.bind(this, '')}><i
                className="fa fa-times"/></div>)
        }


        let menuButton = null;
        if (this.props.enableMenu) {
            menuButton =
                <div ref="menuButton" className="customHeaderMenuButton" onClick={this.onMenuClick.bind(this)}><i
                    className={"fa " + this.props.menuIcon}/></div>
        }

        return <div>
            {menuButton}
            <div className="customHeaderLabel">{this.props.displayName}</div>
            {sortElements}
        </div>
    }

    onSortRequested(order, event) {
        this.props.setSort(order, event.shiftKey);
    };

    onSortChanged = () => {
        if (this.props.column.isSortAscending()) {
            this.setState({
                sorted: 'asc'
            })
        } else if (this.props.column.isSortDescending()) {
            this.setState({
                sorted: 'desc'
            })
        } else {
            this.setState({
                sorted: ''
            })
        }
    };

    onMenuClick() {
        this.props.showColumnMenu(this.refs.menuButton);
    };

}

// the grid will always pass in one props called 'params',
// which is the grid passing you the params for the cellRenderer.
// this piece is optional. the grid will always pass the 'params'
// props, so little need for adding this validation meta-data.
SortableHeaderComponent.propTypes = {
    params: PropTypes.object
};