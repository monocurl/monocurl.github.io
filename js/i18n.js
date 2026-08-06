(() => {
  const fallback = "en";
  const preferenceKey = "monocurl-language";
  let currentCatalog = {};

  const loadJson = async (path) => {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`could not load ${path}`);
    return response.json();
  };

  const apply = (catalog) => {
    currentCatalog = catalog;
    const text = (key) => catalog[key];
    for (const element of document.querySelectorAll("[data-i18n]")) {
      const value = text(element.dataset.i18n);
      if (value) element.textContent = value;
    }
    for (const attribute of ["aria-label", "placeholder", "title"]) {
      const selector = `[data-i18n-${attribute}]`;
      for (const element of document.querySelectorAll(selector)) {
        const value = text(element.dataset[`i18n${attribute.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`]);
        if (value) element.setAttribute(attribute, value);
      }
    }
  };

  window.MonocurlI18n = { text: (key) => currentCatalog[key] || key };

  const preferredLanguage = (locales) => {
    const saved = localStorage.getItem(preferenceKey);
    const browser = navigator.language.toLowerCase().split("-")[0];
    return [saved, browser, fallback].find((code) => locales.some((locale) => locale.code === code));
  };

  const localizeLessonPath = (language) => {
    const match = window.location.pathname.match(/^\/learn\/([^/]+?)(?:\.([a-z]{2}))?\.html$/);
    if (!match) return;
    const [, slug, current] = match;
    const base = `/learn/${slug}.html`;
    const target = language === fallback ? base : `/learn/${slug}.${language}.html`;
    if (window.location.pathname !== target) window.location.replace(target);
  };

  const renderPicker = (locales, selected, reload) => {
    const host = document.querySelector("[data-language-picker]");
    if (!host || locales.length < 2) return;

    const label = document.createElement("label");
    label.className = "language-picker";
    label.setAttribute("data-i18n", "picker.label");
    label.textContent = "Language";
    const select = document.createElement("select");
    select.setAttribute("data-i18n-aria-label", "picker.label");
    select.setAttribute("aria-label", "Language");
    for (const locale of locales) {
      const option = new Option(locale.name, locale.code, false, locale.code === selected);
      select.add(option);
    }
    select.addEventListener("change", () => {
      localStorage.setItem(preferenceKey, select.value);
      reload(select.value);
    });
    label.append(select);
    host.replaceChildren(label);
    apply(currentCatalog);
  };

  const start = async () => {
    try {
      const locales = await loadJson("/i18n/locales.json");
      const selected = preferredLanguage(locales);
      const english = await loadJson(`/i18n/${fallback}.json`);
      const translated = selected === fallback ? {} : await loadJson(`/i18n/${selected}.json`);
      apply({ ...english, ...translated });
      document.documentElement.lang = selected;
      localizeLessonPath(selected);
      renderPicker(locales, selected, async (next) => {
        const catalog = next === fallback ? {} : await loadJson(`/i18n/${next}.json`);
        apply({ ...english, ...catalog });
        document.documentElement.lang = next;
        localizeLessonPath(next);
      });
    } catch (error) {
      console.warn("Monocurl localization could not be loaded", error);
    }
  };

  document.addEventListener("DOMContentLoaded", start);
})();
