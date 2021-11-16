import React, { Component } from 'react';

export default class CustomHeader extends Component {
    render() {
        console.log('CustomHeader.render() -> ' + this.props.displayName);

        return (
            <div style={{ display: 'flex' }}>
                {this.props.enableMenu && <div
                    ref={(menuButton) => { this.menuButton = menuButton; }}
                    className="ag-icon ag-icon-menu"
                    onClick={this.onMenuClicked.bind(this)}>&nbsp;</div>}
                <div className="customHeaderLabel">{this.props.displayName}</div>
            </div>
        );
    }

    onMenuClicked() {
        this.props.showColumnMenu(this.menuButton);
    }
}
