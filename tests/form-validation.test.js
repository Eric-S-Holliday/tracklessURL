// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  handleDomainFilterTypeChange,
  setDomainListFieldValidity,
  setGlobalWhitelistDomainFieldValidity,
  setParameterFieldValidity
} from "../chromium/scripts/form-validation.js";

function addInput(id, value = "", type = "text") {
  const element = document.createElement("input");
  element.id = id;
  element.type = type;
  element.value = value;
  element.reportValidity = () => true;
  document.body.appendChild(element);
  return element;
}

function addTextarea(id, value = "") {
  const element = document.createElement("textarea");
  element.id = id;
  element.value = value;
  element.reportValidity = () => true;
  document.body.appendChild(element);
  return element;
}

describe("form validation", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("marks invalid parameters and then valid ones", () => {
    const parameter = addInput("parameter", "invalid space");

    setParameterFieldValidity();
    expect(parameter.validationMessage).toContain("invalid characters");

    parameter.value = "utm_source";
    setParameterFieldValidity();
    expect(parameter.validationMessage).toBe("");
  });

  it("requires domain list when blacklist is selected", () => {
    const blacklistRadio = addInput("blacklistRadio", "", "radio");
    blacklistRadio.checked = true;
    blacklistRadio.name = "domainFilterType";
    blacklistRadio.value = "Blacklist";

    const whitelistRadio = addInput("whitelistRadio", "", "radio");
    whitelistRadio.checked = false;
    whitelistRadio.name = "domainFilterType";
    whitelistRadio.value = "Whitelist";

    const domainList = addTextarea("domainFilterList", "");

    handleDomainFilterTypeChange();
    setDomainListFieldValidity();
    expect(domainList.validationMessage).toContain("at least one domain");

    domainList.value = "example.com";
    setDomainListFieldValidity();
    expect(domainList.validationMessage).toBe("");
  });

  it("validates global whitelist domain values", () => {
    const globalDomain = addInput("globalWhitelistDomain", "bad_domain");

    setGlobalWhitelistDomainFieldValidity();
    expect(globalDomain.validationMessage).toContain("Domain is invalid");

    globalDomain.value = "example.com";
    setGlobalWhitelistDomainFieldValidity();
    expect(globalDomain.validationMessage).toBe("");
  });
});
