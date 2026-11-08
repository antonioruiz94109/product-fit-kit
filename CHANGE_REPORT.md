# Product Fit Kit — change report

Updated 2026-11-07. Built on the existing `build/product-fit-kit` review branch. **Merge remains on hold. GitHub Pages remains disabled.** Stack & Drop was read only and was not changed.

## Delivered

- Buildless HTML/CSS/JavaScript template driven by site/config/data JSON; no framework, runtime dependencies, hosted AI, keys or product images.
- Eight evidence states; configurable numeric min/max/range, choice, yes/no and benchmark behavior; automatic brand facet; OR-within/AND-across matching; comparable-value counts; reset, URL state and sorting.
- Exact manufacturer wording on cards with source URLs, labeled quotes, qualifier quotes and links, dates and state notes. Optional choice mappings explicitly identify editorial groupings.
- Below 768 px, Filters (n) reveals controls and Show X returns to results. Keyboard focus, Escape and resizing are handled. Every visible control meets the 32 px minimum.
- Five guides, four tool-neutral prompts, MIT license, source/arithmetic validation, deliberately altered fixtures and a non-deploying GitHub Action.
- **Shoes remain the default:** ten men's models across six brands. Intended-use choices are Road daily / Road fast / Trail; cards preserve brand wording. Verified Topo MTN Racer 4 replaced Altra Lone Peak 9.
- **Luggage is now populated:** 15 curated US-market models across four brands, independently checked against manufacturer sources. GPS watches and e-bikes remain config-only.

## Luggage research and the probe decision

The owner expanded scope to both the full template and populated luggage while retaining shoes as the default. The catalog includes hard/soft construction and spinner/two-wheel mechanisms, without splitting colors into products or tracking prices. It is a manageable starter selection, not evidence of comprehensive market coverage or slow refresh cycles.

Two of the original five probe products lacked trustworthy overall dimensions: Away's own statements conflict, and Samsonite's wheel/handle measurement definition was not established. Following the method's rule, **the size-fit benchmark was removed from luggage**. Its three filters are listed empty weight, construction and wheel mechanism. Dimensions remain display-only in H × W × D order; no airline acceptance claim is made. Generic benchmark support remains available in the template.

Independent review found one conflicting weight in the original five-product probe, below the threshold for dropping that filter. It also found a cross-page dimension discrepancy for another Away model. All findings were incorporated before final checks.

See [the research report](categories/luggage/RESEARCH.md), [field-by-field independent verification](categories/luggage/verification.json), and [source records](categories/luggage/data.json).

| Luggage evidence state | Count | Treatment |
| --- | --- | --- |
| Published | 53 | Shown; eligible filters use comparable values. |
| Conflicting | 4 | Hidden and reported as warnings by the check. |
| Not yet verified | 3 | Shown with the label and excluded from matching. |
| Not published | 0 | No retrieved omission was represented as a missing measurement definition. |

Conflicts: Away The Carry-On dimensions and weight, Away The Bigger Carry-On dimensions, and Travelpro Maxlite Air V2 weight. Unverified fields: overall dimensions for Samsonite Freeform, Outline Pro and UpLIFT Hardside. Manufacturer UK pages corroborate wheels/handles for matching Briggs & Riley SKUs; Global Spinner's match is an available US Olive variant rather than the default selected color. The research report explains this limitation. No values were guessed to close gaps.

## Shoe sample evidence and approved exceptions

The ten men's source records came from Stack & Drop commit `b1a8970482374f603529d24daa859610e6a69415`, data blob `38df6adf152e3ab86d57d61f322a2408751bd6e2`, and were checked on 2026-11-06. The site and README identify this dated sample as not maintained.

- **Checked omissions / Not published:** complete stack heights for Nike Vaporfly 4, New Balance FuelCell Rebel v5, HOKA Bondi 9 and Brooks Ghost 18.
- **Unresolved / Not yet verified:** HOKA Bondi 9's exact selected-offer price, because a color-dependent range did not establish one current offer.
- **Approved difference:** Nike Vomero 18 uses the verified selected-color sale price instead of the copied price; the evidence and context remain in its record.
- **Approved missing example:** no eligible dealer offer was found. Dealer labels and ordering are exercised with an explicitly altered fixture that fails source validation; no invented dealer price appears in the sample.
- Approximate listed shoe weights remain Published representative specs, with reference-size notes. They are not presented as exact comparisons across shoe sizes. Stack remains display-only, with the copied explanatory prose.

