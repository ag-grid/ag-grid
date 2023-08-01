import React, {Component} from 'react';

export default class CustomTooltip extends Component {
    constructor() {
        super();
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.inputRef = React.createRef();
    }

    onFormSubmit(e) {
        e.preventDefault();

        const { node } = this.props;
        const target = this.inputRef.current;

        if (target.value && node) {
            node.setDataValue('athlete', target.value);
            if (this.props.hideTooltipCallback) {
                this.props.hideTooltipCallback();
            }
        }
    }

    render() {
        const data = this.props.api.getDisplayedRowAtIndex(this.props.rowIndex).data;
        return (
            <div className={'panel panel-' + (this.props.type || 'primary')}>
                <div className="panel-heading">
                    <h3 className="panel-title">{data.country}</h3>
                </div>
                <form className="panel-body" onSubmit={this.onFormSubmit}>
                    <div className="form-group">
                        <input type="text" ref={this.inputRef} className="form-control" id="name" placeholder="Name" autoComplete='off' defaultValue={data.athlete} onFocus={ e => e.target.select() } />
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </div>
                    <p>Total: {data.total}</p>
                </form>
            </div>
        );
    }
}
