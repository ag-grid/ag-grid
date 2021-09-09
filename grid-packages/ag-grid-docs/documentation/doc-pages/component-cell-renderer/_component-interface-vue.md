[[only-vue]]
|## Cell Renderer Component
|
|When a Vue component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell & 
|row values available to you via a `params` object.  
|
|With Vue 2 and Vue 3 you can access the `params` object via `this.params` in the usual methods (lifecycle hooks, methods etc), and with Vue 3's `setup` 
|via `props.params`.
|
|The interface for both the initial `params` value, as well as the argument passed in subsequent `refresh` calls 
|(see below for details on `refresh`) are as follows:
