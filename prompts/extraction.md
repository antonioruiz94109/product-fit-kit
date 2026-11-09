## Rules

- Use manufacturer pages only.
- Give a word-for-word quote for every value. Include the page’s exact label where one exists; do not copy a bare number without its label. Never invent a label.
- Never fill a gap from memory, reviews or retailers.
- Mark estimates as estimates.
- Say “Not published” only after checking the brand page and confirming it does not list the spec.
- Use “Not yet verified” if evidence cannot be retrieved or verified. Never confuse failed access with an omission.
- Exception: brand-hosted dealer pages listed in the config are allowed for price only. Label these Dealer price; never List price.

Last tested with: Used during the luggage build inside the project chat, 2026-11-07; not yet tested by a fresh user.

# Extract evidence

Input: approved config, product list, and docs/data-rules.md. Ask for a missing format reference instead of guessing.

Open each manufacturer product page. Build a JSON array with one object per product: id, brand, model, product_url, checked, fields. Record only the selected model/version. In fields, include every configured non-benchmark filter and display field, and price when enabled. Each record has value, unit where required, state, source_url, quote, source_label, checked, and note when needed. Benchmarks are computed by the site, never stored.

Use the eight states exactly as defined in the data rules. Dates must be actual ISO research dates. Use short verbatim evidence containing both the value and its page label when present. Preserve the page’s wording, capitalization and punctuation; retain line breaks between labels and values. Set source_label to that exact label, or null only when the page has no label. Do not invent “Price” beside an unlabeled price. For a mapped choice, keep the exact manufacturer wording in value and quote; the config’s explicitly labeled editorial mapping determines filter groups. Flag any wording absent from the mapping for owner review. For yes/no use a Boolean value and exact evidence_value wording supporting it. Null unavailable values need an explanatory note and the checked/attempted source URL.

Conversions require original {value, unit} and decimals. Calculations require original [{value, unit}, …], the supported calculation name and decimals. Quote the original inputs and units; independently recompute the displayed result. Do not use unsupported arithmetic. Keep incompatible measurements as Measured differently with the method note; brand estimates never become Published numbers.

For price prefer an actual manufacturer US store offer. Use USD and price_kind manufacturer or dealer. A dealer locator’s MSRP range is not a dealer offer. Record any selected size/color and sale context in a note. Flag changed source values, access failures and omissions separately.

Output: a concise exceptions report, followed by the complete data.json array. For a five-product probe, also list every filter missing for at least two products and recommend demoting or dropping it. Never hide gaps to make the probe pass.

If a field has qualifier_required: true, every valued record must also include qualifier_quote and qualifier_url: verbatim manufacturer evidence for the qualifier in the field label (such as wheels and handles being included). A separate manufacturer page is allowed if it applies to the same model/variant and its domain is allowed for that brand. Never infer the qualifier from the numeric quote or leave it only in a note. If the qualifier cannot be verified, use Not yet verified with a null value and an explanation; do not invent qualifier evidence. Optional qualifier evidence on other fields must also include both fields.
