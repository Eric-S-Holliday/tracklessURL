import { beforeEach, describe, expect, it, vi } from "vitest";
import { GlobalWhitelistRule } from "../chromium/resources/GlobalWhitelistRuleClass.js";
import * as utils from "../chromium/scripts/utils.js";

vi.mock("../chromium/scripts/utils.js", () => ({
  getStoredRuleList: vi.fn()
}));

describe("GlobalWhitelistRule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds a global whitelist rule and chooses next open ID", async () => {
    utils.getStoredRuleList.mockResolvedValue([{ id: 1 }, { id: 3 }]);
    const rule = new GlobalWhitelistRule("example.com");

    const json = await rule.getRuleJson();

    expect(json.id).toBe(2);
    expect(json.condition.requestDomains).toEqual(["example.com"]);
    expect(json.action.type).toBe("allow");
  });
});
