# Working in Product Fit Kit

Product Fit Kit is a plain HTML, CSS and JavaScript template for one small product category, with manufacturer evidence kept beside each specification. Category configuration and data live in JSON; the publish check validates records and arithmetic without fetching pages.

## Rules

- Use manufacturer pages only.
- Give a word-for-word quote for every value. Include the page’s exact label where one exists; do not copy a bare number without its label. Never invent a label.
- Never fill a gap from memory, reviews or retailers.
- Mark estimates as estimates.
- Say “Not published” only after checking the brand page and confirming it does not list the spec.
- Use “Not yet verified” if evidence cannot be retrieved or verified. Never confuse failed access with an omission.
- Exception: brand-hosted dealer pages listed in the config are allowed for price only. Label these Dealer price; never List price.

## Owner gates

The owner decides whether to build, approves the category config, and reviews and merges the work. An agent never merges, never enables GitHub Pages, and never changes the active category without the owner.

Open a pull request. Run both checks. Never publish.

```sh
node scripts/publish-check.js
node --test tests/core.test.js
```

Read [the method](docs/method.md), [data rules](docs/data-rules.md), and [prompts/](prompts/).
