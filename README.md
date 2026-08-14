# SSJKanban — Frontend MVP for SSJCorp 🚀

**SSJKanban** — интерактивная канбан-доска для управления веб-проектами и Telegram-ботами команды **SSJCorp**.

- 🌐 **Живая демо-версия на GitHub Pages**: [https://purrfect0.github.io/kanban-front/](https://purrfect0.github.io/kanban-front/)
- 📦 **Репозиторий**: [https://github.com/purrfect0/kanban-front](https://github.com/purrfect0/kanban-front)

---

## 🎨 Особенности и функционал

### 1. Представления (Routes)
- **`/` — Обзор**:
  - Приветственная сводка и 4 метрики с анимацией чисел (`NumberTicker`).
  - Сетка проектов с фирменными эффектами (`MagicCard`), прогрессом в % и статусами.
  - Блоки просроченных задач и ближайших дедлайнов.
- **`/board/` — Канбан-доска**:
  - 5 колонок: *Бэклог*, *К выполнению*, *В работе*, *На проверке*, *Готово*.
  - Полноценный Drag-and-Drop (`@dnd-kit`) между колонками и внутри колонок.
  - Ограничения WIP (Work In Progress) с визуальным предупреждением.
  - Подробная панель задачи (`TaskDetailSheet`) с редактированием чек-листов, приоритетов (P0–P3), меток, дедлайнов и блокировок.
- **`/deadlines/` — Сроки**:
  - Группировка всех задач по временным интервалам (*Просрочено*, *Сегодня*, *Ближайшие 7 дней*, *Позже*, *Без срока*).

### 2. Фильтрация и Поиск
- Полнотекстовый клиентский поиск по названию, ID, описанию и меткам.
- Горячее сочетание клавиш `Ctrl/⌘ + K` для быстрого фокуса на поиске.
- Фильтры по исполнителю, приоритету, колонкам, просрочке и блокировке.

### 3. Визуальный стиль SSJCorp
- Тёмная тема по умолчанию (`#050505`, `#0F0F10`, `#7C6CF6`, `#22C55E`, `#29A9EB`).
- Переключатель темы (Dark / Light) и интеграция брендового логотипа (`logo.svg`).
- Типографика на основе шрифтов Geist Sans и Geist Mono с поддержкой кириллицы.

---

## 🛠️ Технологический стек

- **Framework**: Next.js 15 (App Router, Static Export)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + Custom SSJCorp Theme Tokens
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **UI Effects & Icons**: Magic UI primitives, Lucide React icons
- **State & Storage**: React Context + `localStorage` (`ssjcorp-kanban:v1`)

---

## 🚀 Инструкция по локальному запуску

```bash
# 1. Клонировать репозиторий
git clone https://github.com/purrfect0/kanban-front.git
cd kanban-front

# 2. Установить зависимости
npm install

# 3. Запустить в режиме разработки
npm run dev
```

Приложение станет доступно по адресу `http://localhost:3000`.

---

## ⚙️ Проверки и Сборка

```bash
# Проверка типов TypeScript
npm run typecheck

# Проверка линтером ESLint
npm run lint

# Статическая сборка (для GitHub Pages)
npm run build
```

---

## 🔌 Архитектура и подключение Backend API

Приложение спроектировано по принципу **Repository Pattern**, что полностью изолирует UI-компоненты от механизма хранения данных.

Все данные обрабатываются через абстрактный интерфейс `KanbanRepository` ([`src/lib/repositories/KanbanRepository.ts`](file:///d:/ANTIGRAVITY/kanban/src/lib/repositories/KanbanRepository.ts)).

### Текущее хранилище (MVP)
Используется [`LocalStorageKanbanRepository`](file:///d:/ANTIGRAVITY/kanban/src/lib/repositories/LocalStorageKanbanRepository.ts), которое сохраняет все изменения в `localStorage` браузера (`ssjcorp-kanban:v1`).

### Каждая функция возвращает `Promise`:
```typescript
export interface KanbanRepository {
  getProjects(): Promise<Project[]>;
  getTasks(projectId?: string): Promise<Task[]>;
  createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  moveTask(taskId: string, targetColumnId: string, targetIndex?: number): Promise<Task>;
  deleteTask(id: string): Promise<boolean>;
  // ...
}
```

### Как подключить реальный Backend:
1. Создать файл `src/lib/repositories/ApiKanbanRepository.ts`.
2. Реализовать класс `ApiKanbanRepository`, который выполняет `fetch` к REST/GraphQL API.
3. В [`src/store/KanbanContext.tsx`](file:///d:/ANTIGRAVITY/kanban/src/store/KanbanContext.tsx) заменить экземпляр репозитория:
   ```typescript
   // Было:
   import { kanbanRepository } from "@/lib/repositories/LocalStorageKanbanRepository";

   // Стало:
   import { kanbanRepository } from "@/lib/repositories/ApiKanbanRepository";
   ```
Ни один UI-компонент или страница не требуют изменений.

---

## 📦 GitHub Actions и Деплой

Проект настроен для автоматического деплоя на **GitHub Pages** при каждом `push` в ветку `main`. Workflow определен в [`.github/workflows/deploy-pages.yml`](file:///d:/ANTIGRAVITY/kanban/.github/workflows/deploy-pages.yml).
