export function dateLabel(value: string, withTime = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}) }).format(date);
}
export function excerpt(content: string, max = 105) { const text = content.replace(/\s+/g, ' ').trim(); return text.length > max ? `${text.slice(0,max)}…` : text; }
