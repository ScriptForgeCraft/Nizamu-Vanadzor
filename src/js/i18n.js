const STORAGE_KEY = "prospect24_language";
const DEFAULT_LANGUAGE = "hy";
const SUPPORTED_LANGUAGES = ["hy", "ru", "en"];
const languageLogos = {
  hy: "/images/logo.webp",
  ru: "/images/logo(ru).webp",
  en: "/images/logo(en).webp",
};
const ARMENIAN_RE = /[\u0530-\u058F]/;
const TRANSLATABLE_ATTRIBUTES = ["alt", "aria-label", "title", "data-title", "data-text", "download", "content"];

const textNodeOriginals = new WeakMap();
const attributeOriginals = new WeakMap();
let currentLanguage = getSavedLanguage();
let originalDocumentTitle = "";

const normalizeText = (value) => String(value).replace(/\s+/g, " ").trim();
const entry = (ru, en) => ({ ru, en });

function makeImageTranslations(max = 30) {
  const values = {};
  for (let index = 1; index <= max; index += 1) {
    values[`Պատկեր ${index}`] = entry(`Изображение ${index}`, `Image ${index}`);
  }
  return values;
}

function makeDownloadTranslations(max = 30) {
  const values = {};
  for (let index = 1; index <= max; index += 1) {
    values[`Ներբեռնել PDF փաստաթուղթ ${index}`] = entry(
      `Скачать PDF-документ ${index}`,
      `Download PDF document ${index}`,
    );
  }
  values["Ներբեռնել xlsx փաստաթուղթ 12"] = entry("Скачать xlsx-документ 12", "Download xlsx document 12");
  return values;
}

