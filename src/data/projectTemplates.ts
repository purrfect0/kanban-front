import { Priority, Label } from "@/types/kanban";

export interface TemplateTaskItem {
  title: string;
  description: string;
  priority: Priority;
  labels: Label[];
  timeEstimate: string;
  columnId: "backlog" | "todo" | "in_progress" | "review" | "done";
  defaultSelected: boolean;
}

export interface ProjectTemplate {
  id: "blank" | "website" | "telegram-bot";
  name: string;
  description: string;
  type: "website" | "telegram-bot";
  defaultPrefix: string;
  tasks: TemplateTaskItem[];
}

const LABELS = {
  frontend: { id: "l1", name: "Frontend", color: "#7C6CF6" },
  ui: { id: "l2", name: "UI/UX", color: "#22C55E" },
  perf: { id: "l3", name: "Performance", color: "#EAB308" },
  seo: { id: "l4", name: "SEO", color: "#06B6D4" },
  api: { id: "l5", name: "API Integration", color: "#EC4899" },
  bot: { id: "l6", name: "Bot Logic", color: "#29A9EB" },
};

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "website",
    name: "Корпоративный сайт",
    description: "Полный цикл разработки веб-сайта от брифа до SEO и деплоя.",
    type: "website",
    defaultPrefix: "WEB",
    tasks: [
      {
        title: "Получить и проверить бриф с клиентом",
        description: "Согласовать ключевые требования, дизайн-ориентиры и целевую аудиторию.",
        priority: "P1",
        labels: [LABELS.ui],
        timeEstimate: "4h",
        columnId: "done",
        defaultSelected: true,
      },
      {
        title: "Определить структуру страниц и sitemap",
        description: "Составить древовидную карту разделов и информационную архитектуру.",
        priority: "P1",
        labels: [LABELS.ui],
        timeEstimate: "6h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Подготовить интерактивный прототип",
        description: "Разработать кликабельный wireframe основных экранов.",
        priority: "P1",
        labels: [LABELS.ui],
        timeEstimate: "12h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Разработать UI-kit компонентов",
        description: "Вынести кнопки, инпуты, карточки и типографику в единую дизайн-систему.",
        priority: "P2",
        labels: [LABELS.ui, LABELS.frontend],
        timeEstimate: "16h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Создать дизайн главных страниц",
        description: "Подготовить адаптивные макеты Desktop, Tablet и Mobile.",
        priority: "P1",
        labels: [LABELS.ui],
        timeEstimate: "20h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Сверстать frontend-компоненты",
        description: "Реализовать вёрстку на Next.js / Tailwind CSS с анимациями.",
        priority: "P0",
        labels: [LABELS.frontend],
        timeEstimate: "24h",
        columnId: "in_progress",
        defaultSelected: true,
      },
      {
        title: "Подключить backend и формы заявки",
        description: "Настроить отправку данных с валидацией полей.",
        priority: "P0",
        labels: [LABELS.frontend, LABELS.api],
        timeEstimate: "10h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Настроить внешние интеграции",
        description: "Подключить метрику, CRM и сервисы аналитики.",
        priority: "P2",
        labels: [LABELS.api],
        timeEstimate: "8h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Провести QA тестирование",
        description: "Проверить кроссбраузерность, формы и JS-сценарии.",
        priority: "P1",
        labels: [LABELS.perf],
        timeEstimate: "8h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Проверить адаптивность и скорость загрузки",
        description: "Оптимизировать картинки и шрифты для зеленой зоны Lighthouse.",
        priority: "P2",
        labels: [LABELS.perf],
        timeEstimate: "6h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Настроить SEO-метаданные и OpenGraph",
        description: "Заполнить title, description, og:image и canonical теги.",
        priority: "P2",
        labels: [LABELS.seo],
        timeEstimate: "4h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Опубликовать проект в production",
        description: "Настроить домен, SSL сертификат и автоматический CI/CD деплой.",
        priority: "P0",
        labels: [LABELS.frontend],
        timeEstimate: "4h",
        columnId: "backlog",
        defaultSelected: true,
      },
    ],
  },
  {
    id: "telegram-bot",
    name: "Telegram-бот",
    description: "Шаблон разработки сервисного Telegram-бота или бота лидогенерации.",
    type: "telegram-bot",
    defaultPrefix: "BOT",
    tasks: [
      {
        title: "Собрать требования и ТЗ проекта",
        description: "Утвердить цели бота, роли пользователей и ожидаемые команды.",
        priority: "P1",
        labels: [LABELS.bot],
        timeEstimate: "4h",
        columnId: "done",
        defaultSelected: true,
      },
      {
        title: "Подготовить сценарий диалога",
        description: "Составить схемы пошаговых веток общения и квалификации.",
        priority: "P1",
        labels: [LABELS.bot, LABELS.ui],
        timeEstimate: "8h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Определить стейт-машину диалогов",
        description: "Спроектировать конечные состояния пользователя (State Engine).",
        priority: "P1",
        labels: [LABELS.bot],
        timeEstimate: "6h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Создать список команд и меню",
        description: "Зарегистрировать BotFather commands, start, help, settings.",
        priority: "P2",
        labels: [LABELS.bot],
        timeEstimate: "4h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Реализовать обработчики событий (Handlers)",
        description: "Разработать асинхронную логику на сообщения и нажатия кнопок.",
        priority: "P0",
        labels: [LABELS.bot],
        timeEstimate: "16h",
        columnId: "in_progress",
        defaultSelected: true,
      },
      {
        title: "Настроить хранение данных",
        description: "Подключить структуру БД для сохранения сессий и заявок.",
        priority: "P1",
        labels: [LABELS.api],
        timeEstimate: "10h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Подключить внешние API и CRM",
        description: "Реализовать передачу лидов в CRM и получение статусов.",
        priority: "P1",
        labels: [LABELS.api],
        timeEstimate: "12h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Настроить Webhook handler",
        description: "Подключить защищенный endpoint с валидацией secret token.",
        priority: "P0",
        labels: [LABELS.bot, LABELS.api],
        timeEstimate: "6h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Протестировать сценарии и граничные случаи",
        description: "Проверить корректность обработки ошибок и сбоев сети.",
        priority: "P1",
        labels: [LABELS.perf],
        timeEstimate: "8h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Настроить логирование и алерты в Telegram",
        description: "Настроить алерты в технический чат при сбоях или 500 ошибках.",
        priority: "P2",
        labels: [LABELS.bot],
        timeEstimate: "4h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Развернуть бот на сервере",
        description: "Настроить process manager (PM2/Docker) и автоперезапуск.",
        priority: "P0",
        labels: [LABELS.bot],
        timeEstimate: "4h",
        columnId: "todo",
        defaultSelected: true,
      },
      {
        title: "Проверить production работу",
        description: "Запустить контрольные тесты квалификации в боевой среде.",
        priority: "P1",
        labels: [LABELS.perf],
        timeEstimate: "4h",
        columnId: "backlog",
        defaultSelected: true,
      },
    ],
  },
];
