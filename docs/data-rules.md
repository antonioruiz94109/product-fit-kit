# Evidence records

`data.json` is an array. Each product has unique `id`, `brand`, `model`, manufacturer `product_url`, ISO `checked`, and `fields`. Under `fields`, include one record for each configured filter and display field, plus `price` when enabled. Do not store computed benchmarks.

Each record has `value`, `unit` for numeric/dimensions fields, `state`, `source_url`, exact `quote`, `source_label`, and ISO `checked`. Add `note` for context. Source URLs must use HTTPS and the product brand’s configured domains. Brand-hosted `dealer_domains` are permitted for price only. Product URLs must be manufacturer URLs.

| State | Behavior |
| --- | --- |
| Published | Shown; filtered and sorted. |
| Converted | Shown with inspectable original; filtered and sorted. |
| Calculated | Labeled “Calculated from published specs”; filtered and sorted. |
| Measured differently | Requires a measurement note; shown but excluded. |
| Brand estimate | Labeled; shown but excluded. |
| Not published | Null value, empty quote, required omission note. Use only after checking the page. Shown as “Not published by [brand]”. |
| Not yet verified | Null value, empty quote, required retrieval/verification note. Shown with this label; excluded. `checked` records the attempt. |
| Conflicting | Requires evidence like other valued records; hidden and warned about. |

For Converted, `original` is `{value, unit}` (a three-number value is supported for dimensions). For Calculated, `original` is an array of published `{value, unit}` inputs; the supported `calculation` is `volts_times_amp_hours` (one V and one Ah input, output Wh). Both states require integer `decimals` from 0–6. The validator recomputes and compares the rounded result. Supported conversions: mm/cm/in; g/kg/oz/lb; minutes/hours; Wh/kWh. Never introduce an arbitrary multiplier. Quotes must contain the original inputs and their units.

Choices must match configured strings, or an exact source phrase in the filter’s optional editorial mapping. Mapping affects filtering only; the stored value and quote remain manufacturer wording. Yes/no records use Boolean values and an `evidence_value` containing the exact source wording supporting the answer. This allows prose evidence without falsely quoting “true.” Number matching treats equivalent decimal formatting as equal but never matches 8 inside 18. Human review must still check meaning, unit and context.

Price uses unit `USD` and `price_kind` `manufacturer` or `dealer`. Prefer a manufacturer US offer. Dealer prices are explicitly labeled and sort after manufacturer prices. Brand estimates, incompatible measurements and missing values sort last; active filters exclude them. Benchmarks accept only Published or Converted source values.

Run `node scripts/publish-check.js`. It validates every category, schema, dates, allowed domains, required evidence, choices and arithmetic. Conflicts and records older than 12 calendar months warn without failing. It never fetches web pages or proves quotes authentic. Page fetching is reserved for a future opt-in feature, not implemented. Fixtures under `tests/` are never loaded by the site.

## Include the page’s label in each quote

When a page labels a value, copy the **label and value together**, preserving the wording, punctuation and line breaks. For example, if the source reads “Heel to Toe Drop:5 mm”, quoting just “5 mm” is insufficient. Never add a label the page does not contain. Keep the shortest excerpt that establishes both the field and the value; retain necessary size or mode context.

Every valued record declares `source_label`: the exact label appearing in the quote, or `null` if the page truly has none (such as an unlabeled store price). The checker requires a declared label to occur in the quote. It cannot determine whether a page has a label because it does not fetch pages; extraction and independent verification must check that. Missing-value records have no quote and do not require source_label. Converted/Calculated quotes must also retain the labels for the original measurement or inputs. The verification prompt checks label presence and meaning against the live page.

Benchmarks compare unrounded original measurements when a value is Converted; display rounding never turns an oversized product into a match. If the source state is unsuitable, the computed card field says “Cannot determine” and explains the source state. A conflicting source hides its benchmark as well as the underlying field. These are computed display behaviors, not additional data states.
