---
title: "Column API"
---

Below are listed all the column API methods.

## Column Keys

Some of the API methods take Column Key (named `colKey`) which has type `Column | string`. This means you can pass either a `Column` object (that you receive from calling one of the other methods) or you pass in the Column ID (which is a `string`). The Column ID is a property of the column definition. If you do not provide the Column ID, the grid will create one for you (first by trying to use the field if it is unique, otherwise it will generate an ID).

<api-documentation source='api.json' config='{"isApi": true}'></api-documentation>