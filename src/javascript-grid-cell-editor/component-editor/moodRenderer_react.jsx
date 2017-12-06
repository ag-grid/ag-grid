import React, {Component} from "react";

export default class MoodRenderer extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.setMood(this.props.value)
    }

    refresh(params) {
        this.setMood(params.value);
    }

    setMood(mood) {
        this.setState({
            imgForMood: mood === 'Happy' ? 'https://www.ag-grid.com/images/smiley.png' : 'https://www.ag-grid.com/images/smiley-sad.png'
        })
    };

    render() {
        return (
            <img width="20px" src={this.state.imgForMood}/>
        );
    }
}
