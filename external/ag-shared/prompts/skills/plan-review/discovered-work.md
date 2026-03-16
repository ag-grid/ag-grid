# Discovered Work Protocol

Sub-agents executing review tasks may discover work outside their immediate scope.
This protocol ensures discovered work is captured without derailing focused review.

## When to Create a Task

Create a task using `TaskCreate` when you discover something:

-   **Significant**: Could affect plan success or requires dedicated investigation
-   **Out of scope**: Not part of your current review focus area
-   **Actionable**: Clear enough that another agent could pick it up

Do NOT create tasks for:

-   Minor observations (include in your findings instead)
-   Things you can quickly address within your scope
-   Vague concerns without actionable next steps

## How to Create a Task

Use `TaskCreate` with:

| Field         | Content                                                                        |
| ------------- | ------------------------------------------------------------------------------ |
| `subject`     | `[Category] Brief description` (e.g., "[Edge Case] Handle null input in parser") |
| `description` | What you discovered, why it matters, suggested approach                        |
| `activeForm`  | Present tense action (e.g., "Investigating null handling")                     |

## After Creating a Task

1. Note in your findings that you created a follow-up task
2. Continue with your focused review - don't investigate further
3. The orchestrating agent will triage discovered tasks

## Example

**Scenario**: You're the Technical Reviewer, focused on API correctness.
You notice a missing edge case (a Completeness concern).

**Action**:

```javascript
TaskCreate({
    subject: '[Completeness] Missing validation for empty array input',
    description:
        'While reviewing the parser API, I noticed there is no validation for empty array inputs. This could cause undefined behavior in the aggregation step. The Completeness review should verify this edge case is covered.',
    activeForm: 'Investigating empty array validation',
});
```

**Then**: Continue your Technical Review without investigating the completeness issue.

---

## Include in Sub-Agent Prompts

When launching review sub-agents, include this snippet in their prompt:

```markdown
## Discovered Work Protocol
If you discover significant issues OUTSIDE your focus area:
- Use TaskCreate to propose a follow-up task
- Include category, description, and suggested approach
- Continue with your focused review - don't investigate further
- Only create tasks for significant discoveries, not minor observations
```
