<framework-specific-section frameworks="javascript">
|The Header Group Component interface is as follows:
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false} language="ts">
|interface IHeaderGroupComp {
|    // optional method, gets called once with params
|    init?(params: IHeaderGroupParams): void;
|
|    // can be called more than once, you should return the HTML element
|    getGui(): HTMLElement;
|
|    // optional method, gets called once, when component is destroyed
|    destroy?(): void;
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
|The params passed to `init(params)` are as follows:
</framework-specific-section>
