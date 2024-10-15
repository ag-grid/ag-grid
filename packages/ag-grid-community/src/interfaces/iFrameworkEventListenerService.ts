export interface IFrameworkEventListenerService<
    TEventListener extends (e: any) => void,
    TGlobalEventListener extends (name: string, e: any) => void,
> {
    wrap(userListener: TEventListener): TEventListener;

    wrapGlobal(userListener: TGlobalEventListener): TGlobalEventListener;

    unwrap(userListener: TEventListener): TEventListener;

    unwrapGlobal(userListener: TGlobalEventListener): TGlobalEventListener;
}
