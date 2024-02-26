<framework-specific-section frameworks="angular">
|The Header Group Component interface is as follows:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|interface IHeaderAngularComp {
|    // The agInit(params) method is called on group header component once.
|    // See below for details on the parameters.
|    agInit(params: IHeaderGroupParams): void;
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| The params passed to `agInit(params)` are as follows:
</framework-specific-section>
