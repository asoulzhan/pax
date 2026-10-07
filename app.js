const STORAGE_KEY = "habit-tracker:v1";

const CATEGORIES = [
  { id: "health", label: "Денсаулық", icon: "💧", tone: "from-sky-400/20 to-cyan-300/10" },
  { id: "mind", label: "Ақыл", icon: "🧠", tone: "from-violet-400/20 to-fuchsia-300/10" },
  { id: "sport", label: "Спорт", icon: "💪", tone: "from-orange-400/20 to-amber-300/10" },
  { id: "learn", label: "Оқу", icon: "📚", tone: "from-indigo-400/20 to-blue-300/10" },
  { id: "work", label: "Жұмыс", icon: "💼", tone: "from-emerald-400/20 to-teal-300/10" },
  { id: "home", label: "Үй", icon: "🏠", tone: "from-rose-400/20 to-pink-300/10" },
  { id: "other", label: "Басқа", icon: "✨", tone: "from-slate-400/20 to-zinc-300/10" },
];

const TIPS = [
  "Әдетті өте кішкентай етіп бастаңыз. 2 минут та жеткілікті.",
  "Бір уақытта көп нәрсе қоспаңыз. 1–3 әдетпен жүріңіз.",
  "Әдетті күнделікті ырғаққа байлаңыз: таңғы шайдан кейін оқу.",
  "Бір күн өткізіп алсаңыз, ертең қайта бастаңыз. Серияны құтқаруға болады.",
  "Өзін-өзі дамыту — жарыс емес. Тұрақтылық нәтиже береді.",
];

const BOOKS = [
  {
    title: "Атомдық әдеттер",
    author: "Джеймс Клир",
    why: "Кішкентай әдеттермен өмірді қалай өзгертуге болатынын түсіндіреді.",
    categories: ["health", "sport", "learn", "other"],
  },
  {
    title: "Тиімді адамдардың 7 дағдысы",
    author: "Стивен Кови",
    why: "Жауапкершілік, мақсат және қарым-қатынас негіздері.",
    categories: ["work", "mind", "other"],
  },
  {
    title: "Терең жұмыс",
    author: "Кэл Ньюпорт",
    why: "Назарды жинақтау және маңызды іске уақыт бөлу.",
    categories: ["work", "learn"],
  },
  {
    title: "Ойлау тәсілі",
    author: "Кэрол Дуэк",
    why: "Қабілет өседі деген сенім арқылы дамуға көмектеседі.",
    categories: ["mind", "learn"],
  },
  {
    title: "Қазіргі күш",
    author: "Экхарт Толле",
    why: "Ойды тыныштандырып, бүгінгі сәтке оралуға үйретеді.",
    categories: ["mind", "health"],
  },
  {
    title: "Икигай",
    author: "Эктор Гарсия, Франсеск Миральес",
    why: "Өмірдегі мән мен күнделікті қуанышты қалай табуға болатыны.",
    categories: ["home", "other", "health"],
  },
  {
    title: "Адамның мән іздеуі",
    author: "Виктор Франкл",
    why: "Қиын кезде де мағына табу — өзін-өзі дамытудың терең негізі.",
    categories: ["mind", "other"],
  },
  {
    title: "Шексіздік",
    author: "Джим Квик",
    why: "Жақсы оқу, жады және миды күтіп ұстау әдістері.",
    categories: ["learn", "mind"],
  },
];

const WEEK_LABELS = ["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"];

const state = loadState();

const els = {
  form: document.getElementById("habit-form"),
  name: document.getElementById("habit-name"),
  category: document.getElementById("habit-category"),
  categoryPicker: document.getElementById("category-picker"),
  list: document.getElementById("habit-list"),
  stats: document.getElementById("stats"),
  themeToggle: document.getElementById("theme-toggle"),
  themeLabel: document.getElementById("theme-label"),
  tips: document.getElementById("tips-list"),
  books: document.getElementById("books-list"),
  booksHint: document.getElementById("books-hint"),
};