## Completion audit fixes

- Malformed range settings produce clear field errors instead of crashing validation.
- Text evidence must contain the value with matching case; numeric formatting equivalence is still supported.
- Converted source units must occur as unit tokens: the letter “g” inside “Weight” no longer counts as gram evidence.
- Benchmark comparisons use unrounded converted originals, preventing rounded-down displays from creating false fits.
- Unsuitable benchmark sources show “Cannot determine” with a reason; conflicting sources hide the derived benchmark too. These are computed behaviors, not extra data states.
- Dimension axis labels are configurable; luggage uses H/W/D. Empty-data handling remains supported and tested independently of the now-populated luggage example.

## Verification results

**35 automated tests passed.** All four category configs/data sets pass the publish check; four expected luggage conflict warnings do not fail it. Tests cover required failing fixtures, warn-only records, mappings and legacy links, source labels, domain/date/unit checks, conversions, battery arithmetic, dimensions, unrounded benchmarks, malformed configs, filters, sorting and populated luggage. The actual command-line checker was tested for failure/pass exit codes with each required fixture.

**Browser checks passed in installed Chrome.** Default shoes, populated luggage, editorial/raw wording, labeled quotes, numeric and choice filters, OR/AND, shared links, hidden conflicts, unverified values, unavailable sort order, mobile counts/Show/focus/Escape, and the empty state were checked. Altered fixtures exercised dealer labels, incompatible measurements and stale warnings. At 375, 767, 768 and 1440 px there was no horizontal overflow or visible control below 32 px, and no JavaScript errors. Desktop/mobile screenshots were inspected. Category switching required only site settings, not application code.

The existing bundled browser tooling was used; no dependency or build step was added to the project. Automated validation never fetches source pages. AI-assisted independent verification checked manufacturer pages, not physical products. The fit-test prompt was exercised in this chat; the remaining prompt files have not undergone separate end-to-end model trials. Owner-maintained “last tested with” lines remain unfilled rather than inventing results.

## Review boundaries

The complete template and researched luggage starter catalog are ready for review, with the evidence limits above. Market representativeness, refresh frequency, actual airline acceptance and physical measurement equivalence are not certified. The owner decides whether and when to merge and, separately, enable Pages. No change in this branch deploys the site.

## Qualifier-evidence revision — 2026-11-07

Added optional paired `qualifier_quote` and `qualifier_url` record fields. Luggage size explicitly sets `qualifier_required: true` in config, keeping the validator category-independent. All 12 valued size records, including hidden Conflicting records, now have verbatim evidence for wheels/handles inclusion. Travelpro uses its explicit dimension label; Away uses its measurement-inclusion sentence; Briggs & Riley uses the previously verified matching-model UK manufacturer pages. Their assertions/URLs were removed from qualifier notes and placed in the dedicated fields; notes retain expansion, variant and conflict context. `briggs-riley.co.uk` remains explicitly allowed for Briggs & Riley.

The checker rejects missing or empty required qualifier evidence, incomplete optional pairs, insecure URLs, another brand’s source, and hostname lookalikes. Three null Not yet verified size records may omit the pair because no qualified measurement is asserted; no evidence was invented. Any supplied pair is still checked. As with numeric quotes, the checker does not fetch pages or certify that a quote supports a qualifier; the source review supplies that judgment.

Cards show the qualifier quote and a separate source link inside their existing source details. Extraction/verification prompts and schema/config guides explain the rule. README now explicitly identifies removal of the luggage size-fit filter as an example of the method rejecting a filter the data cannot support.

All four category checks and 35 automated tests pass, with the same four expected conflict warnings. Full browser regression for both categories passed, including the new Away qualifier quote and Briggs UK link, mobile layouts, filters, shared links, empty data and evidence-state handling. No merge or Pages activation was performed.
