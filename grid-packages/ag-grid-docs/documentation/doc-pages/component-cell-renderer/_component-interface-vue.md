[[only-vue]]
|## Cell Renderer Component
|
|When a Vue component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell & 
|row values available to you via `this.params`.  
|
|The interface for both the initial `params` value, as well as the argument passed in subsequent `refresh` calls 
|(see below for details on `refresh`) are as follows:
