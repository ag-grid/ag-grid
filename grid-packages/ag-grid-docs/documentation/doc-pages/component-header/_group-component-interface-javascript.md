[[only-javascript]]
|
|The header group component interface is almost identical to the above header component. The only difference is the `params` object passed to the `init` method.
|
|```ts
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
|```
|
|The params passed to `init(params)` are as follows:
