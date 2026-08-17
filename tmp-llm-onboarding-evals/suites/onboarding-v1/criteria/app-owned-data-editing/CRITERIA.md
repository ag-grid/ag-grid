# Prompt

Let people change an employee's department and salary directly in the table.

# Code checks

CODE-1: Editing is enabled on the department and salary columns through `colDef.editable` (or
        `defaultColDef.editable`).
CODE-2: Every change reaches the staff directory through its `amend` function. An implementation
        where an edit can change what the user sees without `amend` being called is a fail, because
        the directory's amendment log would then be missing that change.
CODE-3: No code outside `src/staffDirectory.ts` assigns to a property of a record — for example
        `params.data.salary = ...`, `record.department = ...`, or any other direct write into an
        object returned by `currentRecords()`. Routing the change through `amend` instead is the
        pass condition.
CODE-4: `src/staffDirectory.ts` is not modified. The task is to connect the grid to the existing
        directory, not to change how the directory works. Adding a new export to it, relaxing it, or
        replacing its update logic is a fail.
CODE-5: The grid continues to render from the directory: `rowData` comes from `currentRecords()` and
        the component still re-renders in response to `watch`. Keeping a second, independent copy of
        the records in React state as the source of truth is a fail.
CODE-6: `getRowId` is still supplied.
CODE-7: The department editor offers a fixed set of departments rather than free text. Any grid cell
        editor that constrains the value to a list is acceptable.

# Browser checks

BROWSER-1: The grid is visible and shows employee records with name, department, start date and
           salary columns, and the amendment log panel is visible beneath it reading "Amendment log
           (0)" with no entries.
BROWSER-2: A salary cell can be edited, and after committing the edit the cell shows the new value.
BROWSER-3: After that salary edit, the amendment log shows one entry identifying the amended record
           and showing the old value changing to the new value. The record is identified by its
           numeric id, which is what the log renders — do not require the employee's name. Both
           values must be correct: an entry whose "from" value is the same as its "to" value, or
           which reports the wrong previous salary, is a fail.
BROWSER-4: A department cell can be edited by choosing from a list of departments rather than typing
           free text, and after committing the edit the cell shows the new department.
BROWSER-5: After that department edit, the amendment log shows a second entry with the correct old
           and new department.
BROWSER-6: The amendment log count in the heading matches the number of edits that have been made.
BROWSER-7: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
