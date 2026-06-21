const form = document.querySelector("#contact-form");
const statusEl = document.querySelector("#form-status");
const articleSearch = document.querySelector("#article-search");
const articleList = document.querySelector("#article-list");
const categoryFilter = document.querySelector("#category-filter");
const tagFilter = document.querySelector("#tag-filter");
const articleEmpty = document.querySelector("#article-empty");
const revealTargets = document.querySelectorAll(
  ".hero .eyebrow, .hero h1, .hero-lede, .hero-actions, .signal-panel, .page-hero .eyebrow, .page-hero h1, .page-hero p, .resume-snapshot, .article-search, .category-filter, .tag-filter, .section-head, .card, .timeline-item, .article-card, .contact-copy, .contact-form, .post h1, .post-lede, .post-cover"
);
const nav = document.querySelector(".nav");
const siteConfig = window.SITE_CONFIG || {};

revealTargets.forEach((target, index) => {
  target.classList.add("reveal");
  target.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const syncNavShadow = () => {
  nav?.classList.toggle("is-scrolled", window.scrollY > 8);
};

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      if (window.emailjs) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

const sendWithEmailJsBrowser = async (payload) => {
  let emailjsConfig = siteConfig.emailjs;
  if (!emailjsConfig) {
    const apiBase = String(siteConfig.contactApiBase || "").replace(/\/+$/g, "");
    const configResponse = await fetch(`${apiBase}/api/contact-config`, {
      headers: { Accept: "application/json" },
    });

    if (!configResponse.ok) {
      throw new Error("emailjs config unavailable");
    }

    const config = await configResponse.json();
    emailjsConfig = config.emailjs;
  }

  if (!emailjsConfig?.serviceId || !emailjsConfig?.templateId || !emailjsConfig?.publicKey) {
    throw new Error("emailjs config incomplete");
  }

  await loadScript("https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js");

  if (!window.emailjs) {
    throw new Error("emailjs sdk unavailable");
  }

  window.emailjs.init(emailjsConfig.publicKey);

  const combinedMessage = `发件人姓名：${payload.name}\n发件人邮箱：${payload.email}\n\n消息内容：\n${payload.message}`;

  await window.emailjs.send(emailjsConfig.serviceId, emailjsConfig.templateId, {
    from_name: payload.name,
    from_email: payload.email,
    message: combinedMessage,
    to_email: emailjsConfig.toEmail || "",
    reply_to: payload.email,
  });
};

syncNavShadow();
window.addEventListener("scroll", syncNavShadow, { passive: true });

if (articleList) {
  let activeCategory = "all";
  let activeTag = "all";

  const filterArticles = () => {
    const query = articleSearch?.value.trim().toLowerCase() || "";
    let visibleCount = 0;

    articleList.querySelectorAll(".article-card").forEach((card) => {
      const matchesCategory = activeCategory === "all" || card.dataset.category === activeCategory;
      const tags = (card.dataset.tags || "").split("|").filter(Boolean);
      const matchesTag = activeTag === "all" || tags.includes(activeTag);
      const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
      const isVisible = matchesCategory && matchesTag && matchesQuery;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (articleEmpty) articleEmpty.hidden = visibleCount > 0;
  };

  articleSearch?.addEventListener("input", filterArticles);

  categoryFilter?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category || "all";
    categoryFilter.querySelectorAll(".category-button").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    filterArticles();
  });

  tagFilter?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tag]");
    if (!button) return;
    activeTag = button.dataset.tag || "all";
    tagFilter.querySelectorAll(".tag-button").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    filterArticles();
  });

  filterArticles();
}

if (form && statusEl) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type='submit']");
    const original = button.textContent;
    button.disabled = true;
    button.textContent = "发送中...";
    statusEl.textContent = "";

    const payload = Object.fromEntries(new FormData(form));

    try {
      const apiBase = String(siteConfig.contactApiBase || "").replace(/\/+$/g, "");
      const response = await fetch(`${apiBase}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("contact api unavailable");
      }

      statusEl.textContent = "消息已发送，我会尽快回复。";
      form.reset();
    } catch (_error) {
      try {
        await sendWithEmailJsBrowser(payload);
        statusEl.textContent = "消息已发送，我会尽快回复。";
        form.reset();
      } catch (_fallbackError) {
        statusEl.textContent = "邮件服务暂时不可用，请稍后再试。";
      }
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  });
}
