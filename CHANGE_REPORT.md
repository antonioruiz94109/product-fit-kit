# Product Fit Kit — change report

Prepared 2026-11-06 for owner review. Nothing merged or deployed. GitHub Pages remains disabled. Stack & Drop was read only; its files and settings were not changed.

## Built

A buildless static product finder driven by site/config/data JSON, eight evidence states, brand chips, numeric min/max/range filters, choices, yes/no toggles, computed benchmarks, OR-within/AND-across matching, comparable-value counts, reset, shared URL state, sorting, expandable source quotes, date warnings, empty/error states and responsive styling. No product images, runtime dependencies, AI calls or API keys.

Included four category configs, ten men's shoe records across seven brands, empty luggage data, five guides, four tool-neutral prompts, validation and automated tests. GPS watches/e-bikes remain config-only. The standard-runner GitHub Action validates on PRs and pushes to main and does not deploy. The existing MIT license is preserved.

Approved changes to the brief: original-input arithmetic checks; brand-hosted dealer exception; deliberately altered verified fixtures; separate Not yet verified state; no Pages activation. The owner also approved current verified prices and documenting the missing dealer example.

## Evidence and source differences

The ten source IDs were checked in Stack & Drop commit `b1a8970482374f603529d24daa859610e6a69415`, shoes data blob `38df6adf152e3ab86d57d61f322a2408751bd6e2`. Every selected record was men's. The sample is labeled with the copy date and is not maintained. Individual manufacturer links and short exact quotes are in `categories/shoes-sample/data.json`.

- Nike Vomero 18: current selected-color sale price **$87.97**, replacing copied **$155**, as approved. The color/style context is retained in the note.
- HOKA Bondi 9: the page displays a **$140–$175** color-dependent range rather than a verified single offer. The copied $175 was not presented as a current exact price.
- Intended use retains verbatim manufacturer wording rather than the source site's normalized categories. This makes choices more granular, but avoids inventing evidence for a classification.
- Stack height is display-only text, retaining published heel/forefoot wording. The source explainer's prose is retained; its external “Learn more” navigation label is omitted.
- Listed shoe weights retain reference-size notes. Manufacturer-listed approximate weights are treated as Published representative specs, not performance estimates; the site cautions that differing reference sizes are not exact comparisons.

## Checked omissions: Not published

The accessed manufacturer product pages did not provide complete total heel/forefoot stack heights for **Nike Vaporfly 4, New Balance FuelCell Rebel v5, HOKA Bondi 9, and Brooks Ghost 18**. These four records show “Not published by [brand].” The New Balance note also explains ambiguous stack/drop footnote wording; no total heights were inferred.

## Unresolved evidence: Not yet verified

- **Altra Lone Peak 9:** intended use, drop, weight, stack and price. The manufacturer page could not be retrieved reliably. Copied values and search excerpts were not substituted for a checked page.
- **HOKA Bondi 9 price:** no exact selected offer was verified from the displayed price range.

These six records show “Not yet verified” and cannot satisfy filters or participate as valid sort values. Dates identify the verification attempt; notes explain the limitation.

## Missing dealer example

No qualifying men's dealer price was found in the source data. The brand-hosted Brooks dealer page for Ghost 18 listed an MSRP range and store locations, not a verified dealer offer. Per owner approval, the live sample contains **no dealer price**. Rendering and ordering are tested with an explicitly altered price_kind fixture; that fixture fails source validation and is never shipped as product evidence.

## Validation results

- **20 automated tests passed:** all four configs/data sets; required rejection fixtures (missing quote, non-brand source, quote mismatch, unknown state, missing calculation inputs, six filters); stale/conflicting warn-only behavior; OR/AND matching; missing/incompatible exclusions; dealer ordering; URL roundtrip; independent conversion and tamper rejection; invalid dates/choice/domain/unit handling; calendar age boundary; empty luggage; benchmark state restrictions; min/range bounds; malformed originals.
- **Browser checks passed in installed Chrome:** ten cards, every shoe filter, OR/AND, Reset all, shared link reopening, unavailable values sorted last, checked-omission/retrieval labels, measurement note and exclusion, dealer label fixture, conflicting field hidden, stale warning, and empty luggage with only site.json substituted.
- **375-pixel check passed:** document width 375 px, no horizontal overflow, every visible interactive control at least 32 px tall. No browser JavaScript errors. Desktop and mobile screenshots inspected.
- Publish check passed for all four categories without fetching pages. The browser tests used existing bundled tooling; no project dependency or build step was added.

The site and validator support dimension conversions and V × Ah calculations, but the sample supplies no real battery or luggage dataset. Browser tests exercise the empty luggage benchmark toggle; they do not establish airline fit or real-world measurement equivalence. Quote authenticity and source meaning still require human review. Prompts have not been model-tested; their “last tested with” fields remain for the owner.

## Implementation choices and remaining review

Numeric max/min controls are labeled “At most”/“At least” and include their boundary. Range band maxima are exclusive; minima inclusive. Dimension comparisons preserve declared L/W/D order without rotation. Benchmarks use only Published/Converted evidence. Unavailable numeric records retain the configured unit. Conversion rounding is explicit through decimals; calculated battery energy supports the named V × Ah operation only. Domain checks use HTTPS and hostname boundaries; dealer sources must be configured brand-hosted subdomains.

No product specs or quotes were guessed. The three example configs are design starting points, not researched category-fit findings. The luggage benchmark date records the configured dimensions, not an airline-policy check. Name search found no obvious exact-name collision other than the new repository.

Owner review should focus on the ten selected models, exact intended-use choices, approximate-weight treatment, unresolved evidence and the documented absence of a dealer sample. Merge and any later Pages activation remain separate owner decisions.
