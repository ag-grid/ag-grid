import React, {Component} from 'react';

export default class CustomHeader extends Component {
    constructor(props) {
        super(props);

        props.reactContainer.style.display = "inline-block";

        this.state = {
            ascSort: 'inactive',
            descSort: 'inactive',
            noSort: 'inactive'
        };

        props.column.addEventListener('sortChanged', this.onSortChanged.bind(this));
    }

    componentDidMount() {
        this.onSortChanged();
    }

    render() {
        let menu = null;
        if (this.props.enableMenu) {
            menu =
                <div ref={(menuButton) => { this.menuButton = menuButton; }}
                     className="customHeaderMenuButton"
                     onClick={this.onMenuClicked.bind(this)}>
                    <i className={`fa ${this.props.menuIcon}`}></i>
                </div>
        }

        let sort = null;
        if (this.props.enableSorting) {
            sort =
                <div style={{display: "inline-block"}}>
                    <div onClick={this.onSortRequested.bind(this, 'asc')} className={`customSortDownLabel ${this.state.ascSort}`}>
                        <i class="fa fa-long-arrow-down"></i>
                    </div>
                    <div onClick={this.onSortRequested.bind(this, 'desc')} className={`customSortUpLabel ${this.state.descSort}`}>
                        <i class="fa fa-long-arrow-up"></i>
                    </div>
                    <div onClick={this.onSortRequested.bind(this, '')} className={`customSortRemoveLabel ${this.state.noSort}`}>
                        <i class="fa fa-times"></i>
                    </div>
                </div>
        }

        return (
            <div>
                {menu}
                <div className="customHeaderLabel">{this.props.displayName}</div>
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

    onMenuClick() {
        this.props.showColumnMenu(this.menuButton);
    }

    onSortRequested(order, event) {
        this.props.setSort(order, event.shiftKey);
    }
}