const commonTranslations = {
  "Լեզվի ընտրություն": entry("Выбор языка", "Language selection"),
  "Հայերեն": entry("Армянский", "Armenian"),
  "Լոգո": entry("Логотип", "Logo"),
  "Հիմնական նավիգացիա": entry("Основная навигация", "Main navigation"),
  "Բջջային նավիգացիա": entry("Мобильная навигация", "Mobile navigation"),
  "Բացել մենյուն": entry("Открыть меню", "Open menu"),
  "Փաթեթի բաղադրիչներ": entry("Состав пакета", "Package components"),
  "Փաստաթղթեր": entry("Документы", "Documents"),
  "Գնահատում": entry("Оценка", "Valuation"),
  "ՊԵՏԱԿԱՆ ԳՈՒՅՔԻ ՕՏԱՐՄԱՆ ՆԵՐԴՐՈՒՄԱՅԻՆ ՓԱԹԵԹ": entry(
    "ИНВЕСТИЦИОННЫЙ ПАКЕТ\nПО ОТЧУЖДЕНИЮ\nГОСУДАРСТВЕННОГО ИМУЩЕСТВА",
    "INVESTMENT PACKAGE\nFOR ALIENATION OF\nSTATE PROPERTY",
  ),
  "ՆԵՐԴՐՈՒՄԱՅԻՆ ՓԱԹԵԹԻ ԲԱՂԱԴՐԻՉՆԵՐ": entry("СОСТАВ ИНВЕСТИЦИОННОГО ПАКЕТА", "INVESTMENT PACKAGE COMPONENTS"),
  "ՆԵՐԴՐՈՒՄԱՅԻՆ ՓԱԹԵԹԻ ԳՆԱՀԱՏՈՒՄ": entry("ОЦЕНКА ИНВЕСТИЦИОННОГО ПАКЕТА", "INVESTMENT PACKAGE VALUATION"),
  "Գլխավոր պատկեր": entry("Главное изображение", "Main image"),
  "Նախորդ պատկեր": entry("Предыдущее изображение", "Previous image"),
  "Հաջորդ պատկեր": entry("Следующее изображение", "Next image"),
  "Նախորդ": entry("Предыдущее", "Previous"),
  "Հաջորդ": entry("Следующее", "Next"),
  "Էսքիզային առաջադրանք": entry("Эскизное задание", "Sketch design assignment"),
  "Վկայական": entry("Свидетельство", "Certificate"),
  "Սխեմա": entry("Схема", "Scheme"),
  "Սեյսմիկ": entry("Сейсмика", "Seismic"),
  "Վեոլիա ջուր": entry("Веолия вода", "Veolia Water"),
  "Գազպրոմ": entry("Газпром", "Gazprom"),
  "ՃՀԱ հայտ": entry("Заявка на АПЗ", "Architectural planning assignment application"),
  "Նախագծման Թույլտվություն": entry("Разрешение на проектирование", "Design permit"),
  "Բիզնես հաշվարկ": entry("Бизнес-расчет", "Business calculation"),
  "Ներդրումային Հաշվարկ.xlsx": entry("Инвестиционный расчет.xlsx", "Investment Calculation.xlsx"),
  "ՀՀ դրամ": entry("драм", "AMD"),
  "Փաստաթուղթ": entry("Документ", "Document"),
  "Ներբեռնել": entry("Скачать", "Download"),
  "Ներբեռնել բոլորը": entry("Скачать все", "Download all"),
  "Ներբեռնել տեղեկատվությունը (.pdf)": entry("Скачать информацию (.pdf)", "Download information (.pdf)"),
  "ձախ պատկեր": entry("левое изображение", "left image"),
  "աջ պատկեր": entry("правое изображение", "right image"),
  "Ամբողջ էկրանով": entry("Во весь экран", "Fullscreen"),
  "Փակել": entry("Закрыть", "Close"),
  "դիտում": entry("просмотр", "view"),
  "Մեծացնել": entry("Увеличить", "Zoom in"),
  "Մեծացնել (+ կամ մկնիկի անիվ)": entry("Увеличить (+ или колесо мыши)", "Zoom in (+ or mouse wheel)"),
  "Փոքրացնել": entry("Уменьшить", "Zoom out"),
  "Փոքրացնել (- կամ մկնիկի անիվ)": entry("Уменьшить (- или колесо мыши)", "Zoom out (- or mouse wheel)"),
  "Վերականգնել": entry("Сбросить", "Reset"),
  "Կարգավորումներ": entry("Настройки", "Settings"),
  "ՏԵՔՍՏԻ ՉԱՓ": entry("РАЗМЕР ТЕКСТА", "TEXT SIZE"),
  "ԳՈՒՆԱՅԻՆ ԹԵՄԱ": entry("ЦВЕТОВАЯ ТЕМА", "COLOR THEME"),
  "Լուսավոր": entry("Светлая", "Light"),
  "Մութ": entry("Темная", "Dark"),
  "Կապ մեզ հետ": entry("Свяжитесь с нами", "Contact us"),
  "Հասցե": entry("Адрес", "Address"),
  "Երևան, 0010, Տիգրան Մեծի պող. 4": entry("Ереван, 0010, пр. Тиграна Меца, 4", "4 Tigran Mets Ave., Yerevan, 0010"),
  "Հեռախոս": entry("Телефон", "Phone"),
  "Էլ. փոստ": entry("Эл. почта", "Email"),
  "Հղումներ": entry("Ссылки", "Links"),
  "Սոցիալական Ցանցեր": entry("Социальные сети", "Social networks"),
  "Պատճենել հասցեն": entry("Скопировать адрес", "Copy address"),
  "Պատճենել հեռախոսահամարը": entry("Скопировать номер телефона", "Copy phone number"),
  "Պատճենել էլ. փոստը": entry("Скопировать эл. почту", "Copy email"),
  "Սեղմեք պատճենելու համար": entry("Нажмите, чтобы скопировать", "Click to copy"),
};

