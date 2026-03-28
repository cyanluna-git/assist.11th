const page = document.body.dataset.page;
const shell = document.querySelector(".site-shell");
const yearTarget = document.querySelector("[data-year]");
const storySections = document.querySelectorAll(".story-section[id]");

const homeHref = (section) => (page === "home" ? `#${section}` : `./index.html#${section}`);

const sidebarGroups = [
  {
    id: "main",
    title: "메인",
    items: [
      { label: "홈", href: "./index.html" },
      { label: "핵심 메시지", href: homeHref("message"), sectionId: "message" },
      { label: "필수 개념", href: homeHref("concepts"), sectionId: "concepts" },
      { label: "사전 준비", href: homeHref("setup"), sectionId: "setup" },
      { label: "가입과 설치", href: homeHref("guides"), sectionId: "guides" },
      { label: "로드맵", href: homeHref("roadmap"), sectionId: "roadmap" },
      { label: "첫 프로젝트", href: homeHref("project"), sectionId: "project" },
      { label: "GitHub 운영", href: homeHref("workspace"), sectionId: "workspace" },
    ],
  },
  {
    id: "setup",
    title: "가입과 설치",
    items: [
      { label: "계정 가입", href: "./accounts.html" },
      { label: "Git 설치", href: "./install-git.html" },
      { label: "Node.js 설치", href: "./install-node.html" },
      { label: "Python 설치", href: "./install-python.html" },
      { label: "WSL 설치", href: "./install-wsl.html" },
      { label: "VS Code 설치", href: "./install-vscode.html" },
      { label: "Antigravity 설치", href: "./install-antigravity.html" },
    ],
  },
  {
    id: "weeks",
    title: "주차별 교안",
    items: [
      { label: "1주차 비설치형", href: "./week-1.html" },
      { label: "2주차 IDE와 API", href: "./week-2.html" },
      { label: "3주차 Next.js와 배포", href: "./week-3.html" },
      { label: "4주차 WSL과 CLI", href: "./week-4.html" },
      { label: "5주차 백엔드와 DB", href: "./week-5.html" },
    ],
  },
  {
    id: "github",
    title: "GitHub",
    items: [
      { label: "assist-11th 참여 안내", href: "./github-workspace.html" },
      {
        label: "assist-11th 조직 바로가기",
        href: "https://github.com/assist-11th",
        external: true,
      },
    ],
  },
];

