var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/config.ts
import path from "path";

// src/api/kv.ts
import fetch from "node-fetch";

// src/api/api.ts
var APIError = class extends Error {
  response;
  constructor(response, key) {
    super(
      `HTTP Error Response: ${response.status} ${response.statusText} for key(s): ${key}`
    );
    this.response = response;
  }
};
var APINotFoundError = class extends Error {
};
var API = class {
  // The atlas-next package version will be injected from package.json
  // at build time by esbuild-plugin-version-injector
  version = "2.0.0-beta.0";
  constructor() {
    if (process.env.HEADLESS_METADATA !== "true") {
      throw new Error("API: The app is not running on the Headless Platform");
    }
  }
  /**
   * Convert response status codes to API errors and throw them
   * @param response
   * @param key
   */
  throwResponseErrors(response, key) {
    if (response.status === 404) {
      throw new APINotFoundError();
    }
    if (response.status < 200 || response.status >= 300) {
      throw new APIError(response, key);
    }
  }
};

// src/api/kv.ts
var KV = class extends API {
  token;
  url;
  static isAvailable() {
    const urlExists = (process.env.HEADLESS_KV_STORE_URL ?? "") !== "";
    const tokenExists = (process.env.HEADLESS_KV_STORE_TOKEN ?? "") !== "";
    const runtime = String(process.env.HEADLESS_METADATA).toLowerCase() === "true";
    return urlExists && tokenExists && runtime;
  }
  constructor() {
    super();
    if (process.env.HEADLESS_METADATA !== "true") {
      throw new Error("KV: The app is not running on the Headless Platform");
    }
    this.url = process.env.HEADLESS_KV_STORE_URL ?? "";
    if (this.url === "") {
      throw new Error("KV: HEADLESS_KV_STORE_URL env var is missing");
    }
    this.token = process.env.HEADLESS_KV_STORE_TOKEN ?? "";
    if (this.token === "") {
      throw new Error("KV: HEADLESS_KV_STORE_TOKEN env var is missing");
    }
  }
  async get(key) {
    const response = await fetch(`${this.url}/${key}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "User-Agent": `AtlasNext/${this.version}`
      }
    });
    this.throwResponseErrors(response, key);
    return await response.json();
  }
  async set(key, data, nextRevalidationMethod = "") {
    if (data === null) {
      return;
    }
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
      "User-Agent": `AtlasNext/${this.version}`
    };
    if (nextRevalidationMethod !== "") {
      headers["Next-Revalidation-Method"] = nextRevalidationMethod;
    }
    const response = await fetch(`${this.url}/${key}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers
    });
    this.throwResponseErrors(response, key);
  }
};

// src/config.ts
function withAtlasConfig(nextConfig, atlasConfig) {
  return withWPEConfig(nextConfig, atlasConfig);
}
function withWPEConfig(nextConfig, wpeConfig) {
  if (wpeConfig?.remoteCacheHandler === false) {
    return nextConfig;
  }
  const nextModulePath = path.parse(__require.resolve("next"));
  const nextPackage = __require(path.join(nextModulePath.dir, "../../package.json"));
  return setCacheHandler(
    nextConfig,
    nextPackage.version,
    // TODO: look closer how this can be stubbed to enable testing
    // of the withWPEConfig function
    __require.resolve("@wpengine/atlas-next/cache-handler")
  );
}
function setCacheHandler(nextConfig, nextVersion, cacheHandlerPath) {
  if (compare(nextVersion, "15.0.0") === -1) {
    throw new Error(
      "Next.js version " + nextVersion + " is not supported by @wpengine/atlas-next"
    );
  }
  if (nextConfig.cacheHandler !== void 0) {
    console.warn("Overwriting existing cacheHandler config");
  }
  nextConfig.cacheHandler = cacheHandlerPath;
  if (nextConfig.cacheMaxMemorySize !== void 0) {
    console.warn("Overwriting existing cacheMaxMemorySize config");
  }
  nextConfig.cacheMaxMemorySize = 0;
  printStartupNotice();
  return nextConfig;
}
function printStartupNotice() {
  if (process.env.HEADLESS_CACHE_HANDLER_STARTUP === void 0) {
    let message = "Headless Platform remote cache handler enabled";
    if (process.env.HEADLESS_METADATA_BUILD === void 0 && !KV.isAvailable()) {
      message = message + " (local storage mode)";
    }
    message = message + "\n";
    console.log(message);
    process.env.HEADLESS_CACHE_HANDLER_STARTUP = "true";
  }
}
function compare(v1, v2) {
  const version1 = v1.split("-")[0];
  const version2 = v2.split("-")[0];
  validateVersion(version1);
  validateVersion(version2);
  const v1Parts = version1.split(".");
  const v1Major = v1Parts[0];
  const v1Minor = v1Parts[1];
  const v1Patch = v1Parts[2];
  const v2Parts = version2.split(".");
  const v2Major = v2Parts[0];
  const v2Minor = v2Parts[1];
  const v2Patch = v2Parts[2];
  const v1PatchLesserOrEqual = v1Patch < v2Patch ? -1 : 0;
  const comparePatchVersions = v1Patch > v2Patch ? 1 : v1PatchLesserOrEqual;
  const v1MinorLesserOrEqual = v1Minor < v2Minor ? -1 : comparePatchVersions;
  const compareMinorVersions = v1Minor > v2Minor ? 1 : v1MinorLesserOrEqual;
  const v1MajorLesserOrEqual = v1Major < v2Major ? -1 : compareMinorVersions;
  return v1Major > v2Major ? 1 : v1MajorLesserOrEqual;
}
function validateVersion(version) {
  const invalidVersionError = "Unable to validate Next.js version: " + version;
  if (version.length === 0) {
    throw new Error(invalidVersionError);
  }
  const parts = version.split(".");
  if (parts.length < 3) {
    throw new Error(invalidVersionError);
  }
  const major = parts[0];
  if (major.length === 0 || isNaN(Number(major))) {
    throw new Error(invalidVersionError);
  }
  const minor = parts[1];
  if (minor.length === 0 || isNaN(Number(minor))) {
    throw new Error(invalidVersionError);
  }
}
export {
  withAtlasConfig,
  withWPEConfig
};
//# sourceMappingURL=index.mjs.map