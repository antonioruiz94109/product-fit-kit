## Rules

- Use manufacturer pages only.
- Give a word-for-word quote for every value.
- Never fill a gap from memory, reviews or retailers.
- Mark estimates as estimates.
- Say “Not published” only after checking the brand page and confirming it does not list the spec.
- Use “Not yet verified” if evidence cannot be retrieved or verified. Never confuse failed access with an omission.
- Exception: brand-hosted dealer pages listed in the config are allowed for price only. Label these Dealer price; never List price.

Last tested with: [model, date — owner to fill in]

# Extract evidence

Input: approved config, product list, and docs/data-rules.md. Ask for a missing format reference instead of guessing.

Open each manufacturer product page. Build a JSON array with one object per product: id, brand, model, product_url, checked, fields. Record only the selected model/version. In fields, include every configured non-benchmark filter and display field, and price when enabled. Each record has value, unit where required, state, source_url, quote, checked, and note when needed. Benchmarks are computed by the site, never stored.

Use the eight states exactly as defined in the data rules. Dates must be actual ISO research dates. Use short verbatim evidence containing the value and enough context to establish it. Do not silently normalize a choice to words that the source does not use; flag mismatches for a config review. For yes/no use a Boolean value and exact evidence_value wording supporting it. Null unavailable values need an explanatory note and the checked/attempted source URL.

Conversions require original {value, unit} and decimals. Calculations require original [{value, unit}, …], the supported calculation name and decimals. Quote the original inputs and units; independently recompute the displayed result. Do not use unsupported arithmetic. Keep incompatible measurements as Measured differently with the method note; brand estimates never become Published numbers.

For price prefer an actual manufacturer US store offer. Use USD and price_kind manufacturer or dealer. A dealer locator’s MSRP range is not a dealer offer. Record any selected size/color and sale context in a note. Flag changed source values, access failures and omissions separately.

Output: a concise exceptions report, followed by the complete data.json array. For a five-product probe, also list every filter missing for at least two products and recommend demoting or dropping it. Never hide gaps to make the probe pass.