const projectTranslations = {
  "Վանաձոր | Մարզ Լոռի, համայնք Վանաձոր, քաղաք Վանաձոր, Նիզամու փողոց 53/3 մասնաշենք": entry(
    "Ванадзор | Лорийская область, община Ванадзор, город Ванадзор, ул. Низаму, корпус 53/3",
    "Vanadzor | Lori Province, Vanadzor community, Vanadzor city, Nizamu Street 53/3 building",
  ),
  "Մարզ Լոռի, համայնք Վանաձոր, քաղաք Վանաձոր, Նիզամու փողոց 53/3 մասնաշենք": entry(
    "Лорийская область, община Ванадзор, город Ванадзор, ул. Низаму, корпус 53/3",
    "Lori Province, Vanadzor community, Vanadzor city, Nizamu Street 53/3 building",
  ),
  "ՄԱՐԶ ԼՈՌԻ, ՀԱՄԱՅՆՔ ՎԱՆԱՁՈՐ, ՔԱՂԱՔ ՎԱՆԱՁՈՐ, ՆԻԶԱՄՈՒ ՓՈՂՈՑ 53/3 ՄԱՍՆԱՇԵՆՔ": entry(
    "ЛОРИЙСКАЯ ОБЛАСТЬ, ОБЩИНА ВАНАДЗОР, ГОРОД ВАНАДЗОР, УЛ. НИЗАМУ, КОРПУС 53/3",
    "LORI PROVINCE, VANADZOR COMMUNITY, VANADZOR CITY, NIZAMU STREET 53/3 BUILDING",
  ),
  "1․Գոյություն ունեցող շինությունները ամբողջությամբ ենթակա են քանդման": entry(
    "1. Существующие строения подлежат полному демонтажу.",
    "1. The existing structures are subject to complete demolition.",
  ),
  "2․Կառուցապատման մակերես 34.1%, կանաչապատ մակերես 45%, անջրաթափանց մակերես 20.9 %, շենքի հարկայնություն 8, շենքի հարկերի քանակը 0․000 նիշից ցածր 1, կառուցապատման մակերես 22701.7 մ², կանաչապատ մակերես 3190 մ², անջրաթափանց մակերես 1480.5 մ², առաջին հարկի կառուցապատման մակերես 2419․5 մ², ստորգետնյա հարկի ընդհանուր մակերես 5184.7 մ², վերգետնյա կառուցվող ընդհանուր մակերես 17517 մ², ավտոկայանատեղերի քանակ 153, բնակարանների քանակ 192": entry(
    "2. Площадь застройки - 34.1%, озелененная территория - 45%, водонепроницаемая территория - 20.9%; этажность здания - 8, количество этажей ниже отметки 0.000 - 1, общая площадь застройки - 22 701.7 м², озелененная площадь - 3 190 м², водонепроницаемая площадь - 1 480.5 м², площадь застройки первого этажа - 2 419.5 м², общая площадь подземного этажа - 5 184.7 м², общая строящаяся надземная площадь - 17 517 м², количество парковочных мест - 153, количество квартир - 192.",
    "2. Building footprint ratio - 34.1%, landscaped area - 45%, impermeable area - 20.9%; building height - 8 storeys, floors below the 0.000 mark - 1, total built-up area - 22,701.7 sq. m, landscaped area - 3,190 sq. m, impermeable area - 1,480.5 sq. m, first-floor footprint - 2,419.5 sq. m, total underground floor area - 5,184.7 sq. m, total above-ground construction area - 17,517 sq. m, parking spaces - 153, apartments - 192.",
  ),
};

const translations = {
  ...commonTranslations,
  ...projectTranslations,
  ...makeImageTranslations(),
  ...makeDownloadTranslations(),
};

function getSavedLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(saved) ? saved : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function saveLanguage(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Ignore localStorage failures in restricted browser modes.
  }
}

function getTranslation(source, lang = currentLanguage) {
  if (lang === DEFAULT_LANGUAGE) return source;
  return translations[normalizeText(source)]?.[lang] || source;
}

function getLanguageLogo(lang = currentLanguage) {
  const safeLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
  return languageLogos[safeLang] ?? languageLogos[DEFAULT_LANGUAGE];
}

function cssString(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function applyCssText(lang) {
  document.documentElement.style.setProperty(
    "--i18n-view-label",
    cssString(lang === "hy" ? "👁 Դիտել" : lang === "ru" ? "👁 Смотреть" : "👁 View"),
  );
  document.documentElement.style.setProperty(
    "--i18n-loading-label",
    cssString(lang === "hy" ? "Բեռնում..." : lang === "ru" ? "Загрузка..." : "Loading..."),
  );
}

function applyLanguageLogos(lang) {
  document.querySelectorAll("[data-i18n-logo]").forEach((image) => {
    image.src = getLanguageLogo(lang);
  });
}

function translateTextNodes(lang) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "SVG"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return ARMENIAN_RE.test(node.nodeValue) || textNodeOriginals.has(node)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    if (!textNodeOriginals.has(node)) textNodeOriginals.set(node, node.nodeValue);
    const original = textNodeOriginals.get(node);
    node.nodeValue = lang === DEFAULT_LANGUAGE ? original : getTranslation(original, lang);
  });
}

