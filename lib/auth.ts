export function isClient() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getUsername(): string | null {
  if (!isClient()) return null;
  return localStorage.getItem('dcai_username');
}

export function setUsername(name: string) {
  if (!isClient()) return;
  localStorage.setItem('dcai_username', name);
}

export function clearUsername() {
  if (!isClient()) return;
  localStorage.removeItem('dcai_username');
}

export function getDream(): string | null {
  if (!isClient()) return null;
  return localStorage.getItem('dcai_dream');
}

export function setDream(d: string) {
  if (!isClient()) return;
  localStorage.setItem('dcai_dream', d);
}
