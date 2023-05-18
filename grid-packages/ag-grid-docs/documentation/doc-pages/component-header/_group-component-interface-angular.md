<framework-specific-section frameworks="angular">
|The header group component interface is almost identical to the above header component. The only difference is the `params` passed to the `agInit` method.
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
