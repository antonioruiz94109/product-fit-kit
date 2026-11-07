# Write the category config

Copy `categories/luggage/config.json` as your worked example. It includes a researched starter catalog and configured manufacturer domains. For a new category, start with empty data and add each verified brand as `{ "name": "…", "domains": ["…"] }`, replacing the ellipses with its real name and verified hostname. Never use placeholders as product evidence. Optional `dealer_domains` belong to that brand and must be brand-hosted subdomains; they are allowed only for price.

Set `name`, the buyer `question`, `explainer` (`title` and `text`), and optional `notes`. `price` defaults to false. Optional `notice` appears above the filters.

Use **3–5 entries in `filters`**, including any benchmark. Each has a unique `key`, `label`, `type`, `hint` (shown to buyers), and `edge_case` (research instructions, not site copy). Brand is automatic and does not count.

| Type | Additional settings |
| --- | --- |
| `number` | `unit`; `mode`: `max`, `min`, or `range`. Range needs `bands`, each with unique `id`, `label`, and `min` and/or `max`. Lower bounds are inclusive; upper bounds exclusive. |
| `choice` | `values`: allowed filter choices. Optional editorial mapping preserves different source wording (see below). |
| `yes_no` | No additional settings. The control means “require yes.” |
| `benchmark` | `source`: a declared number/dimensions key; `checked`; either `limits` in L/W/D order, or numeric `limit` and `mode` (`min`/`max`). |

`display_fields` support `number`, `choice`, `yes_no`, `dimensions` (three ordered values plus `unit`; optional `axes` labels such as H/W/D, default L/W/D), and `text`. They are shown but never filtered or sorted. Stack height uses text because a heel/forefoot pair is not three-dimensional size.

Luggage uses three filters: listed empty weight, construction and wheel mechanism. Construction and wheel choices use explicit editorial mappings. Overall dimensions are display-only: the five-product probe found two conflicting or unverified measurements, so the proposed size benchmark was removed under the method’s rule. See the category’s RESEARCH.md for the evidence. Generic benchmarks remain supported: name a number/dimensions source and define the threshold in its unit and axis order. Only Published or Converted source values are eligible; converted comparisons use unrounded originals. A benchmark date records the rule review, not airline research.

For an empty category, keep a `data.json` containing `[]` until research is ready. The supplied luggage file is now populated. Set `site.json`’s `category` to the folder name and update its `title`; no code changes are needed. GPS watches and e-bikes are config-only: create their empty data file before activating either.

## Included measurement rules

| Category / field | Edge-case rule |
| --- | --- |
| Shoes / intended use | Retain exact manufacturer wording on cards; use only the explicit editorial mapping for filters. |
| Shoes / drop | Use published drop, not subtraction of uncertain stack values. |
| Shoes / weight | Keep reference size; different sizes are not exact comparisons. |
| Shoes / stack | Retain method and wording; do not infer missing total heights. |
| Luggage / size | Confirm unexpanded H/W/D includes wheels and handles; unknown definitions stay Not yet verified, contradictions stay Conflicting. Display-only. |
| Luggage / weight | Use empty, not packed weight. |
| Luggage / construction | Preserve manufacturer material/type wording; map Hard/Soft editorially. |
| Luggage / wheels | Group Spinner/Two-wheel mechanisms editorially; do not confuse tires and assemblies. |
| Watches / battery | Retain the named GPS mode; estimated runtime stays Brand estimate. |
| Watches / GNSS | Multiple systems do not establish multi-band reception. |
| Watches / weight | State strap inclusion; incompatible measurements are excluded. |
| Watches / maps | Breadcrumb navigation is not offline mapping. |
| E-bikes / class | Use the brand’s stated class; do not infer it. |
| E-bikes / battery | Calculate only from published V and Ah inputs. |
| E-bikes / weight | State battery inclusion; incompatible measurements are excluded. |
| E-bikes / motor | Use an explicit location description; do not infer from watts. |
| E-bikes / range | Brand estimate only; retain stated conditions. |

## Editorial grouping for choice filters

A choice filter can define `mapping` with `kind: "editorial"`, `label: "Editorial grouping"`, and `values`: an object mapping each exact manufacturer phrase to one or more entries in the filter’s `values` list. This grouping is an editorial decision, not a specification published by the brand.

The shoe config’s filter choices are **Road daily / Road fast / Trail**. Its mapping sends “Daily Running, Walking” to Road daily, “Tempo Runs, Race” to Road fast, and “Trail Running, Hiking” to Trail. “Everyday Running, Quick Runs” belongs to both Road daily and Road fast. These are decisions about verified wording; review them when adding a phrase.

Keep each record’s `value` and quote exactly as published. Cards show that wording and separately identify its editorial group; only filtering uses the mapping. An unmapped source phrase fails validation. Without a mapping, a choice behaves as before: its raw value must belong to the allowed list. Multiple groups still match with OR, and other filters combine with AND. Older shared links using recognized raw phrases resolve through the mapping.

Under 768 px, Filters (n) counts active filter categories, including brand—not the number of selected chips. Filters start collapsed so products appear first. Changes update results and the Show X count immediately; Show X closes the controls and moves focus to results. Escape closes the controls and returns focus to the Filters button.
