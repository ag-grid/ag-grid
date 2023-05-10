[[only-angular]]
|
|The header group component interface is almost identical to the above header component. The only difference is the `params` passed to the `agInit` method.
|
|```ts
|interface IHeaderAngularComp {
|    // The agInit(params) method is called on group header component once.
|    // See below for details on the parameters.
|    agInit(params: IHeaderGroupParams): void;
|}
|```
|
| The params passed to `agInit(params)` are as follows:
