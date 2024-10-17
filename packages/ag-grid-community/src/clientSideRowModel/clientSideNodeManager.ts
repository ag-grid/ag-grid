import type { NamedBean } from '../context/bean';
import { AbstractClientSideNodeManager } from './abstractClientSideNodeManager';

export class ClientSideNodeManager<TData> extends AbstractClientSideNodeManager<TData> implements NamedBean {
    beanName = 'clientSideNodeManager' as const;
}
