## Rules

- Use manufacturer pages only.
- Give a word-for-word quote for every value. Include the page’s exact label where one exists; do not copy a bare number without its label. Never invent a label.
- Never fill a gap from memory, reviews or retailers.
- Mark estimates as estimates.
- Say “Not published” only after checking the brand page and confirming it does not list the spec.
- Use “Not yet verified” if evidence cannot be retrieved or verified. Never confuse failed access with an omission.
- Exception: brand-hosted dealer pages listed in the config are allowed for price only. Label these Dealer price; never List price.

Last tested with: Used during the luggage build inside the project chat, 2026-11-07; not yet tested by a fresh user.

# Verify independently

Input: records, their config and docs/data-rules.md. Perform this in a fresh conversation or with a different AI from extraction.

Open every cited source independently. Check exact model/version, brand domain, quote including the page’s label, source_label, measurement method, units, choice mapping, selected price context and check date. Recompute Converted and Calculated records using their original published inputs, supported unit conversions and declared rounding. Check that source_label is null only if no label exists. For mapped choices, confirm that value and quote retain the brand’s wording, and separately review the config’s editorial grouping; do not call an editorial group a manufacturer claim. Confirm that Not published reflects a checked omission, not failed access. Do not fetch retailer evidence except the explicitly allowed brand-hosted dealer price exception.

Output one row per product/field: confirmed, conflicting or not found; reason; source URL; and a short exact excerpt when available. Clearly distinguish a missing spec from an inaccessible page. Never correct a value by guessing, infer a price from a range, or replace a measurement with a remembered value. Propose any verified correction separately for owner review; do not silently rewrite the records. This report is not data.json.

For every qualifier_quote/qualifier_url pair, open the qualifier source and check that the exact quote supports the field label for this model/variant. Check the brand’s allowed domains. Fields with qualifier_required: true need this evidence for every valued record, including Conflicting records; null unavailable records may omit it. Do not accept an assertion in a note as qualifier evidence.
