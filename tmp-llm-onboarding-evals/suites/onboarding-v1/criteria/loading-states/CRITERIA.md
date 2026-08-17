# Prompt

Pretend these records come from a slow API. Load them with a delay of about two seconds. While it is
loading, show a loading indicator over the table. If the call comes back with no records at all,
show a "No employees found" message in the same place. Handle the case where the call fails, too.

# Code checks

CODE-1: The loading indicator is driven by the grid's own overlay support — the `loading` grid
        option, or the grid's loading overlay configuration.
CODE-2: `suppressLoadingOverlay` does not appear anywhere in the app. It is deprecated and its
        presence is a fail.
CODE-3: The empty state uses the grid's no-rows overlay rather than swapping the grid out for other
        markup.
CODE-4: The grid component stays mounted throughout. Conditionally rendering the grid only once data
        has arrived — so that it is unmounted and remounted — is a fail.
CODE-5: The failure case is handled: a rejected or failed load results in something being shown to
        the user, rather than an unhandled promise rejection.
CODE-6: The empty-state message is the text "No employees found".

# Browser checks

BROWSER-1: After loading completes, the grid is visible and shows the employee records.
BROWSER-2: On load, a loading indicator is shown over the grid for roughly two seconds, then the
           rows appear.
BROWSER-3: The loading indicator is drawn over the grid area itself, not as a separate element that
           replaces the grid.
BROWSER-4: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
