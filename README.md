# Product Fit Kit

An open-source template for a small product-filter site built from manufacturer evidence. Copy it for one product category, research with your own browsing-capable AI, and keep every spec beside a source URL and exact quote. The site is plain HTML, CSS and JavaScript: no framework, build step, hosted AI, API keys or product images.

## Quick start

**Use this template → run the fit-test prompt → edit the config → probe five products → publish after owner review.**

1. Create your own repository using **Use this template**.
2. Run [the fit-test prompt](prompts/fit-test.md), then review [the seven tests](docs/fit-test.md).
3. Draft your category with [the criteria prompt](prompts/criteria.md), following [the config guide](docs/category-config.md). Set the category folder and title in `site.json`.
4. Run [extraction](prompts/extraction.md) on five products. If a filter is missing for two, demote or drop it. Expand to roughly 15–30 models only after the probe passes.
5. [Verify independently](prompts/verify.md). Review and merge the changes before enabling GitHub Pages from **main / root**. This repository’s Pages remains disabled pending the owner’s approval.

For a local preview, run `python3 -m http.server 8000` and visit `http://localhost:8000`. Opening the HTML file directly will not reliably load JSON. Validation requires Node.js 22 or later, with no package installation:

```sh
node scripts/publish-check.js
node --test tests/core.test.js
```

The GitHub Action runs the same checks on pull requests and pushes to main. It does not deploy.

## Rules you can change

One copy, one category. Use 3–5 decisive, comparable filters. Keep manufacturer evidence with every value; approved brand-hosted dealer sources are allowed for price only. Never invent missing specs. Distinguish checked omissions from inaccessible evidence. Brand estimates and incompatible measurements stay visible but cannot satisfy filters. Re-check every six months. These are the kit’s defaults; owners can change the rules and are responsible for explaining those changes.

Read [the method](docs/method.md), [data rules](docs/data-rules.md) and [prompt guide](docs/prompts-guide.md). The checker validates records and arithmetic, not the truth of the sources. It never fetches web pages.

## Provided as-is

[MIT license](LICENSE), no warranty, no support. Issues are off. Each copy’s data is its owner’s responsibility. A passing check does not certify a product’s suitability, compatibility or safety.

## Category fit: first-pass calls, not tested

| Likely good fits | Likely poor fits |
| --- | --- |
| Sleeping bags; trail running vests; electric toothbrushes (watch SKU sprawl); wireless earbuds | T-shirts; mattresses; fragrance; robot vacuums; TVs; laptops; car seats; helmets |

## Included examples

- **Shoes:** ten men’s models across six brands; active by default. **Sample data copied from Stack & Drop on 2026-11-06. Not kept up to date.** Values were checked against current manufacturer pages; the [change report](CHANGE_REPORT.md) lists differences and unresolved evidence. Intended-use filters use the editorial groups Road daily / Road fast / Trail; cards retain exact manufacturer wording and labeled quotes. Below 768 px, open Filters (n) and choose Show X to return to results. No verified dealer offer was found; that requested example is documented as missing.
- **Luggage:** a curated 15-model US-market starter catalog across four brands, researched 2026-11-07. Filters cover weight, construction and wheel mechanism. Dimensions are display-only after the probe found unreliable comparisons. Read the [research report](categories/luggage/RESEARCH.md) for scope, sources and unresolved evidence. It is not comprehensive and makes no airline-fit promise.
- **GPS watches and e-bikes:** configs only. Add `data.json` before activating either. They are not populated research datasets.

Shoes remain the default. Switch the active category by editing only `site.json`. For luggage, use `"category": "luggage"` and choose your site title. Research output goes in the category’s data file; everyday filter definitions live in config. Test fixtures are intentionally damaged copies of verified shoe records, kept under `tests/` and never loaded by the site.

Inspired by [Stack & Drop](https://antonioruiz94109.github.io/stack-and-drop/).
