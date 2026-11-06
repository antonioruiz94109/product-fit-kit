# Write the category config

Copy `categories/luggage/config.json` as your worked example. It is valid with an empty `brands` list because its data is empty. Before extraction, add each brand as `{ "name": "…", "domains": ["…"] }`, replacing the ellipses with its real name and verified hostname. Never use placeholders as product evidence. Optional `dealer_domains` belong to that brand and must be brand-hosted subdomains; they are allowed only for price.

Set `name`, the buyer `question`, `explainer` (`title` and `text`), and optional `notes`. `price` defaults to false. Optional `notice` appears above the filters.

Use **3–5 entries in `filters`**, including any benchmark. Each has a unique `key`, `label`, `type`, `hint` (shown to buyers), and `edge_case` (research instructions, not site copy). Brand is automatic and does not count.

| Type | Additional settings |
| --- | --- |
| `number` | `unit`; `mode`: `max`, `min`, or `range`. Range needs `bands`, each with unique `id`, `label`, and `min` and/or `max`. Lower bounds are inclusive; upper bounds exclusive. |
| `choice` | `values`: allowed strings, exactly as represented in evidence. |
| `yes_no` | No additional settings. The control means “require yes.” |
| `benchmark` | `source`: a declared number/dimensions key; `checked`; either `limits` in L/W/D order, or numeric `limit` and `mode` (`min`/`max`). |

`display_fields` support `number`, `choice`, `yes_no`, `dimensions` (three L/W/D values plus `unit`), and `text`. They are shown but never filtered or sorted. Stack height uses text because a heel/forefoot pair is not three-dimensional size.

In luggage, `fits` compares the `size` field against 22 × 14 × 9 inches. It accepts only Published or Converted evidence, with no rotation, compression or airline-policy claim. Body-only size must be Measured differently. The other filters are empty weight, shell and wheels. The benchmark date records this configured size check, not airline research.

Keep a `data.json` containing `[]` until research is ready. Set `site.json`’s `category` to the folder name and update its `title`; no code changes are needed. GPS watches and e-bikes are config-only: create their empty data file before activating either.

## Included measurement rules

| Category / field | Edge-case rule |
| --- | --- |
| Shoes / intended use | Retain exact manufacturer wording; do not infer categories. |
| Shoes / drop | Use published drop, not subtraction of uncertain stack values. |
| Shoes / weight | Keep reference size; different sizes are not exact comparisons. |
| Shoes / stack | Retain method and wording; do not infer missing total heights. |
| Luggage / size and fit | Include wheels and handles in L/W/D order; exclude body-only sizes from the benchmark. |
| Luggage / weight | Use empty, not packed weight. |
| Luggage / shell | Use explicit hard/soft classification. |
| Luggage / wheels | Count assemblies, not individual tires. |
| Watches / battery | Retain the named GPS mode; estimated runtime stays Brand estimate. |
| Watches / GNSS | Multiple systems do not establish multi-band reception. |
| Watches / weight | State strap inclusion; incompatible measurements are excluded. |
| Watches / maps | Breadcrumb navigation is not offline mapping. |
| E-bikes / class | Use the brand’s stated class; do not infer it. |
| E-bikes / battery | Calculate only from published V and Ah inputs. |
| E-bikes / weight | State battery inclusion; incompatible measurements are excluded. |
| E-bikes / motor | Use an explicit location description; do not infer from watts. |
| E-bikes / range | Brand estimate only; retain stated conditions. |
