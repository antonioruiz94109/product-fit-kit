"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const K = require("../../core.js");

// Small DOM test adapter; browser layout and interaction are checked separately.
class Element {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.value = "";
    this.text = "";
  }
  set textContent(text) {
    this.text = String(text);
    this.children = [];
  }
  get textContent() {
    return this.text + this.children.map((child) => child.textContent).join("");
  }
  append(...children) {
    this.children.push(...children);
  }
  replaceChildren(...children) {
    this.text = "";
    this.children = children;
  }
  setAttribute(key, value) {
    this.attributes[key] = value;
  }
  addEventListener(name, fn) {
    this.listeners[name] = fn;
  }
}

function descendants(node) {
  return node.children.flatMap((child) => [child, ...descendants(child)]);
}

async function loadApp(config, products, name = "Fixture kit") {
  const nodes = new Map();
  const document = {
    createElement: (tag) => new Element(tag),
    getElementById: (id) => {
      if (!nodes.has(id)) nodes.set(id, new Element("div"));
      return nodes.get(id);
    },
  };
  const context = {
    document,
    window: {
      FitKit: K,
      matchMedia: () => ({ matches: false, addEventListener() {} }),
      addEventListener() {},
    },
    location: { search: "", pathname: "/", hash: "" },
    history: { replaceState() {} },
    URL,
    URLSearchParams,
    console,
    fetch: async (url) => ({
      ok: true,
      json: async () => url === "site.json"
        ? { name, category: "fixture" }
        : url.endsWith("config.json") ? config : products,
    }),
  };
  const script = fs.readFileSync(path.join(__dirname, "../../app.js"), "utf8");
  await vm.runInNewContext(script, context);
  return { nodes, document, cards: nodes.get("cards").children };
}

module.exports = { loadApp, descendants };
