const THEME_KEY = "habit-tracker:v1";
const FINANCE_KEY = "habit-tracker:finance:v1";

const CATEGORIES = [
  { id: "needs", label: "Қажеттілік / Нужды", icon: "🏠" },
  { id: "wants", label: "Қалау / Желания", icon: "✨" },
  { id: "save", label: "Жинақ / Накопления", icon: "💎" },
  { id: "learn", label: "Білім / Образование", icon: "📚" },
  { id: "give", label: "Қайырымдылық / Благотворительность", icon: "🤝" },
  { id: "work", label: "Жұмыс кірісі / Доход", icon: "💼" },
];

const PLAN = [
  { id: "needs", kk: "Қажеттілік", ru: "Нужды", pct: 50, color: "bg-sky-500" },
  { id: "wants", kk: "Қалау", ru: "Желания", pct: 30, color: "bg-violet-500" },
  { id: "save", kk: "Өзіңізге 20%", ru: "Себе / инвестиции", pct: 20, color: "bg-emerald-500" },
];

const COURSE = [
  {
    kk: "1. Алдымен өзіңізге төлеңіз — 10%",
    ru: "Сначала заплатите себе",
    bodyKk:
      "«Вавилонның ең бай адамы» кітабы: кірістің кемінде 10%-ын бірден жинаққа алыңыз. 300 000 ₸ болса — 30 000 ₸ тимеңіз.",
    bodyRu:
      "The Richest Man in Babylon: сразу откладывайте минимум 10% дохода. С 300 000 ₸ это 30 000 ₸.",
  },
  {
    kk: "2. Ереже 50 / 30 / 20",
    ru: "Правило 50/30/20",
    bodyKk:
      "Элизабет Уоррен: 50% — үй, тамақ, жол. 30% — қалау. 20% — жинақ пен қарыз. Барлығы теңгемен есептеледі.",
    bodyRu:
      "Elizabeth Warren: 50% нужды, 30% желания, 20% накопления. Суммы считаются в тенге.",
  },
  {
    kk: "3. Уоррен Баффет: шығынды кірістен төмен ұстаңыз",
    ru: "Баффет: тратьте меньше, чем зарабатываете",
    bodyKk:
      "Бай адамдар сән үшін емес, қалған ақшаны өсіру үшін үнемдейді. Үлкен сатып алуды 24 сағат күтіңіз.",
    bodyRu:
      "Богатые копят разницу между доходом и расходом. Крупную покупку отложите на сутки.",
  },
  {
    kk: "4. «Бай әке, кедей әке»: актив сатып алыңыз",
    ru: "Rich Dad Poor Dad: покупайте активы",
    bodyKk:
      "Кийосаки: пассив (телефон, киім) ақша алады. Актив (білім, құрал, шағын бизнес) ақша әкеледі.",
    bodyRu:
      "Кийосаки: пассив забирает деньги, актив приносит. В тенге думайте: эта трата кормит вас завтра?",
  },
  {
    kk: "5. 6 құмыра әдісі (Харв Экер)",
    ru: "Метод 6 кувшинов",
    bodyKk:
      "55% күнделікті өмір, 10% жинақ, 10% ұзақ мақсат, 10% білім, 10% рахат, 5% қайырымдылық.",
    bodyRu:
      "55% жизнь, 10% подушка, 10% цели, 10% учёба, 10% удовольствие, 5% благотворительность.",
  },
];

const els = {
  form: document.getElementById("money-form"),
  title: document.getElementById("money-title"),
  amount: document.getElementById("money-amount"),
  type: document.getElementById("money-type"),
  category: document.getElementById("money-category"),
  list: document.getElementById("tx-list"),
  stats: document.getElementById("month-stats"),
  incomePlan: document.getElementById("income-plan"),
  planBars: document.getElementById("plan-bars"),
  course: document.getElementById("course-list"),
  themeToggle: document.getElementById("theme-toggle"),
  themeLabel: document.getElementById("theme-label"),
};

const state = loadFinance();

