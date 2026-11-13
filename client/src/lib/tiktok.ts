// Thin, safe wrapper around the TikTok Pixel (ttq) loaded in index.html.
// Every call is wrapped so analytics can never break the app (e.g. ad blockers).

type TtqLike = {
  track: (event: string, params?: Record<string, unknown>) => void;
  page: () => void;
};

const getTtq = (): TtqLike | null => {
  const w = window as unknown as { ttq?: TtqLike };
  return w.ttq ?? null;
};

export const ttqTrack = (event: string, params?: Record<string, unknown>) => {
  try {
    getTtq()?.track(event, params);
  } catch {
    /* ignore */
  }
};

export const ttqPage = () => {
  try {
    getTtq()?.page();
  } catch {
    /* ignore */
  }
};

const INTERACTIVE_SELECTOR =
  'button, a, input[type="submit"], input[type="button"], [role="button"], [role="menuitem"], [role="tab"], [role="switch"], [role="checkbox"], label[for]';

const describeElement = (el: Element): string => {
  const aria = el.getAttribute("aria-label");
  const text = (aria || (el as HTMLElement).innerText || el.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 60);
};

/**
 * Fires a "ClickButton" event for every click on an interactive element.
 * Only the element label/type/path are sent; never input values (no PII).
 */
export const initTiktokClickTracking = () => {
  document.addEventListener(
    "click",
    (e) => {
      try {
        if (window.location.pathname.startsWith("/admin")) return;
        const target = e.target as Element | null;
        const el = target?.closest?.(INTERACTIVE_SELECTOR);
        if (!el) return;
        const href = el instanceof HTMLAnchorElement ? el.href : undefined;
        ttqTrack("ClickButton", {
          content_name: describeElement(el) || el.tagName.toLowerCase(),
          content_type: el.tagName.toLowerCase(),
          page_path: window.location.pathname,
          ...(href ? { link_url: href } : {}),
        });
      } catch {
        /* ignore */
      }
    },
    true
  );
};
