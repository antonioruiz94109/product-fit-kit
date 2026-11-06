## Rules

- Use manufacturer pages only.
- Give a word-for-word quote for every value. Include the page’s exact label where one exists; do not copy a bare number without its label. Never invent a label.
- Never fill a gap from memory, reviews or retailers.
- Mark estimates as estimates.
- Say “Not published” only after checking the brand page and confirming it does not list the spec.
- Use “Not yet verified” if evidence cannot be retrieved or verified. Never confuse failed access with an omission.
- Exception: brand-hosted dealer pages listed in the config are allowed for price only. Label these Dealer price; never List price.

Last tested with: [model, date — owner to fill in]

# Draft criteria

Input: category name, reviewed fit-test result, docs/category-config.md and an included config file as the format reference. If the format reference is missing, request it rather than inventing a schema.

Draft one config.json object in the exact supplied format. Select 3–5 spec filters; automatic brand selection does not count. Every filter needs key, label, type, hint and edge_case, plus the type-specific unit/mode/values/bands or benchmark settings. Optional choice mappings must follow the supplied config format and explicitly identify themselves as editorial groupings; record values retain exact brand wording. Put non-comparable descriptive fields in display_fields. Include one explainer for the most easily misread measurement. Add only verified brand domains; leave brands empty if they have not been established. Price defaults to false.

State the measurement edge cases and why each filter is decisive. Do not invent product measurements, quotes, benchmark authority or checked dates. A user-defined size benchmark must be labeled as such, not as an airline or legal promise. Use the actual research date for checks. Keep any text-only field display-only.

Output: a brief rationale followed by the complete JSON object. Flag unresolved configuration choices for the owner.
