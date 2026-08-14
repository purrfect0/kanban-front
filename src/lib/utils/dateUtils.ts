/**
 * Russian Date Formatting Utilities based on Intl.DateTimeFormat("ru-RU")
 */

export function formatDateCompact(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const monthShort = new Intl.DateTimeFormat("ru-RU", { month: "short" }).format(d);
  return `${d.getDate()} ${monthShort.replace(".", "")}`;
}

export function formatDateFull(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const monthLong = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(d);
  return `${d.getDate()} ${monthLong} ${d.getFullYear()}`;
}

export function formatDateRelative(dateStr?: string): string {
  if (!dateStr) return "";
  const due = new Date(dateStr);
  if (isNaN(due.getTime())) return dateStr;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Сегодня";
  if (diffDays === 1) return "Завтра";
  if (diffDays > 1 && diffDays <= 7) return `Через ${diffDays} дн.`;
  if (diffDays > 7) return formatDateCompact(dateStr);

  const overdueDays = Math.abs(diffDays);
  if (overdueDays === 1) return "Просрочено на 1 день";
  if (overdueDays >= 2 && overdueDays <= 4) return `Просрочено на ${overdueDays} дня`;
  return `Просрочено на ${overdueDays} дней`;
}