function loadTheme() {
  try {
    const parsed = JSON.parse(localStorage.getItem(THEME_KEY) || "{}");
    return parsed.theme === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function saveTheme(theme) {
  try {
    const parsed = JSON.parse(localStorage.getItem(THEME_KEY) || "{}");
    parsed.theme = theme;
    localStorage.setItem(THEME_KEY, JSON.stringify(parsed));
  } catch {
    localStorage.setItem(THEME_KEY, JSON.stringify({ theme, habits: [] }));
  }
}

function loadFinance() {
  try {
    const raw = localStorage.getItem(FINANCE_KEY);
    if (!raw) return { incomePlan: 300000, items: [] };
    const parsed = JSON.parse(raw);
    return {
      incomePlan: Number(parsed.incomePlan) || 300000,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return { incomePlan: 300000, items: [] };
  }
}

function saveFinance() {
  localStorage.setItem(FINANCE_KEY, JSON.stringify(state));
}

function formatTenge(value) {
  return `${new Intl.NumberFormat("kk-KZ").format(Math.round(value || 0))} ₸`;
}

function monthPrefix(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function thisMonthItems() {
  const prefix = monthPrefix();
  return state.items.filter((item) => item.date.startsWith(prefix));
}

function applyTheme() {
  const theme = loadTheme();
  document.documentElement.classList.toggle("dark", theme === "dark");
  els.themeLabel.textContent = theme === "dark" ? "Қараңғы" : "Ашық";
}

function renderCategories() {
  els.category.innerHTML = CATEGORIES.map(
    (item) => `<option value="${item.id}">${item.icon} ${item.label}</option>`
  ).join("");
}

function renderStats() {
  const month = thisMonthItems();
  const income = month.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = month.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const cards = [
    { label: "Кіріс / Доход", value: formatTenge(income) },
    { label: "Шығын / Расход", value: formatTenge(expense) },
    { label: "Қалдық / Остаток", value: formatTenge(income - expense) },
  ];
  els.stats.innerHTML = cards
    .map(
      (card) => `
      <article class="rounded-2xl border border-white/70 bg-white/75 px-4 py-4 shadow-soft backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
        <p class="text-xl font-semibold">${card.value}</p>
        <p class="mt-1 text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400">${card.label}</p>
      </article>
    `
    )
    .join("");
}

function renderPlan() {
  const income = Number(els.incomePlan.value) || 0;
  els.planBars.innerHTML = PLAN.map((row) => {
    const amount = (income * row.pct) / 100;
    return `
      <div>
        <div class="mb-1 flex justify-between text-xs">
          <span>${row.kk} / ${row.ru}</span>
          <span class="font-medium">${row.pct}% · ${formatTenge(amount)}</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
          <div class="progress-fill h-full ${row.color}" style="width:${row.pct}%"></div>
        </div>
      </div>
    `;
  }).join("");
}

function renderCourse() {
  els.course.innerHTML = COURSE.map(
    (lesson) => `
      <article class="rounded-2xl border border-slate-200/80 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/50">
        <p class="font-medium">${lesson.kk}</p>
        <p class="text-xs text-emerald-600 dark:text-emerald-400">${lesson.ru}</p>
        <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">${lesson.bodyKk}</p>
        <p class="mt-1 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">${lesson.bodyRu}</p>
      </article>
    `
  ).join("");
}

function categoryLabel(id) {
  return CATEGORIES.find((item) => item.id === id)?.label || id;
}

function renderList() {
  if (!state.items.length) {
    els.list.innerHTML = `
      <div class="rounded-3xl border border-dashed border-slate-300 bg-white/50 px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
        <p class="font-medium">Әзірге жазба жоқ</p>
        <p class="mt-1 text-sm text-slate-500">Пока нет записей. Добавьте доход или расход в тенге.</p>
      </div>
    `;
    return;
  }

  els.list.innerHTML = state.items
    .map((item) => {
      const plus = item.type === "income";
      return `
        <article class="habit-card flex items-center justify-between gap-3 rounded-3xl border border-white/80 bg-white/85 p-4 shadow-soft dark:border-zinc-800 dark:bg-zinc-900/75">
          <div>
            <p class="font-medium">${escapeHtml(item.title)}</p>
            <p class="text-xs text-slate-500 dark:text-zinc-400">${categoryLabel(item.category)} · ${item.date}</p>
          </div>
          <div class="flex items-center gap-3">
            <p class="font-semibold ${plus ? "text-emerald-500" : "text-rose-500"}">${plus ? "+" : "−"} ${formatTenge(item.amount)}</p>
            <button type="button" data-id="${item.id}" class="text-slate-400 hover:text-rose-500" aria-label="Жою">✕</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function render() {
  applyTheme();
  renderStats();
  renderPlan();
  renderCourse();
  renderList();
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const amount = Number(els.amount.value);
  const title = els.title.value.trim();
  if (!title || !amount) return;

  state.items.unshift({
    id: crypto.randomUUID(),
    title,
    amount,
    type: els.type.value,
    category: els.category.value,
    date: new Date().toISOString().slice(0, 10),
  });
  els.title.value = "";
  els.amount.value = "";
  saveFinance();
  render();
});

els.list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  state.items = state.items.filter((item) => item.id !== button.dataset.id);
  saveFinance();
  render();
});

els.incomePlan.value = state.incomePlan;
els.incomePlan.addEventListener("input", () => {
  state.incomePlan = Number(els.incomePlan.value) || 0;
  saveFinance();
  renderPlan();
});

els.themeToggle.addEventListener("click", () => {
  const next = loadTheme() === "dark" ? "light" : "dark";
  saveTheme(next);
  applyTheme();
});

renderCategories();
render();
