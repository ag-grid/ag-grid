import {BeanStub} from "../../context/beanStub";

export abstract class RowNodeBlock extends BeanStub {

    public static EVENT_LOAD_COMPLETE = 'loadComplete';

    public static STATE_DIRTY = 'dirty';
    public static STATE_LOADING = 'loading';
    public static STATE_LOADED = 'loaded';
    public static STATE_FAILED = 'failed';

    public abstract getState(): string;

    public abstract load(): void;

    public abstract getBlockStateJson(): {id: string, state: any};

}
