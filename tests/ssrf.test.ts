import test from "node:test";
import assert from "node:assert/strict";
import { validateUrl, isPrivateHost } from "../lib/ssrf.ts";

test("validateUrl accepts a normal public URL", () => {
  const url = validateUrl("https://example.com/page");
  assert.equal(url.hostname, "example.com");
});

test("validateUrl rejects non-http(s) protocols", () => {
  assert.throws(() => validateUrl("file:///etc/passwd"), /INVALID_URL/);
  assert.throws(() => validateUrl("ftp://example.com"), /INVALID_URL/);
});

test("validateUrl rejects malformed URLs", () => {
  assert.throws(() => validateUrl("not a url"), /INVALID_URL/);
});

test("validateUrl rejects empty/non-string/oversized input", () => {
  assert.throws(() => validateUrl(""), /INVALID_URL/);
  // @ts-expect-error deliberately wrong type to prove the runtime guard, not just the type
  assert.throws(() => validateUrl(12345), /INVALID_URL/);
  assert.throws(() => validateUrl("https://example.com/" + "a".repeat(2048)), /INVALID_URL/);
});

test("validateUrl blocks private IPv4 ranges", () => {
  for (const host of [
    "http://127.0.0.1/",
    "http://10.0.0.5/",
    "http://172.16.0.1/",
    "http://172.31.255.255/",
    "http://192.168.1.1/",
    "http://169.254.169.254/", // cloud metadata endpoint
    "http://0.0.0.0/",
  ]) {
    assert.throws(() => validateUrl(host), /SSRF_BLOCKED/, `expected ${host} to be blocked`);
  }
});

test("validateUrl does not block adjacent public ranges (no over-blocking)", () => {
  // 172.15.x and 172.32.x are outside the 172.16-31 private block
  assert.doesNotThrow(() => validateUrl("http://172.15.0.1/"));
  assert.doesNotThrow(() => validateUrl("http://172.32.0.1/"));
});

test("validateUrl blocks named loopback/metadata hosts", () => {
  assert.throws(() => validateUrl("http://localhost/"), /SSRF_BLOCKED/);
  assert.throws(() => validateUrl("http://metadata.google.internal/"), /SSRF_BLOCKED/);
});

test("validateUrl blocks decimal/hex/octal obfuscated loopback (Node normalizes these)", () => {
  assert.throws(() => validateUrl("http://2130706433/"), /SSRF_BLOCKED/); // 127.0.0.1 as decimal
  assert.throws(() => validateUrl("http://0x7f000001/"), /SSRF_BLOCKED/); // 127.0.0.1 as hex
});

test("validateUrl blocks IPv6 loopback and link-local", () => {
  assert.throws(() => validateUrl("http://[::1]/"), /SSRF_BLOCKED/);
  assert.throws(() => validateUrl("http://[fe80::1]/"), /SSRF_BLOCKED/);
});

test("validateUrl blocks IPv4-mapped IPv6 loopback (the bypass this codebase actually had)", () => {
  assert.throws(() => validateUrl("http://[::ffff:127.0.0.1]/"), /SSRF_BLOCKED/);
  assert.throws(() => validateUrl("http://[::ffff:192.168.1.1]/"), /SSRF_BLOCKED/);
});

test("isPrivateHost is case-insensitive", () => {
  assert.equal(isPrivateHost("LOCALHOST"), true);
  assert.equal(isPrivateHost("localhost"), true);
  assert.equal(isPrivateHost("example.com"), false);
});
