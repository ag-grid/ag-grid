[[only-react]]
|
|Below is a simple example of a tooltip component as a Hook:
|
|```jsx
|export default props => {
|    const data = useMemo(props.api.getDisplayedRowAtIndex(props.rowIndex).data, []);
|    return (
|        <div className="custom-tooltip" style={{backgroundColor: props.color || 'white'}}>
|            <p><span>{data.athlete}</span></p>
|            <p><span>Country: </span> {data.country}</p>
|            <p><span>Total: </span> {data.total}</p>
|        </div>
|    );
|};
|```
|
|And here is the same example as a Class-based Component:
|
|```jsx
|export default class CustomTooltip extends Component {
|    render() {
|        const data = this.props.api.getDisplayedRowAtIndex(this.props.rowIndex).data;
|        return (
|            <div className="custom-tooltip" style={{backgroundColor: this.props.color || 'white'}}>
|                <p><span>{data.athlete}</span></p>
|                <p><span>Country: </span> {data.country}</p>
|                <p><span>Total: </span> {data.total}</p>
|            </div>
|        );
|    }
|}
|```
|And finally here is an example using AG Grid [Packages](/packages/), hooks and TypeScript:
|
|```jsx
|import React, {useMemo} from 'react';
|import {ITooltipParams} from "ag-grid-community";
|import {ITooltipReactComp} from "ag-grid-react";
|
|const CustomTooltip = (props: ITooltipParams) => {
|    const data = useMemo(props.api.getDisplayedRowAtIndex(props.rowIndex).data, []);
|    
|    return (
|        <div style={{backgroundColor: props.color || 'white'}}>
|                <p><span>{data.athlete}</span></p>
|                <p><span>Country: </span> {data.country}</p>
|                <p><span>Total: </span> {data.total}</p>
|        </div>
|    );
|};
|
|export default CustomTooltip;
|```