function getAttributeOriginals(element) {
  if (!attributeOriginals.has(element)) attributeOriginals.set(element, new Map());
  return attributeOriginals.get(element);
}

function translateAttributes(lang) {
  document.querySelectorAll("*").forEach((element) => {
    const originals = getAttributeOriginals(element);
    TRANSLATABLE_ATTRIBUTES.forEach((attr) => {
      if (!element.hasAttribute(attr)) return;
      if (!originals.has(attr)) {
        const value = element.getAttribute(attr);
        if (!ARMENIAN_RE.test(value)) return;
        originals.set(attr, value);
      }
      const original = originals.get(attr);
      element.setAttribute(attr, lang === DEFAULT_LANGUAGE ? original : getTranslation(original, lang));
    });
  });
}

function translateDocumentTitle(lang) {
  if (!originalDocumentTitle) originalDocumentTitle = document.title;
  document.title = lang === DEFAULT_LANGUAGE ? originalDocumentTitle : getTranslation(originalDocumentTitle, lang);
}

function updateLanguageButtons(lang) {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    const isActive = button.dataset.lang === lang;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function translateDynamicText(lang = currentLanguage) {
  document.querySelectorAll(".smart-download").forEach((element) => {
    const progressMatch = element.textContent.trim().match(/^Ներբեռնում\.\.\.\s*(\d+)%$/);
    if (progressMatch) {
      const label = lang === "hy" ? "Ներբեռնում..." : lang === "ru" ? "Загрузка..." : "Downloading...";
      element.textContent = `${label} ${progressMatch[1]}%`;
    }
  });

  const toast = document.getElementById("toast");
  if (toast?.textContent.trim() === "✓ Պատճենված") {
    toast.textContent = `✓ ${lang === "hy" ? "Պատճենված" : lang === "ru" ? "Скопировано" : "Copied"}`;
  }
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function showCopyToast() {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = `✓ ${currentLanguage === "hy" ? "Պատճենված" : currentLanguage === "ru" ? "Скопировано" : "Copied"}`;
  if (toast.classList.contains("show")) return;

  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 800);
}

function copyContactValue(element) {
  const number = element.dataset.number;
  const text = element.dataset.text || number;

  if (number && isMobileDevice()) {
    window.location.href = `tel:${number}`;
    return;
  }

  if (!text || !navigator.clipboard) return;
  navigator.clipboard.writeText(text).then(showCopyToast);
}

function initContactCopyHandlers() {
  document.querySelectorAll(".contact-value").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      copyContactValue(element);
    }, true);

    element.addEventListener("keypress", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      copyContactValue(element);
    }, true);
  });
}

function initDynamicTextObservers() {
  if (typeof MutationObserver === "undefined") return;

  const observer = new MutationObserver(() => translateDynamicText());
  document.querySelectorAll(".smart-download, #toast").forEach((element) => {
    observer.observe(element, { childList: true, characterData: true, subtree: true });
  });
}

function applyLanguage(lang, options = {}) {
  const safeLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
  currentLanguage = safeLang;
  if (options.persist !== false) saveLanguage(safeLang);

  document.documentElement.lang = safeLang;
  translateDocumentTitle(safeLang);
  translateTextNodes(safeLang);
  translateAttributes(safeLang);
  updateLanguageButtons(safeLang);
  applyLanguageLogos(safeLang);
  applyCssText(safeLang);
  translateDynamicText(safeLang);

  window.dispatchEvent(
    new CustomEvent("prospect24:languagechange", {
      detail: { lang: safeLang },
    }),
  );
}

function initLanguageSwitcher() {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.lang));
  });

  applyLanguage(currentLanguage, { persist: false });
  initContactCopyHandlers();
  initDynamicTextObservers();
}

window.prospectI18n = {
  applyLanguage,
  getLanguage: () => currentLanguage,
  getLogoSrc: getLanguageLogo,
  t: getTranslation,
  translations,
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLanguageSwitcher);
} else {
  initLanguageSwitcher();
}
