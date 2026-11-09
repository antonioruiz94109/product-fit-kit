## Rules

- Use manufacturer pages only.
- Give a word-for-word quote for every value. Include the page’s exact label where one exists; do not copy a bare number without its label. Never invent a label.
- Never fill a gap from memory, reviews or retailers.
- Mark estimates as estimates.
- Say “Not published” only after checking the brand page and confirming it does not list the spec.
- Use “Not yet verified” if evidence cannot be retrieved or verified. Never confuse failed access with an omission.
- Exception: brand-hosted dealer pages listed in the config are allowed for price only. Label these Dealer price; never List price.

Last tested with: GPT-6-based Codex, 2026-11-08, fresh chat outside this project, category: carry-on luggage (tested before the wording changes below).

# Fit test

Input: a category name.

Assess these seven tests, scoring tests 1–4 and 7 as pass, partial or fail and giving observations for tests 5 and 6: (1) Published on the manufacturer’s own page; (2) Objective number/unit/yes-no; (3) Comparable measurement methods; (4) Decisive for narrowing choices; (5) Bounded market of roughly 15–30 models; (6) Slow churn, annual refresh or slower; (7) Low risk if a spec is wrong.

Tests 5 (bounded) and 6 (slow churn) are owner scoping decisions, not evidence tests. For each, the model gives an observation; the owner sets the roster and accepts the refresh pace. Do not ask for dated launch evidence.

Open 3–5 manufacturer pages. Provide their URLs and brief exact evidence excerpts, distinguishing verified facts from judgments. Explain any taste-driven choices, proprietary measurement methods, SKU sprawl, safety-critical consequences or price dependence. Any fail on tests 1–3 means recommend not building. State what a partial would need to become a pass. Do not claim the supplied example categories have already passed.

Outcomes: Proceed = build. Research = run the 5-product probe (method step 5 in docs/method.md) on every field scored partial, then decide. Stop = any fail on tests 1–3.

Output: seven-row score table (observations for tests 5 and 6), source evidence and a justified proceed/research/stop recommendation.
