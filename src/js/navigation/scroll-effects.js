document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.main-header');
  const logo = document.querySelector("#headerLogo");
  const logoContainer = document.querySelector(".logo");
  const defaultHeaderLogo = "/images/Prospect24-logo.png";

  const getCurrentLanguageLogo = () => {
    const currentLanguage = window.prospectI18n?.getLanguage?.();
    return window.prospectI18n?.getLogoSrc?.(currentLanguage) || "/images/logo.webp";
  };

  const checkHeaderScroll = () => {
    if (header && window.scrollY > 0) {
      header.classList.add('scrolled');
      if (logo) logo.src = getCurrentLanguageLogo();
      logoContainer?.classList.add("scrolled");
    }
    else if (header) {
      header.classList.remove('scrolled');
      if (logo) logo.src = defaultHeaderLogo;
      logoContainer?.classList.remove("scrolled");
    }
  };

  window.addEventListener('scroll', checkHeaderScroll);
  window.addEventListener("prospect24:languagechange", checkHeaderScroll);

  checkHeaderScroll();
});
