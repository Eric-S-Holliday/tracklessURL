# tracklessURL

tracklessURL is an open-source privacy-focused extension that automatically removes tracking parameters from URLs before they're visited. Using the Declarative Net Request API, tracklessURL is able to modify URLs without ever requiring intrusive permissions. This means the extension is unable to view or store what websites you visit.

Features:

- Frequently updated built-in list of the most common URL trackers, such as UTM (Urchin Tracking Modules) parameters, Facebook trackers (fbclid), and multiple other social media and marketing website trackers.

- Fully user-customizable: Simple, intuitive user interface allows you to add your own rules for blocking parameters. Delete, edit, toggle, or group rules together at any time.

- Global whitelist feature provides an easy way to whitelist any websites that may behave incorrectly because of parameter removal.

- Multiple ways to add rules: Add a parameter manually by specifying the parameter to block and the websites to block it on or paste a URL containing tracking parameters to quickly add new rules to block them.

With tracklessURL, I hope to build and maintain the web's largest list of URL tracking parameters. Few lists currently exist, and none are near comprehensive enough. If you find parameters to add to the built-in list, please contact me with the information.

Some of the tracking parameters tracklessURL removes include:

- Google: Urchin Tracking Modules (utm_source, utm_medium, etc.), gclid
- Facebook: fbclid
- Instagram: igshid
- Piwik: pk_campaign, pk_keyword, etc.
- Reddit: share_id
- Youtube: si, ab_channel, feature, etc.
- Matomo: mtm_campaign, mtm_source, etc.
- Microsoft: msclkid
- Olytics: oly_enc_id, oly_anon_id
- Spotify: si, context
- Vero Marketing: vero_id
- Marketo: mkt_tok
- LinkedIn: trackingId, refId, trk, etc.
- Mailchimp: mc_cid
- HubSpot: hsa_cam, hsa_src, \_hsenc, etc.
- Bronto: \_bta_tid, \_bta_c

And many more!

## Development testing setup

This extension can be loaded directly from source (no build step required).

To run automated tests before making changes:

1. Install Node.js (if not already installed).
2. Install test dependencies:
   - `npm install`
3. Run the test suite:
   - `npm test`

The current tests cover baseline rule generation and validation behavior so future enhancements can be made with a safety net.

## How to Export/Import Data from Original tracklessURL Extension

### Export from Original Extension (Only tested with Chrome. Firefox steps may be different)

1. Open Browser's Extensions Page.
2. Turn on Developer mode. (Not sure this is required)
3. Turn Off the Modified Extension and Turn on the Original Extension.
4. Open the Original tracklessURL Settings page.
5. Open Browser DevTools.
6. In the DevTools Console, run:
   chrome.storage.local.get('rules', (obj) => console.log(JSON.stringify(obj, null, 2)));
7. Copy the printed JSON from the console.

### Import into this Modified Extension

1. Return to Browser's Extensions Page.
2. Turn Off the Original Extension and Turn on the Modified Extension.
3. Open the Modified tracklessURL Settings page.
4. Open Browser DevTools.
5. In the DevTools Console, run the following updating string with exported JSON from above:
   const imported = JSON.parse(`paste the entire JSON here as one string`);
   chrome.storage.local.set(imported, () => console.log("done"));
