---
title: "SSRM Updating Data"
enterprise: true
---

There are various different approaches for having the grid update to changes while using the Server-Side Row Model.

The different options for keeping the grid updated are as follows:
- [Refresh](/server-side-model-updating-refresh/) - Reload all loaded rows from the server.
- [Single Row Updates](/server-side-model-updating-single-row/) - Update data directly on the existing rows.
- [Transactions](/server-side-model-updating-transactions/) - Add, remove and update rows in the grid.

## Picking Your Strategy

 - Does your application have rapidly changing values which need to be reflected in a time sensitive manner to your user?
    - If yes, do you need to handle creating and removing rows?
        - If yes, then use [Transactions](/server-side-model-updating-transactions/)
        - If not, try [Single Row Updates](/server-side-model-updating-single-row/)
    - If not, then [Refresh The Grid](/server-side-model-updating-refresh/)

## Next Up

Continue to the next section to learn how to [Refresh](/server-side-model-updating-refresh/) with the SSRM.