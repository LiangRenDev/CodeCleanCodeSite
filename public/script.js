document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  initMobileNav();
  initScrollAnimations(reduceMotion);
  initNavState();
  initFormHandling();
  initChatbot();
  initTerminal(reduceMotion);
  setCurrentYear();
});

function setCurrentYear() {
  const yearElement = document.getElementById("currentYear");
  if (yearElement) yearElement.textContent = String(new Date().getFullYear());
}

function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (!toggle || !menu) return;

  const label = toggle.querySelector(".visually-hidden");

  const setOpen = (open) => {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (label) label.textContent = open ? "Close menu" : "Open menu";
    document.body.classList.toggle("nav-open", open);
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

function initScrollAnimations(reduceMotion) {
  if (reduceMotion) {
    document.querySelectorAll(".stat-value").forEach((stat) => {
      stat.textContent = stat.dataset.target || stat.textContent;
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("active");
        if (entry.target.classList.contains("hero-stats")) animateCounters();
      });
    },
    { threshold: 0.15 },
  );

  document.querySelectorAll(".services, .about, .contact, .service-card").forEach((element, index) => {
    element.classList.add("reveal");
    if (element.classList.contains("service-card")) {
      element.style.transitionDelay = `${index * 0.08}s`;
    }
    observer.observe(element);
  });

  const stats = document.querySelector(".hero-stats");
  if (stats) {
    const rect = stats.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) animateCounters();
    observer.observe(stats);
  }
}

let countersAnimated = false;

function animateCounters() {
  if (countersAnimated) return;
  countersAnimated = true;

  document.querySelectorAll(".stat-value").forEach((stat) => {
    const target = Number.parseFloat(stat.dataset.target || "0");
    const steps = 48;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const counter = window.setInterval(() => {
      step += 1;
      current += increment;
      if (step >= steps) {
        stat.textContent = formatStat(target, target);
        window.clearInterval(counter);
      } else {
        stat.textContent = formatStat(current, target);
      }
    }, 32);
  });
}

function formatStat(value, target) {
  if (Number.isInteger(target)) return String(Math.round(Math.min(value, target)));
  return Math.min(value, target).toFixed(1);
}

function initNavState() {
  const nav = document.querySelector(".nav");
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);

    let current = "";
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 120) current = section.id;
    });

    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${current}`;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initFormHandling() {
  const form = document.getElementById("contactForm");
  if (!(form instanceof HTMLFormElement)) return;

  const status = document.getElementById("formStatus");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector(".submit-btn");
    if (!(submitBtn instanceof HTMLButtonElement)) return;

    const original = submitBtn.innerHTML;
    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      company: form.company.value.trim(),
      message: form.message.value.trim(),
      website: form.website.value,
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus(status, "Name, email, and a message are required.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    setStatus(status, "", "");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        throw new Error(result.error || "The message could not be sent.");
      }

      form.reset();
      submitBtn.textContent = "Message sent";
      setStatus(status, "Thank you. We'll reply by email.", "success");
      window.setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = original;
      }, 2500);
    } catch (error) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = original;
      const message = error instanceof Error ? error.message : "The message could not be sent.";
      setStatus(status, message, "error");
    }
  });
}

function setStatus(status, message, type) {
  if (!status) return;
  status.textContent = message;
  status.className = `form-status${type ? ` is-${type}` : ""}`;
}

function initTerminal(reduceMotion) {
  const typing = document.getElementById("typingCommand");
  if (!typing) return;
  const text = typing.dataset.text || "";
  if (reduceMotion) {
    typing.textContent = text;
    return;
  }

  let index = 0;
  typing.textContent = "";
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.textContent = "_";
  typing.append(cursor);

  const timer = window.setInterval(() => {
    index += 1;
    typing.textContent = text.slice(0, index);
    typing.append(cursor);
    if (index >= text.length) window.clearInterval(timer);
  }, 90);
}

function initChatbot() {
  const toggle = document.getElementById("chatbotToggle");
  const chatWindow = document.getElementById("chatbotWindow");
  const close = document.getElementById("chatbotClose");
  const form = document.getElementById("chatbotForm");
  const input = document.getElementById("chatbotInput");
  const toggleLabel = toggle?.querySelector(".visually-hidden");
  if (!toggle || !chatWindow || !(form instanceof HTMLFormElement) || !(input instanceof HTMLInputElement)) return;

  const history = [];

  const setOpen = (open) => {
    chatWindow.hidden = !open;
    chatWindow.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (toggleLabel) toggleLabel.textContent = open ? "Close chat" : "Open chat";
    if (open) input.focus();
  };

  toggle.addEventListener("click", () => setOpen(chatWindow.hidden));
  close?.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !chatWindow.hidden) setOpen(false);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, "user");
    history.push({ role: "user", content: message });
    input.value = "";
    showTypingIndicator();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-12) }),
      });
      const data = await response.json().catch(() => ({}));
      removeTypingIndicator();
      if (!response.ok) {
        addMessage(data.error || "The assistant could not reply.", "bot");
        history.pop();
        return;
      }
      const reply = data.choices?.[0]?.message?.content || "No response received.";
      history.push({ role: "assistant", content: reply });
      addMessage(reply, "bot");
    } catch {
      removeTypingIndicator();
      history.pop();
      addMessage("The assistant could not be reached. Please use the contact form.", "bot");
    }
  });
}

function addMessage(content, sender) {
  const messages = document.getElementById("chatbotMessages");
  if (!messages) return;
  const message = document.createElement("div");
  message.className = `chatbot-message ${sender}`;
  const body = document.createElement("div");
  body.className = "message-content";
  body.textContent = content;
  message.append(body);
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
}

function showTypingIndicator() {
  const messages = document.getElementById("chatbotMessages");
  if (!messages) return;
  const typing = document.createElement("div");
  typing.className = "chatbot-message bot typing";
  typing.id = "typingIndicator";
  const body = document.createElement("div");
  body.className = "message-content";
  typing.append(body);
  messages.append(typing);
  messages.scrollTop = messages.scrollHeight;
}

function removeTypingIndicator() {
  document.getElementById("typingIndicator")?.remove();
}
