import { beforeEach, describe, expect, it, vi } from "vitest";
import { CustomRule } from "../chromium/resources/CustomRuleClass.js";
import * as utils from "../chromium/scripts/utils.js";

vi.mock("../chromium/scripts/utils.js", () => ({
  getStoredRuleList: vi.fn(),
}));

describe("CustomRule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts valid parameter and group patterns", () => {
    expect(CustomRule.isValidParameter("utm_source")).toBe(true);
    expect(CustomRule.isValidGroup("Marketing Team.1")).toBe(true);
  });

  it("rejects invalid parameter and domain values", () => {
    expect(CustomRule.isValidParameter("utm source")).toBe(false);
    expect(CustomRule.validateDomains("example.com, invalid_domain")).toBe(false);
  });

  it("builds a whitelist rule with excluded domains", async () => {
    utils.getStoredRuleList.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 4 }]);
    const rule = new CustomRule("utm_source", "GroupA", "Whitelist", "google.com, github.com");

    const json = await rule.getRuleJson();

    expect(json.id).toBe(3);
    expect(json.action.redirect.transform.queryTransform.removeParams).toEqual(["utm_source"]);
    expect(json.condition.excludedRequestDomains).toEqual(["google.com", "github.com"]);
    expect(json.condition.requestDomains).toBeUndefined();
  });

  it("builds a blacklist rule with request domains", async () => {
    utils.getStoredRuleList.mockResolvedValue([]);
    const rule = new CustomRule("fbclid", "", "Blacklist", "facebook.com");

    const json = await rule.getRuleJson();

    expect(json.id).toBe(1);
    expect(json.condition.requestDomains).toEqual(["facebook.com"]);
    expect(json.condition.excludedRequestDomains).toBeUndefined();
  });

  it("supports dollar-prefixed parameters from URL decoding", async () => {
    utils.getStoredRuleList.mockResolvedValue([]);
    const rule = new CustomRule("$3p", "dice.com", "Blacklist", "dice.com");

    const json = await rule.getRuleJson();

    expect(CustomRule.isValidParameter("$3p")).toBe(true);
    expect(json.action.redirect.transform.queryTransform.removeParams).toEqual(["$3p"]);
    expect(json.condition.regexFilter).toBe("[?&]%243p=*");

    const matcher = new RegExp(json.condition.regexFilter);
    expect(matcher.test("https://www.dice.com/job-detail/1234?%243p=e_iterable")).toBe(true);
    expect(matcher.test("https://www.dice.com/job-detail/1234?$3p=e_iterable")).toBe(false);
  });

  it("keeps per-rule timing mode for storage metadata", () => {
    const preRequestRule = new CustomRule("utm_source", "", "Whitelist", "");
    const afterLoadRule = new CustomRule("utm_source", "", "Whitelist", "", "afterLoad");

    expect(preRequestRule.timingMode).toBe("preRequest");
    expect(afterLoadRule.timingMode).toBe("afterLoad");
  });
});
