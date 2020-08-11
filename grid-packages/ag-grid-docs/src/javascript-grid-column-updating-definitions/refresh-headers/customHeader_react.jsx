import React, {Component} from 'react';

export default class CustomHeader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ascSort: 'inactive',
            descSort: 'inactive',
            noSort: 'inactive',
            enableMenu: props.enableMenu,
            enableSorting: props.enableSorting,
            displayName: props.displayName
        };

        props.column.addEventListener('sortChanged', this.onSortChanged.bind(this));
    }

    componentDidMount() {
        this.onSortChanged();
    }

    refresh(params) {
        console.log("here", params.enableMenu);
        this.setState({
            enableMenu: params.enableMenu,
            enableSorting: params.enableSorting,
            displayName: params.displayName
        })
        return true;
    }

    render() {
        let menu = null;
        if (this.state.enableMenu) {
            menu =
                <div ref={(menuButton) => {
                    this.menuButton = menuButton;
                }}
                     className="ag-icon ag-icon-menu"
                     onClick={this.onMenuClicked.bind(this)}>
                </div>;
        }

        let sort = null;
        if (this.state.enableSorting) {
            sort =
                <div style={{display: "inline-block"}}>
                    <div onClick={this.onSortRequested.bind(this, 'asc')}
                         onTouchEnd={this.onSortRequested.bind(this, 'asc')}
                         className={`customSortDownLabel ${this.state.ascSort}`}>
                        <i class="fa fa-long-arrow-alt-down"></i>
                    </div>
                    <div onClick={this.onSortRequested.bind(this, 'desc')}
                         onTouchEnd={this.onSortRequested.bind(this, 'desc')}
                         className={`customSortUpLabel ${this.state.descSort}`}>
                        <i class="fa fa-long-arrow-alt-up"></i>
                    </div>
                    <div onClick={this.onSortRequested.bind(this, '')} onTouchEnd={this.onSortRequested.bind(this, '')}
                         className={`customSortRemoveLabel ${this.state.noSort}`}>
                        <i class="fa fa-times"></i>
                    </div>
                </div>;
        }

        return (
            <div style={{display: 'flex'}}>
                {menu}
                <div className="customHeaderLabel">{this.state.displayName}</div>
                {sort}
            </div>
        );
    }

    onMenuClicked() {
        this.props.showColumnMenu(this.menuButton);
    }

    onSortChanged() {
        this.setState({
            ascSort: this.props.column.isSortAscending() ? 'active' : 'inactive',
            descSort: this.props.column.isSortDescending() ? 'active' : 'inactive',
            noSort: !this.props.column.isSortAscending() && !this.props.column.isSortDescending() ? 'active' : 'inactive'
        });
    }

    onSortRequested(order, event) {
        this.props.setSort(order, event.shiftKey);
    }
}
