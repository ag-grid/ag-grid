import React, {Component} from 'react';

export default class CustomHeaderGroup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            expandState: 'collapsed'
        };

        props.columnGroup.getOriginalColumnGroup().addEventListener('expandedChanged', this.syncExpandButtons.bind(this));
    }

    componentDidMount() {
        this.syncExpandButtons();
    }

    render() {
        return (
            <div className="ag-header-group-cell-label">
                <div className="customHeaderLabel">{this.props.displayName}</div>
                <div className={`customExpandButton ${this.state.expandState}`} onClick={this.expandOrCollapse.bind(this)}>
                    <i class="fa fa-arrow-right"></i>
                </div>
            </div>

        );
    }

    expandOrCollapse() {
        let currentState = this.props.columnGroup.getOriginalColumnGroup().isExpanded();
        this.props.setExpanded(!currentState);
    }

    syncExpandButtons() {
        this.setState({
            expandState: this.props.columnGroup.getOriginalColumnGroup().isExpanded() ? 'expanded' : 'collapsed'
        });
    }
}