const sidebarQuickStartMap = {
  home: {
    title: "처음이면 여기부터",
    description: "가입 확인 후 1주차로 시작",
    primary: { label: "1주차 바로가기", href: "./week-1.html" },
    secondary: { label: "계정 가입 확인", href: "./accounts.html" },
  },
  accounts: {
    title: "먼저 끝내기",
    description: "GitHub Vercel Replit 로그인 확인",
    primary: { label: "assist-11th 열기", href: "https://github.com/assist-11th", external: true },
    secondary: { label: "1주차로 이동", href: "./week-1.html" },
  },
  "install-git": {
    title: "설치 다음 단계",
    description: "Git 설치 후 VS Code와 2주차 준비",
    primary: { label: "VS Code 설치", href: "./install-vscode.html" },
    secondary: { label: "2주차 교안", href: "./week-2.html" },
  },
  "install-node": {
    title: "설치 다음 단계",
    description: "Node 설치 후 Next.js 준비",
    primary: { label: "3주차 교안", href: "./week-3.html" },
    secondary: { label: "VS Code 설치", href: "./install-vscode.html" },
  },
  "install-python": {
    title: "설치 다음 단계",
    description: "Python은 WSL과 함께 준비",
    primary: { label: "WSL 설치", href: "./install-wsl.html" },
    secondary: { label: "메인으로 이동", href: "./index.html" },
  },
  "install-wsl": {
    title: "설치 다음 단계",
    description: "WSL 설치 후 4주차로 진입",
    primary: { label: "4주차 교안", href: "./week-4.html" },
    secondary: { label: "VS Code 설치", href: "./install-vscode.html" },
  },
  "install-vscode": {
    title: "설치 다음 단계",
    description: "IDE 준비 후 2주차와 3주차 진행",
    primary: { label: "2주차 교안", href: "./week-2.html" },
    secondary: { label: "3주차 교안", href: "./week-3.html" },
  },
  "install-antigravity": {
    title: "도구 선택 자유",
    description: "기본 흐름은 동일",
    primary: { label: "2주차 교안", href: "./week-2.html" },
    secondary: { label: "메인으로 이동", href: "./index.html" },
  },
  "week-1": {
    title: "이번 주 추천",
    description: "Replit 가입 후 프롬프트 3종 실행",
    primary: { label: "Replit 가입", href: "https://replit.com/", external: true },
    secondary: { label: "계정 가이드", href: "./accounts.html" },
  },
  "week-2": {
    title: "이번 주 추천",
    description: "IDE 열기 API 연결 push 완료",
    primary: { label: "assist-11th 열기", href: "https://github.com/assist-11th", external: true },
    secondary: { label: "Git 설치 가이드", href: "./install-git.html" },
  },
  "week-3": {
    title: "이번 주 추천",
    description: "Next.js 시작 후 Vercel 배포",
    primary: { label: "Vercel 가입", href: "https://vercel.com/signup", external: true },
    secondary: { label: "Node.js 설치", href: "./install-node.html" },
  },
  "week-4": {
    title: "이번 주 추천",
    description: "WSL에서 clone install dev 실행",
    primary: { label: "WSL 가이드", href: "./install-wsl.html" },
    secondary: { label: "assist-11th 열기", href: "https://github.com/assist-11th", external: true },
  },
  "week-5": {
    title: "이번 주 추천",
    description: "저장 기능과 backend 감각 익히기",
    primary: { label: "필수 개념 보기", href: "./index.html#concepts" },
    secondary: { label: "4주차 복습", href: "./week-4.html" },
  },
  "github-workspace": {
    title: "가장 먼저 할 일",
    description: "assist-11th 열기 초대 수락",
    primary: { label: "assist-11th 열기", href: "https://github.com/assist-11th", external: true },
    secondary: { label: "계정 가이드", href: "./accounts.html" },
  },
};

const buildSidebar = () => {
  if (!shell) return;

  shell.classList.add("has-sidebar");

  const toggle = document.createElement("button");
  toggle.className = "sidebar-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-label", "메뉴 열기");
  toggle.setAttribute("aria-expanded", "false");
  toggle.textContent = "목차";

  const aside = document.createElement("aside");
  aside.className = "sidebar";
  aside.setAttribute("aria-label", "사이드 메뉴");

  const quickStart = sidebarQuickStartMap[page] || sidebarQuickStartMap.home;
  const renderQuickLink = (item, kind) => `
    <a
      class="quick-link quick-link-${kind}"
      href="${item.href}"
      ${item.external ? 'target="_blank" rel="noreferrer"' : ""}
    >${item.label}</a>
  `;

  aside.innerHTML = `
    <div class="sidebar-head">
      <a class="brand sidebar-brand" href="./index.html">
        <span class="brand-mark">VC</span>
        <span class="brand-copy">
          <strong>Vibe Coding 101</strong>
          <small>질문에서 작업으로</small>
        </span>
      </a>
      <p class="sidebar-note">MBA · 스타트업 수강생용</p>
      <a class="sidebar-badge" href="https://github.com/assist-11th" target="_blank" rel="noreferrer">
        <span>GitHub Org</span>
        <strong>assist-11th</strong>
      </a>
      <section class="quick-start-card">
        <p class="quick-start-kicker">${quickStart.title}</p>
        <strong>${quickStart.description}</strong>
        <div class="quick-start-actions">
          ${renderQuickLink(quickStart.primary, "primary")}
          ${renderQuickLink(quickStart.secondary, "ghost")}
        </div>
      </section>
    </div>
    <nav class="sidebar-nav" aria-label="전체 메뉴">
      ${sidebarGroups
        .map(
          (group) => `
            <section class="sidebar-group" data-group="${group.id}">
              <button class="sidebar-group-toggle" type="button" aria-expanded="true">
                <span class="sidebar-group-title">${group.title}</span>
                <span class="sidebar-group-caret">+</span>
              </button>
              <ul class="sidebar-list">
                ${group.items
                  .map(
                    (item) => `
                      <li>
                        <a
                          href="${item.href}"
                          class="sidebar-link${item.sectionId ? " sidebar-section-link" : ""}"
                          ${item.sectionId ? `data-section="${item.sectionId}"` : ""}
                          ${item.external ? 'target="_blank" rel="noreferrer"' : ""}
                        >${item.label}</a>
                      </li>
                    `
                  )
                  .join("")}
              </ul>
            </section>
          `
        )
        .join("")}
    </nav>
  `;

  shell.prepend(aside);
  shell.prepend(toggle);
};

