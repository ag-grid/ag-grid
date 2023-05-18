<framework-specific-section frameworks="react">
|
|Below is a simple example of a tooltip component as a Hook:
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default props => {
|    const data = useMemo(props.api.getDisplayedRowAtIndex(props.rowIndex).data, []);
|    return (
|        &lt;div className="custom-tooltip" style={{backgroundColor: props.color || 'white'}}>
|            &lt;p>&lt;span>{data.athlete}&lt;/span>&lt;/p>
|            &lt;p>&lt;span>Country: &lt;/span> {data.country}&lt;/p>
|            &lt;p>&lt;span>Total: &lt;/span> {data.total}&lt;/p>
|        &lt;/div>
|    );
|};
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
|And here is the same example as a Class-based Component:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default class CustomTooltip extends Component {
|    render() {
|        const data = this.props.api.getDisplayedRowAtIndex(this.props.rowIndex).data;
|        return (
|            &lt;div className="custom-tooltip" style={{backgroundColor: this.props.color || 'white'}}>
|                &lt;p>&lt;span>{data.athlete}&lt;/span>&lt;/p>
|                &lt;p>&lt;span>Country: &lt;/span> {data.country}&lt;/p>
|                &lt;p>&lt;span>Total: &lt;/span> {data.total}&lt;/p>
|            &lt;/div>
|        );
|    }
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
|And finally here is an example using AG Grid [Packages](/packages/), hooks and TypeScript:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|import React, {useMemo} from 'react';
|import {ITooltipParams} from "ag-grid-community";
|import {ITooltipReactComp} from "ag-grid-react";
|
|const CustomTooltip = (props: ITooltipParams) => {
|    const data = useMemo(props.api.getDisplayedRowAtIndex(props.rowIndex).data, []);
|    
|    return (
|        &lt;div style={{backgroundColor: props.color || 'white'}}>
|                &lt;p>&lt;span>{data.athlete}&lt;/span>&lt;/p>
|                &lt;p>&lt;span>Country: &lt;/span> {data.country}&lt;/p>
|                &lt;p>&lt;span>Total: &lt;/span> {data.total}&lt;/p>
|        &lt;/div>
|    );
|};
|
|export default CustomTooltip;
</snippet>
</framework-specific-section>