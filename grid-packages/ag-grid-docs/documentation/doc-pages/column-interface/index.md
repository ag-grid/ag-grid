---
title: "Column Interface"
---

Your application interacts with columns through the grid's column interface. The column interface is defined as all the public facing parts of the columns that your application interacts with. This section list all the column methods, properties, events etc. for interacting with the grid's columns.

The column interface is the combination of the following items:

- [Column Properties](/column-properties/): Columns are configured through column definitions. A column definition contains the column properties e.g. `colDef.pinned='left'`.
- [Column API](/column-api/): The column API is similar to the grid API, the difference is that the column API provides methods relevant to columns e.g. `columnApi.setColumnVisible('country', false)`.
- [Column Object](/column-object/): Each column in the grid is represented by a Column object, which in turn has a reference to the column definition provided by the application. The Column wraps the Column Definition. The Column object has attributes, methods and events for interacting with the specific column e.g. `column.isVisible()`.
