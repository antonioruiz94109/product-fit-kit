/* All category-specific behavior comes from JSON. */
"use strict";
(async function () {
  const K = window.FitKit,
    $ = (id) => document.getElementById(id);
  const make = (tag, text, className) => {
    const e = document.createElement(tag);
    if (text != null) e.textContent = text;
    if (className) e.className = className;
    return e;
  };
  const get = async (url) => {
    const r = await fetch(url);
    if (!r.ok) throw Error(`Could not load ${url} (${r.status}).`);
    return r.json();
  };
  const safeLink = (url, text) => {
    const a = make("a", text);
    try {
      if (new URL(url).protocol === "https:") a.href = url;
    } catch {}
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  };
  try {
    const site = await get("site.json");
    if (!/^[a-z0-9-]+$/.test(site.category))
      throw Error("The active category folder is invalid.");
    const [config, products] = await Promise.all([
      get(`categories/${site.category}/config.json`),
      get(`categories/${site.category}/data.json`),
    ]);
    if (
      !Array.isArray(products) ||
      !Array.isArray(config.filters) ||
      !Array.isArray(config.brands)
    )
      throw Error(
        "The category files have an invalid format. Run the publish check.",
      );
    document.title = site.name;
    $("site-name").textContent = site.name;
    $("home-link").setAttribute("aria-label", `${site.name} home`);
    $("heading").textContent = config.name;
    $("question").textContent = config.question;
    if (config.notice) {
      $("notice").hidden = false;
      $("notice").textContent = config.notice;
    }
    if (config.notes) {
      $("category-notes").hidden = false;
      $("category-notes").textContent = config.notes;
    }
    if (config.explainer) {
      $("explainer").hidden = false;
      $("explainer-title").textContent = config.explainer.title;
      $("explainer-text").textContent = config.explainer.text;
    }
    let selection = K.readSelection(location.search, config);
    const sortFields = [
      ...config.filters.filter((f) => ["number", "choice"].includes(f.type)),
      ...(config.price ? [{ key: "price", label: "Price" }] : []),
    ];
    for (const f of sortFields) {
      const o = make("option", f.label.replace("[brand]", "brand"));
      o.value = f.key;
      $("sort").append(o);
    }
    const initialSort = new URLSearchParams(location.search).get("sort");
    $("sort").value = sortFields.some((f) => f.key === initialSort)
      ? initialSort
      : "model";
    const counts = [];
    const mobile = window.matchMedia("(max-width: 767px)");
    let filtersOpen = false;
    function setFilterPanel(open, returnFocus = false) {
      filtersOpen = open;
      $("filter-panel").hidden = mobile.matches && !filtersOpen;
      $("filter-toggle").setAttribute(
        "aria-expanded",
        String(mobile.matches && filtersOpen),
      );
      if (returnFocus && mobile.matches) $("filter-toggle").focus();
    }
    $("filter-toggle").addEventListener("click", () =>
      setFilterPanel(!filtersOpen),
    );
    $("show-results").addEventListener("click", () => {
      setFilterPanel(false);
      $("results").focus();
      $("results").scrollIntoView({ block: "start" });
    });
    $("filter-panel").addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobile.matches) {
        event.preventDefault();
        setFilterPanel(false, true);
      }
    });
    mobile.addEventListener("change", () => setFilterPanel(false));
    setFilterPanel(false);
    function updateURL() {
      const q = K.writeSelection(
        selection,
        $("sort").value === "model" ? "" : $("sort").value,
      );
      history.replaceState(
        null,
        "",
        location.pathname + (q ? "?" + q : "") + location.hash,
      );
    }
    function changed(key, values) {
      if (values.length) selection[key] = values;
      else delete selection[key];
      updateURL();
      renderResults();
    }
    function renderFilters() {
      $("filters").replaceChildren();
      counts.length = 0;
      const fs = [
        {
          key: "brand",
          label: "Brand",
          type: "choice",
          hint: "Choose one or more brands.",
          values: config.brands.map((b) => b.name),
        },
        ...config.filters,
      ];
      for (const f of fs) {
        const group = make("fieldset", null, "filter-group");
        group.append(
          make("legend", f.label.replace("[brand]", "brand")),
          make("p", f.hint, "hint"),
        );
        if (
          f.type === "choice" ||
          (f.type === "number" && f.mode === "range")
        ) {
          const choices =
            f.type === "choice"
              ? f.values.map((v) => ({ id: v, label: v }))
              : f.bands;
          const chips = make("div", null, "chips");
          for (const choice of choices) {
            const b = make("button", null, "chip");
            b.type = "button";
            b.setAttribute(
              "aria-pressed",
              String((selection[f.key] || []).includes(choice.id)),
            );
            b.append(make("span", choice.label));
            const count = make("span", null, "count");
            b.append(count);
            counts.push({ node: count, f, choice: choice.id });
            b.addEventListener("click", () => {
              const vs = new Set(selection[f.key] || []);
              vs.has(choice.id) ? vs.delete(choice.id) : vs.add(choice.id);
              changed(f.key, [...vs]);
              b.setAttribute("aria-pressed", String(vs.has(choice.id)));
            });
            chips.append(b);
          }
          group.append(chips);
        } else if (["yes_no", "benchmark"].includes(f.type)) {
          const label = make("label", null, "toggle"),
            input = make("input");
          input.type = "checkbox";
          input.checked = !!selection[f.key]?.length;
          input.addEventListener("change", () =>
            changed(f.key, input.checked ? ["yes"] : []),
          );
          label.append(input, make("span", "Require this"));
          group.append(label);
          if (f.type === "benchmark")
            group.append(
              make("span", `Benchmark checked ${f.checked}`, "available"),
            );
        } else if (f.type === "number") {
          const label = make("label", null, "numeric");
          label.append(make("span", f.mode === "max" ? "At most" : "At least"));
          const input = make("input");
          input.type = "number";
          input.step = "any";
          input.placeholder = "Any";
          input.value = selection[f.key]?.[0] || "";
          input.setAttribute(
            "aria-label",
            `${f.label}: ${f.mode === "max" ? "maximum" : "minimum"} ${f.unit}`,
          );
          input.addEventListener("input", () =>
            changed(
              f.key,
              input.value !== "" && Number.isFinite(Number(input.value))
                ? [input.value]
                : [],
            ),
          );
          label.append(input, make("span", f.unit));
          group.append(label);
        }
        if (f.key !== "brand") {
          const available = make("span", null, "available");
          counts.push({ node: available, f });
          group.append(available);
        }
        $("filters").append(group);
      }
    }
    function card(p) {
      const article = make("article", null, "card");
      article.dataset.productId = p.id;
      const header = make("div", null, "card-header");
      const identity = make("div", null, "card-identity");
      identity.append(make("p", p.brand, "brand"), make("h3", p.model));
      header.append(identity);
      const dl = make("dl", null, "specs");
      const mappedChoices = [];
      const sources = make("details", null, "evidence");
      const definitions = [
        ...config.filters,
        ...(config.display_fields || []),
        ...(config.price ? [{ key: "price", label: "Price", type: "number" }] : []),
      ];
      const fields = definitions.map((f) => ({ f, view: K.present(p, f) }))
        .filter(({ view }) => view);
      sources.append(make("summary", `Sources & exact quotes (${fields.length})`));
      for (const { f, view } of fields) {
        const value = make("span", view.value, "spec-value");
        if (view.stateLabel) value.append(make("span", view.stateLabel, "state"));
        if (view.dealer) value.append(make("span", "Dealer price", "dealer-tag"));
        if (f.key === "price") {
          const price = make("div", null, "card-price");
          price.dataset.field = f.key;
          price.setAttribute("aria-label", view.label);
          price.append(value);
          header.append(price);
        } else if (view.groups?.length) {
          const mapped = make("div", null, "mapped-choice");
          mapped.dataset.field = f.key;
          const groups = make("div", null, "group-chips");
          groups.setAttribute("aria-label", `${view.label}: ${view.groupingLabel}`);
          for (const group of view.groups) {
            const chip = make("span", group, "group-chip");
            chip.title = view.groupingLabel;
            groups.append(chip);
          }
          mapped.append(groups, make("p", view.wording, "brand-wording"));
          if (view.stateLabel) mapped.append(make("span", view.stateLabel, "state"));
          mappedChoices.push(mapped);
        } else {
          const row = make("div", null, "spec");
          row.dataset.field = f.key;
          const dd = make("dd");
          dd.append(value);
          row.append(make("dt", view.label), dd);
          dl.append(row);
        }
        const evidence = make("section", null, "field-evidence");
        evidence.dataset.evidenceField = f.key;
        evidence.append(make("h4", view.label));
        const e = view.evidence;
        if (e.state) evidence.append(make("p", e.state, "state"));
        if (e.quote) evidence.append(make("blockquote", e.quote));
        if (e.source_url) evidence.append(safeLink(e.source_url, "Open source ↗"));
        if (e.checked) evidence.append(make("span", ` · Checked ${e.checked}`));
        if (e.note) evidence.append(make("p", e.note));
        if (view.groupingLabel) {
          evidence.append(make("p", `${view.groupingLabel}: ${view.groups.join(" / ")}`));
        }
        if (e.qualifier_quote && e.qualifier_url) {
          evidence.append(
            make("p", "Evidence for the field qualifier"),
            make("blockquote", e.qualifier_quote),
            safeLink(e.qualifier_url, "Open qualifier source ↗"),
          );
        }
        if (e.original) {
          const originals = Array.isArray(e.original) ? e.original : [e.original];
          const original = originals.map((x) => `${x.value} ${x.unit}`).join(" × ");
          evidence.append(make("p", `Published original: ${original}`));
        }
        if (e.priceContext) evidence.append(make("p", e.priceContext));
        if (view.dealer) evidence.append(safeLink(e.source_url, "View dealer price ↗"));
        if (e.benchmarkChecked) {
          evidence.append(make("p", `Benchmark checked ${e.benchmarkChecked}`));
        }
        if (K.stale(e.checked)) evidence.append(make("p", "May be out of date.", "stale"));
        sources.append(evidence);
      }
      const checked = make("p", `Product checked ${p.checked}`, "checked");
      if (K.stale(p.checked)) checked.append(make("span", "May be out of date.", "stale"));
      sources.append(checked);
      const footer = make("div", null, "card-footer");
      const productLink = safeLink(p.product_url, "Brand site ↗");
      productLink.className = "product-link";
      footer.append(sources, productLink);
      article.append(header, ...mappedChoices, dl, footer);
      return article;
    }
    function renderResults() {
      const found = K.sortProducts(
        products.filter((p) => K.matches(p, config, selection)),
        config,
        $("sort").value,
      );
      $("filter-toggle").textContent =
        `Filters (${Object.keys(selection).length})`;
      $("show-results").textContent = `Show ${found.length}`;
      $("result-count").textContent =
        `Showing ${found.length} of ${products.length}`;
      $("cards").replaceChildren(...found.map(card));
      $("empty").hidden = found.length > 0;
      $("empty-title").textContent = products.length
        ? "No matches just yet."
        : "Your next shortlist starts here.";
      $("empty-text").textContent = products.length
        ? "Try removing a filter or choose Reset all to see every product."
        : "This category is ready for research. Add verified products to its data file when you’re ready.";
      for (const item of counts) {
        const candidates = products.filter((p) =>
          K.matches(p, config, selection, item.f.key),
        );
        if (item.choice !== undefined) {
          const n = candidates.filter((p) =>
            K.matches(p, config, { [item.f.key]: [item.choice] }),
          ).length;
          item.node.textContent = `(${n})`;
        } else
          item.node.textContent = `${candidates.filter((p) => K.usable(K.record(p, item.f))).length} with comparable values`;
      }
    }
    $("reset").addEventListener("click", () => {
      selection = {};
      $("sort").value = "model";
      updateURL();
      renderFilters();
      renderResults();
    });
    $("sort").addEventListener("change", () => {
      updateURL();
      renderResults();
    });
    window.addEventListener("popstate", () => {
      selection = K.readSelection(location.search, config);
      const s = new URLSearchParams(location.search).get("sort");
      $("sort").value = sortFields.some((f) => f.key === s) ? s : "model";
      renderFilters();
      renderResults();
    });
    renderFilters();
    renderResults();
    $("workspace").hidden = false;
  } catch (error) {
    $("question").textContent = "The category could not be loaded.";
    $("error").hidden = false;
    $("error").textContent =
      `${error.message} Serve this folder over HTTP rather than opening index.html directly.`;
    console.error(error);
  }
})();
