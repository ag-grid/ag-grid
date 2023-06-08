import React, {Component} from "react";

export default class DaysFrostRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = this.getImageState();
    }

    getImageState() {
        return {
            rendererImage: `https://www.ag-grid.com/example-assets/weather/${this.props.rendererImage}`
        }
    }

    render() {
        return (
            <span>
                {
                    new Array(this.props.value).fill('')
                        .map((_, idx) =>
                            (<img key={idx} src={`https://www.ag-grid.com/example-assets/weather/${this.state.rendererImage}`} />)
                        )
                }
            </span>
        );
    }
};
