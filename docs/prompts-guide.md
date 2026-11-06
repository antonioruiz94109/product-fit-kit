# Use the research prompts

Use any AI that can browse manufacturer pages. Each prompt’s “last tested with” line is left for the owner to fill in after an actual test; no model test is claimed here.

1. **Fit test:** supply the category name. Review all seven scores and open its 3–5 evidence pages.
2. **Criteria:** supply the category and reviewed fit result, plus `docs/category-config.md` and the luggage config as the exact format reference. Review the draft config yourself.
3. **Extraction:** supply that config, `docs/data-rules.md`, and your product list. Start with five products. Request only the complete JSON array after any research notes.
4. **Verify:** use a fresh conversation or a different AI. Supply the config, data rules and records. It must report confirmed, conflicting or not found per record, with reasons. You decide how to resolve changes.

Copy the JSON array, without Markdown fences or commentary, into your category’s `data.json`. Keep previous verified records unless deliberately replacing them. Do not paste verification reports into the data file. `Not published` is a checked omission; failed access is `Not yet verified`.

Run `node scripts/publish-check.js` and `node --test tests/core.test.js`, then inspect the site locally with `python3 -m http.server 8000`. Open `http://localhost:8000`; opening the HTML file directly cannot reliably load JSON. Share the proposed changes through a pull request. A passing check is not permission to publish: the owner must review and merge.
