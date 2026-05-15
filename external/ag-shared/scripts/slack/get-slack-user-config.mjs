

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
 * Extracts mailto: addresses from a Notion rich_text property, ignoring any
 * separator/plain segments. Returns an array of bare email addresses.
 */
function extractEmailsFromRichText(prop) {
  return prop.rich_text
    .map((t) => t.text?.link?.url ?? t.href ?? null)
    .filter((url) => typeof url === "string" && url.startsWith("mailto:"))
    .map((url) => url.slice("mailto:".length));
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
    const response = await fetch(queryUrl, {
        method: "post",
        headers: {
            "Authorization": `Bearer ${notionApiToken}`,
            "Notion-Version": notionApiVersion
        }
    })
    const data = await response.json();
    const results = simplifyQueryResults(data, {
        "Slack ID": "slackId",
        "Full Name": "fullName",
        "Github": "github",
        "Staging notification": "stagingNotification",
        "Emails": { key: "emails", extract: extractEmailsFromRichText },
    });

    return results;
}