buildSidebar();

const navLinks = document.querySelectorAll(".sidebar-link");
const navToggle = document.querySelector(".sidebar-toggle");
const groupSections = document.querySelectorAll(".sidebar-group");
const groupToggles = document.querySelectorAll(".sidebar-group-toggle");

const getActiveGroupIds = () => {
  if (page === "home") return new Set(["main", "weeks"]);
  if (page.startsWith("week-")) return new Set(["weeks", "setup"]);
  if (page.startsWith("install-") || page === "accounts") return new Set(["setup", "weeks"]);
  if (page === "github-workspace") return new Set(["github", "weeks"]);
  return new Set(["main"]);
};

const activeGroupIds = getActiveGroupIds();

groupSections.forEach((section) => {
  const isOpen = activeGroupIds.has(section.dataset.group) || section.dataset.group === "main";
  section.classList.toggle("is-collapsed", !isOpen);
});

groupToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const section = toggle.closest(".sidebar-group");
    if (!section) return;
    const isCollapsed = section.classList.toggle("is-collapsed");
    toggle.setAttribute("aria-expanded", String(!isCollapsed));
  });
});

navLinks.forEach((link) => {
  const href = link.getAttribute("href");
  if (!href) return;
  if (
    href.endsWith(`${page}.html`) ||
    (page === "home" && href === "./index.html") ||
    (page === "home" && href === "#message")
  ) {
    link.classList.add("is-active");
    const group = link.closest(".sidebar-group");
    if (group) group.classList.add("has-active");
  }
});

if (navToggle && shell) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    shell.classList.toggle("nav-open", !expanded);
  });
}

if (page === "home" && storySections.length > 0) {
  const sectionMap = new Map();

  navLinks.forEach((link) => {
    const sectionId = link.dataset.section;
    if (sectionId) {
      sectionMap.set(sectionId, link);
      link.addEventListener("click", () => {
        if (shell) shell.classList.remove("nav-open");
        if (navToggle) navToggle.setAttribute("aria-expanded", "false");
      });
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach((link) => {
        if (link.dataset.section) {
          link.classList.remove("is-active");
        }
      });
      groupSections.forEach((group) => {
        if (group.dataset.group === "main") {
          group.classList.remove("has-active");
        }
      });
      const activeLink = sectionMap.get(visible.target.id);
      if (activeLink) {
        activeLink.classList.add("is-active");
        const activeGroup = activeLink.closest(".sidebar-group");
        if (activeGroup) activeGroup.classList.add("has-active");
      }
    },
    {
      rootMargin: "-20% 0px -55% 0px",
      threshold: [0.2, 0.4, 0.7],
    }
  );

  storySections.forEach((section) => observer.observe(section));
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (shell) shell.classList.remove("nav-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  });
});

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}
