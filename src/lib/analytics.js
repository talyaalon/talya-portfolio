// Fire-and-forget analytics. The browser only sends WHAT happened
// (event type + which project) and the referrer. Everything else that is
// actually useful — country/city (from IP, server-side via Netlify geo),
// device type, and timestamp — is derived on the server in the Netlify
// Function, never trusted from the client.
//
// We deliberately collect NO personal identity. A visitor's email address
// is simply not available to any website in the browser, so it is never
// requested, never sent, and never stored. See netlify/functions/track.js.

const ENDPOINT = "/api/track";

export function track(eventType, projectId = null) {
  try {
    const body = JSON.stringify({
      event_type: eventType, // 'view' | 'open' | 'click'
      project_id: projectId,
      referrer: document.referrer || null,
      path: window.location.pathname,
    });

    // sendBeacon survives page navigation (important for 'click' → external link).
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
    } else {
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Analytics must never break the page.
  }
}
