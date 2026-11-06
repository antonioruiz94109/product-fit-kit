# Deliberately altered evidence

All product fixtures copy the verified men's Topo Athletic Phantom 4 record from the sample, then change/remove one field. Quotes, measurements and prices are not invented. `six-filters.json` duplicates the three existing filter definitions. `stale.json` changes only a date to 13 months before the fixed test date, 2026-11-06. These are negative/behavior fixtures, never product research or site data.

`dealer-label.json` changes only price_kind to test rendering and sorting. It is **not** a verified dealer price, has no eligible dealer source, and must fail source validation. `measured-differently.json` and `conflicting.json` deliberately alter the evidence state to exercise behavior; they do not assert real defects or conflicts in the published shoe specs. `calculated-no-inputs.json` changes only the state to exercise missing-input failure.
