function hostnameMatchesDomain(hostname, domain) {
    if (!hostname || !domain) {
        return false;
    }
    const normalizedHost = hostname.toLowerCase();
    const normalizedDomain = domain.toLowerCase();
    return normalizedHost === normalizedDomain || normalizedHost.endsWith(`.${normalizedDomain}`);
}

function ruleAppliesToHostname(rule, hostname) {
    if (rule.condition?.requestDomains?.length) {
        return rule.condition.requestDomains.some((domain) => hostnameMatchesDomain(hostname, domain));
    }
    if (rule.condition?.excludedRequestDomains?.length) {
        return !rule.condition.excludedRequestDomains.some((domain) => hostnameMatchesDomain(hostname, domain));
    }
    return true;
}

function gatherAfterLoadParams(rules, hostname) {
    return rules
        .filter((rule) => rule.enabled && rule.group !== "GlobalWhitelist")
        .filter((rule) => rule.timingMode === "afterLoad")
        .filter((rule) => ruleAppliesToHostname(rule, hostname))
        .map((rule) => rule.action?.redirect?.transform?.queryTransform?.removeParams?.[0])
        .filter((param) => Boolean(param));
}

function hasEnabledGlobalWhitelistForHostname(rules, hostname) {
    return rules.some((rule) =>
        rule.group === "GlobalWhitelist" &&
        rule.enabled &&
        Array.isArray(rule.condition?.requestDomains) &&
        rule.condition.requestDomains.some((domain) => hostnameMatchesDomain(hostname, domain))
    );
}

function stripParamsFromCurrentUrl(paramNames) {
    if (!paramNames.length) {
        return false;
    }

    const url = new URL(window.location.href);
    let changed = false;

    paramNames.forEach((param) => {
        if (url.searchParams.has(param)) {
            url.searchParams.delete(param);
            changed = true;
        }
    });

    if (changed) {
        history.replaceState(history.state, "", url.toString());
    }
    return changed;
}

function runAfterLoadCleanup(storedRules, hostname = window.location.hostname) {
    if (!Array.isArray(storedRules) || !storedRules.length) {
        return { changed: false, removedParamCount: 0 };
    }

    if (hasEnabledGlobalWhitelistForHostname(storedRules, hostname)) {
        return { changed: false, removedParamCount: 0 };
    }

    const paramsToStrip = gatherAfterLoadParams(storedRules, hostname);
    const uniqueParams = [...new Set(paramsToStrip)];
    const changed = stripParamsFromCurrentUrl(uniqueParams);
    return { changed, removedParamCount: uniqueParams.length };
}

if (window.top === window) {
    const runCleanupFromStorage = () => {
        chrome.storage.local.get("rules")
            .then((result) => {
                const rules = result.rules || [];
                runAfterLoadCleanup(rules);
            })
            .catch(() => {
                // Silent fail: content script should never block the page.
            });
    };

    runCleanupFromStorage();

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== "local" || !changes.rules) {
            return;
        }
        const nextRules = changes.rules.newValue || [];
        runAfterLoadCleanup(nextRules);
    });
}
