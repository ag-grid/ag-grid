const SLACK_USER_KEY_MAP = {
    "Slack ID": "slackId",
    "Full Name": "fullName",
    "Github": "github",
    "Staging notification": "stagingNotification",
    "Git Emails": { key: "gitEmails", extract: extractEmailsFromRichText },
};

const getDataSourceQueryUrl = (dataSourceId) => `https://api.notion.com/v1/data_sources/${dataSourceId}/query`;

/**
 * Extracts plain values from Notion property objects.
 * Returns null for empty/unset values.
 */
function extractPropertyValue(property) {
  switch (property.type) {
    case "title":
      return property.title.map((t) => t.plain_text).join("") || null;

    case "rich_text":
      return property.rich_text.map((t) => t.plain_text).join("") || null;

    case "checkbox":
      return property.checkbox;

    case "number":
      return property.number;

    case "select":
      return property.select?.name ?? null;

    case "multi_select":
      return property.multi_select.map((s) => s.name);

    case "status":
      return property.status?.name ?? null;

    case "date":
      return property.date
        ? { start: property.date.start, end: property.date.end }
        : null;

    case "people":
      return property.people.map((p) => ({ id: p.id, name: p.name ?? null }));

    case "url":
      return property.url;

    case "email":
      return property.email;

    case "phone_number":
      return property.phone_number;

    case "created_time":
      return property.created_time;

    case "last_edited_time":
      return property.last_edited_time;

    case "created_by":
      return property.created_by?.id ?? null;

    case "last_edited_by":
      return property.last_edited_by?.id ?? null;

    case "files":
      return property.files.map((f) => f.file?.url ?? f.external?.url ?? null);

    case "relation":
      return property.relation.map((r) => r.id);

    case "formula":
      return property.formula[property.formula.type];

    case "rollup":
      return property.rollup[property.rollup.type];

    case "unique_id":
      return property.unique_id.prefix
        ? `${property.unique_id.prefix}-${property.unique_id.number}`
        : property.unique_id.number;

    default:
      return null;
  }
}

/**
 * Extracts email addresses from a Notion rich_text property. Notion renders
 * emails as either bare text (`someone@example.com`) or as mailto links; in
 * both cases the address appears in the segment's `plain_text`, so we scan
 * the concatenated plain text with an email regex and dedupe.
 */
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z0-9-]+/g;
function extractEmailsFromRichText(prop) {
  const text = prop.rich_text.map((t) => t.plain_text ?? "").join("");
  return [...new Set(text.match(EMAIL_RE) ?? [])];
}

/**
 * Converts a single Notion page into a flat object.
 * Includes page metadata under `_meta` so it doesn't collide with property names.
 *
 * keyMap entries may be either a string (rename only) or `{ key, extract }`
 * to override extraction for a specific property.
 */
function simplifyPage(page, keyMap = {}) {
  const simplified = { _meta: { id: page.id, url: page.url } };
  for (const [name, prop] of Object.entries(page.properties)) {
    const mapping = keyMap[name];
    if (mapping && typeof mapping === "object") {
      simplified[mapping.key] = mapping.extract(prop);
    } else {
      simplified[mapping ?? name] = extractPropertyValue(prop);
    }
  }
  return simplified;
}

/**
 * Converts a full query response into an array of simplified objects.
 */
function simplifyQueryResults(response, keyMap) {
  return response.results.map((page) => simplifyPage(page, keyMap));
}

export async function getSlackUserConfig({
    notionApiToken,
    notionDataSourceId,
    notionApiVersion = "2026-03-11",
}) {
    const queryUrl = getDataSourceQueryUrl(notionDataSourceId);
    // Notion paginates query results; loop until `has_more` is false so the user list is complete
    // even after the data source grows past Notion's default page size.
    const allResults = [];
    let startCursor;
    do {
        const body = startCursor ? JSON.stringify({ start_cursor: startCursor }) : undefined;
        const response = await fetch(queryUrl, {
            method: "post",
            headers: {
                "Authorization": `Bearer ${notionApiToken}`,
                "Notion-Version": notionApiVersion,
                ...(body ? { "Content-Type": "application/json" } : {}),
            },
            ...(body ? { body } : {}),
        });
        const data = await response.json();

        if (!Array.isArray(data?.results)) {
            const notionMessage = data?.message ? ` Notion said: ${data.message}` : "";
            return { error: `Notion query did not return a 'results' array (status ${response.status}).${notionMessage}` };
        }

        allResults.push(...data.results);
        startCursor = data.has_more ? data.next_cursor : undefined;
    } while (startCursor);

    if (allResults.length === 0) {
        return { error: "Notion query returned no rows, so the schema cannot be validated. Check the data source has at least one entry." };
    }

    const expectedHeadings = Object.keys(SLACK_USER_KEY_MAP);
    const presentHeadings = Object.keys(allResults[0].properties ?? {});
    const missing = expectedHeadings.filter((h) => !presentHeadings.includes(h));
    if (missing.length > 0) {
        const quote = (xs) => xs.map((x) => `"${x}"`).join(", ");
        return {
            error: `Notion data source is missing required column(s): ${quote(missing)}. Available columns: ${quote(presentHeadings)}.`,
        };
    }

    return { results: simplifyQueryResults({ results: allResults }, SLACK_USER_KEY_MAP) };
}
