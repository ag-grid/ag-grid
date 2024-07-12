import { BeanStub } from '../context/beanStub';

/**
 * An EmptyBean can be used to manage the lifecycle of event handlers that are tied to a component instead of a controller.
 * Used in React to avoid duplicating listeners and setup logic while React is running in StrictMode where setComp will be called multiple times.
 * This is only required for the Components where the ctrl is managed by AG Grid and passed into the React component.
 * Both React and the Ctrl can decide to destroy the EmptyBean which will clean up listeners setup against it.
 */
export class EmptyBean extends BeanStub {}
