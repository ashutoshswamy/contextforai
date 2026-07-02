import test from "node:test";
import assert from "node:assert/strict";
import { limitFor } from "../lib/ratelimit.ts";

test("limitFor gives each plan its documented req/min", () => {
  assert.equal(limitFor("free", "markdown"), 20);
  assert.equal(limitFor("starter", "markdown"), 60);
  assert.equal(limitFor("growth", "markdown"), 120);
  assert.equal(limitFor("pro", "markdown"), 180);
});

test("limitFor halves the limit for heavy endpoints", () => {
  assert.equal(limitFor("free", "screenshot"), 10);
  assert.equal(limitFor("starter", "screenshot"), 30);
  assert.equal(limitFor("growth", "branding"), 60);
  assert.equal(limitFor("pro", "branding"), 90);
});

test("limitFor does not halve light endpoints", () => {
  for (const ep of ["markdown", "html", "json", "sitemap", "fonts"]) {
    assert.equal(limitFor("starter", ep), 60);
  }
});

test("limitFor falls back to the free tier for an unknown plan", () => {
  assert.equal(limitFor("nonexistent-plan", "markdown"), 20);
  assert.equal(limitFor("nonexistent-plan", "screenshot"), 10);
});