function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { theme: "light", habits: [], selectedCategory: "health" };
    }
    const parsed = JSON.parse(raw);
    return {
      theme: parsed.theme === "dark" ? "dark" : "light",
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      selectedCategory: parsed.selectedCategory || "health",
    };
  } catch {
    return { theme: "light", habits: [], selectedCategory: "health" };
  }
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      theme: state.theme,
      habits: state.habits,
      selectedCategory: state.selectedCategory,
    })
  );
}

function getCategory(id) {
  return CATEGORIES.find((item) => item.id === id) || CATEGORIES.at(-1);
}

function isDoneOn(habit, key) {
  return Boolean(habit.completions?.[key]);
}

function currentStreak(habit) {
  let streak = 0;
  let cursor = new Date();
  if (!isDoneOn(habit, todayKey(cursor))) {
    cursor = addDays(cursor, -1);
  }
  while (isDoneOn(habit, todayKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function bestStreak(habit) {
  const days = Object.keys(habit.completions || {})
    .filter((key) => habit.completions[key])
    .sort();
  let best = 0;
  let run = 0;
  let previous = null;
  for (const key of days) {
    if (!previous) {
      run = 1;
    } else {
      const prevDate = new Date(`${previous}T00:00:00`);
      const thisDate = new Date(`${key}T00:00:00`);
      const diff = Math.round((thisDate - prevDate) / 86400000);
      run = diff === 1 ? run + 1 : 1;
    }
    best = Math.max(best, run);
    previous = key;
  }
  return best;
}

function weekKeys() {
  const today = new Date();
  const weekday = (today.getDay() + 6) % 7;
  const monday = addDays(today, -weekday);
  return Array.from({ length: 7 }, (_, i) => todayKey(addDays(monday, i)));
}

function weekProgress(habit) {
  const keys = weekKeys();
  const done = keys.filter((key) => isDoneOn(habit, key)).length;
  return { done, total: 7, percent: Math.round((done / 7) * 100), keys };
}

function applyTheme() {
  document.documentElement.classList.toggle("dark", state.theme === "dark");
  els.themeLabel.textContent = state.theme === "dark" ? "Қараңғы" : "Ашық";
}

function renderStats() {
  const today = todayKey();
  const completedToday = state.habits.filter((habit) => isDoneOn(habit, today)).length;
  const longest = state.habits.reduce((max, habit) => Math.max(max, currentStreak(habit)), 0);

  const cards = [
    { label: "Әдеттер", value: state.habits.length },
    { label: "Бүгін", value: `${completedToday}/${state.habits.length || 0}` },
    { label: "Үздік серия", value: longest },
  ];

  els.stats.innerHTML = cards
    .map(
      (card) => `
      <article class="rounded-2xl border border-white/70 bg-white/75 px-3 py-3 text-center shadow-soft backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
        <p class="text-xl font-semibold">${card.value}</p>
        <p class="mt-0.5 text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400">${card.label}</p>
      </article>
    `
    )
    .join("");
}

function setCategory(id) {
  state.selectedCategory = id;
  els.category.value = id;
  saveState();
  renderCategoryPicker();
  renderBooks();
}

function renderCategoryPicker() {
  els.category.value = state.selectedCategory;
  els.categoryPicker.innerHTML = CATEGORIES.map((item) => {
    const selected = item.id === state.selectedCategory;
    return `
      <button
        type="button"
        role="option"
        aria-selected="${selected}"
        data-category="${item.id}"
        class="category-chip flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-sm transition ${
          selected
            ? "border-violet-400 bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-soft"
            : `border-slate-200 bg-gradient-to-br ${item.tone} hover:-translate-y-0.5 hover:border-violet-300 dark:border-zinc-700 dark:hover:border-violet-500/50`
        }"
      >
        <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 text-base dark:bg-zinc-950/50">${item.icon}</span>
        <span class="font-medium">${item.label}</span>
      </button>
    `;
  }).join("");
}

function renderTips() {
  els.tips.innerHTML = TIPS.map(
    (tip) => `
      <li class="flex gap-2">
        <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500"></span>
        <span>${tip}</span>
      </li>
    `
  ).join("");
}

function renderBooks() {
  const category = getCategory(state.selectedCategory);
  const books = BOOKS.filter((book) => book.categories.includes(state.selectedCategory));
  els.booksHint.textContent = `${category.label} санатына арналған кітаптар`;
  els.books.innerHTML = books
    .map(
      (book) => `
      <article class="rounded-2xl border border-slate-200/80 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/50">
        <p class="font-medium">${book.title}</p>
        <p class="text-xs text-violet-600 dark:text-violet-400">${book.author}</p>
        <p class="mt-1 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">${book.why}</p>
      </article>
    `
    )
    .join("");
}

function renderHabits() {
  if (!state.habits.length) {
    els.list.innerHTML = `
      <div class="rounded-3xl border border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
        <p class="text-lg font-medium">Әзірге бос</p>
        <p class="mt-1 text-sm text-slate-500 dark:text-zinc-400">Алғашқы әдетті қосып, күндер сериясын бастаңыз.</p>
      </div>
    `;
    return;
  }

  const today = todayKey();

  els.list.innerHTML = state.habits
    .map((habit) => {
      const category = getCategory(habit.category);
      const doneToday = isDoneOn(habit, today);
      const streak = currentStreak(habit);
      const best = bestStreak(habit);
      const week = weekProgress(habit);

      return `
        <article class="habit-card rounded-3xl border border-white/80 bg-white/85 p-5 shadow-soft backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/75">
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-xl dark:bg-violet-500/15">${category.icon}</div>
              <div class="min-w-0">
                <h2 class="truncate text-lg font-semibold">${escapeHtml(habit.name)}</h2>
                <p class="text-xs text-slate-500 dark:text-zinc-400">${category.label} · үздік серия ${best} күн</p>
              </div>
            </div>
            <button
              type="button"
              class="text-slate-400 transition hover:text-rose-500"
              data-action="delete"
              data-id="${habit.id}"
              aria-label="Әдетті жою"
            >✕</button>
          </div>

          <div class="mt-4 flex items-center justify-between gap-3">
            <p class="text-sm">
              <span class="font-semibold text-violet-600 dark:text-violet-400">${streak}</span>
              күн қатарынан
            </p>
            <button
              type="button"
              class="check-btn ${doneToday ? "done" : ""} rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                doneToday
                  ? "bg-emerald-500 text-white hover:bg-emerald-400"
                  : "bg-slate-900 text-white hover:bg-violet-600 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-violet-300"
              }"
              data-action="toggle"
              data-id="${habit.id}"
            >${doneToday ? "Бүгін орындалды" : "Бүгін белгілеу"}</button>
          </div>

          <div class="mt-4">
            <div class="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Апта</span>
              <span>7-нің ${week.done}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
              <div class="progress-fill h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400" style="width: ${week.percent}%"></div>
            </div>
            <div class="mt-3 flex justify-between">
              ${week.keys
                .map((key, index) => {
                  const filled = isDoneOn(habit, key);
                  return `<span class="week-dot ${filled ? "filled bg-violet-500" : "bg-slate-200 dark:bg-zinc-800"} inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-medium ${filled ? "text-white" : "text-slate-500 dark:text-zinc-400"}">${WEEK_LABELS[index]}</span>`;
                })
                .join("")}
            </div>
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
  renderCategoryPicker();
  renderTips();
  renderBooks();
  renderHabits();
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = els.name.value.trim();
  if (!name) return;

  state.habits.unshift({
    id: crypto.randomUUID(),
    name,
    category: state.selectedCategory,
    createdAt: new Date().toISOString(),
    completions: {},
  });
  els.name.value = "";
  saveState();
  render();
  els.name.focus();
});

els.categoryPicker.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  setCategory(button.dataset.category);
});

els.list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const habit = state.habits.find((item) => item.id === button.dataset.id);
  if (!habit) return;

  if (button.dataset.action === "delete") {
    state.habits = state.habits.filter((item) => item.id !== habit.id);
  }

  if (button.dataset.action === "toggle") {
    const key = todayKey();
    habit.completions = habit.completions || {};
    if (habit.completions[key]) {
      delete habit.completions[key];
    } else {
      habit.completions[key] = true;
    }
  }

  saveState();
  render();
});

els.themeToggle.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  saveState();
  applyTheme();
});

render();
