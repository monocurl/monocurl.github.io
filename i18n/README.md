# website localization

The documenter copies this directory verbatim into the published static site. `en.json` is the source catalog; every locale listed in `locales.json` needs a matching JSON catalog with the same keys.

The browser chooses a saved language first, then the browser language, and otherwise English. It falls back per key to English, so do not list a locale in `locales.json` until its catalog has been reviewed.

Use `data-i18n="key"` for text content, `data-i18n-aria-label="key"`, `data-i18n-placeholder="key"`, and `data-i18n-title="key"` for attributes. The common chrome already uses these hooks. Add the same attributes in the documenter source for any generated site copy that a locale should replace; do not edit the generated repository directly.

Lesson prose lives in `content/lessons/<locale>/` source variants. The documenter generates localized lesson pages beside the English pages as `/learn/<slug>.<locale>.html`; code fences and inline Monocurl syntax remain unchanged.

Do not translate Monocurl code blocks, language keywords, file extensions, URLs, or command lines unless a translation explicitly needs surrounding explanatory text changed.
