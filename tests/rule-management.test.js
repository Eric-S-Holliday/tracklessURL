import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addRuleToBrowserDynamicRuleList,
  addRuleToLocalStorage,
  deleteRule
} from "../chromium/scripts/rule-management.js";
import * as utils from "../chromium/scripts/utils.js";

vi.mock("../chromium/scripts/utils.js", () => ({
  getStoredRuleList: vi.fn(),
  showBottomAlert: vi.fn(),
  checkForDuplicateRule: vi.fn(),
  getDynamicRules: vi.fn()
}));

describe("rule-management", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.chrome = {
      storage: {
        local: {
          set: vi.fn().mockResolvedValue(undefined)
        }
      },
      declarativeNetRequest: {
        MAX_NUMBER_OF_DYNAMIC_AND_SESSION_RULES: 1000,
        updateDynamicRules: vi.fn().mockResolvedValue(undefined)
      }
    };

    globalThis.document = {
      getElementById: vi.fn().mockReturnValue(null)
    };

    globalThis.bootstrap = {
      Tooltip: {
        getInstance: vi.fn().mockReturnValue(null)
      }
    };
  });

  it("skips browser dynamic add when rule is disabled", async () => {
    const inputRule = { id: 10, group: "G", enabled: false };

    await addRuleToBrowserDynamicRuleList(inputRule, false);

    expect(chrome.declarativeNetRequest.updateDynamicRules).not.toHaveBeenCalled();
  });

  it("adds enabled rule to browser dynamic list and strips local-only fields", async () => {
    utils.getDynamicRules.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const inputRule = {
      id: 3,
      enabled: true,
      group: "Analytics",
      action: { type: "redirect", redirect: { transform: { queryTransform: { removeParams: ["utm_source"] } } } },
      condition: { regexFilter: "[?&]utm_source=*" }
    };

    await addRuleToBrowserDynamicRuleList(inputRule, true);

    expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledTimes(1);
    const callArg = chrome.declarativeNetRequest.updateDynamicRules.mock.calls[0][0];
    expect(callArg.addRules[0].group).toBeUndefined();
    expect(callArg.addRules[0].enabled).toBeUndefined();
    expect(callArg.addRules[0].id).toBe(3);
  });

  it("persists added rule metadata into local storage", async () => {
    utils.getStoredRuleList.mockResolvedValue([{ id: 1 }]);
    const rule = { id: 2, action: {}, condition: {} };

    await addRuleToLocalStorage(rule, true, "GroupA");

    expect(chrome.storage.local.set).toHaveBeenCalledTimes(1);
    const saved = chrome.storage.local.set.mock.calls[0][0].rules;
    expect(saved).toHaveLength(2);
    expect(saved[1]).toMatchObject({ id: 2, enabled: true, group: "GroupA" });
  });

  it("deletes a stored rule and removes it from dynamic rules", async () => {
    const stored = [
      { id: "1", action: {}, condition: {} },
      { id: "2", action: {}, condition: {} }
    ];
    utils.getStoredRuleList.mockResolvedValue(structuredClone(stored));

    await deleteRule("2");

    expect(chrome.storage.local.set).toHaveBeenCalledTimes(1);
    const saved = chrome.storage.local.set.mock.calls[0][0].rules;
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe("1");
    expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith({ removeRuleIds: [2] });
  });
});
