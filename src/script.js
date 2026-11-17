/**
 * LocalStorage Guest Wishes Manager
 * Single-source local persistence for Doa Restu & Ucapan Tamu.
 */

export const WISHES_STORAGE_KEY = 'wedding_wishes_mutiara_daffa';

const VALID_STATUSES = ['Hadir', 'Tidak Hadir', 'Ragu-ragu'];

/**
 * Formats a timestamp or date string into an easy-to-read Indonesian date/time string.
 * @param {number | string} value
 * @returns {string}
 */
export function formatWishDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Baru saja';
  }

  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleString('id-ID');
  }
}

/**
 * Safely normalizes an unknown wish record loaded from LocalStorage.
 * @param {unknown} item
 * @returns {{ id: string, name: string, status: string, message: string, createdAt: number } | null}
 */
function sanitizeWishItem(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const record = /** @type {Record<string, unknown>} */ (item);
  const name = typeof record.name === 'string' ? record.name.trim() : '';
  const message = typeof record.message === 'string' ? record.message.trim() : '';

  if (!name || !message) {
    return null;
  }

  const rawStatus = typeof record.status === 'string' ? record.status.trim() : 'Hadir';
  const status = VALID_STATUSES.includes(rawStatus) ? rawStatus : 'Hadir';

  const rawCreatedAt =
    typeof record.createdAt === 'number' && Number.isFinite(record.createdAt)
      ? record.createdAt
      : Date.parse(String(record.createdAt || '')) || Date.now();

  const id =
    typeof record.id === 'string' && record.id.trim()
      ? record.id.trim()
      : `wish-${rawCreatedAt}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    id,
    name,
    status,
    message,
    createdAt: rawCreatedAt,
  };
}

/**
 * Reads and parses all saved wishes from LocalStorage.
 * Safely handles invalid JSON, corrupted structures, or unavailable storage.
 * @returns {Array<{ id: string, name: string, status: string, message: string, createdAt: number }>}
 */
export function getWishes() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(WISHES_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(WISHES_STORAGE_KEY);
      return [];
    }

    const sanitized = parsed
      .map(sanitizeWishItem)
      .filter((item) => item !== null);

    sanitized.sort((a, b) => b.createdAt - a.createdAt);
    return sanitized;
  } catch {
    try {
      window.localStorage.removeItem(WISHES_STORAGE_KEY);
    } catch {
      // Ignore storage access errors
    }
    return [];
  }
}

/**
 * Validates and saves a new wish into LocalStorage.
 * @param {{ name: string, status: string, message: string }} input
 * @returns {{ ok: true, wish: { id: string, name: string, status: string, message: string, createdAt: number }, wishes: Array<{ id: string, name: string, status: string, message: string, createdAt: number }> } | { ok: false, error: string }}
 */
export function saveWish(input) {
  const name = typeof input?.name === 'string' ? input.name.trim() : '';
  const status = typeof input?.status === 'string' ? input.status.trim() : '';
  const message = typeof input?.message === 'string' ? input.message.trim() : '';

  if (!name) {
    return { ok: false, error: 'Nama tamu wajib diisi.' };
  }
  if (name.length < 2) {
    return { ok: false, error: 'Nama tamu minimal terdiri dari 2 karakter.' };
  }
  if (!VALID_STATUSES.includes(status)) {
    return { ok: false, error: 'Silakan pilih konfirmasi kehadiran yang valid.' };
  }
  if (!message) {
    return { ok: false, error: 'Ucapan & doa restu tidak boleh kosong.' };
  }
  if (message.length < 3) {
    return { ok: false, error: 'Ucapan & doa restu minimal terdiri dari 3 karakter.' };
  }

  const newWish = {
    id: `wish-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    status,
    message,
    createdAt: Date.now(),
  };

  const currentWishes = getWishes();
  const updatedWishes = [newWish, ...currentWishes];

  try {
    window.localStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(updatedWishes));
  } catch {
    return {
      ok: false,
      error: 'Gagal menyimpan ucapan ke penyimpanan browser.',
    };
  }

  return {
    ok: true,
    wish: newWish,
    wishes: updatedWishes,
  };
}

/**
 * Prepares saved wishes sorted newest-first with readable formatted dates for rendering cards.
 * @param {Array<{ id: string, name: string, status: string, message: string, createdAt: number }>} [sourceWishes]
 * @returns {Array<{ id: string, name: string, status: string, message: string, createdAt: number, formattedDate: string }>}
 */
export function renderWishes(sourceWishes) {
  const list = Array.isArray(sourceWishes) ? sourceWishes : getWishes();
  return [...list]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((wish) => ({
      ...wish,
      formattedDate: formatWishDate(wish.createdAt),
    }));
}

/**
 * Deletes a single wish by ID from LocalStorage and returns the updated list.
 * @param {string} id
 * @returns {Array<{ id: string, name: string, status: string, message: string, createdAt: number }>}
 */
export function deleteWish(id) {
  const currentWishes = getWishes();
  const updatedWishes = currentWishes.filter((wish) => wish.id !== id);

  try {
    window.localStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(updatedWishes));
  } catch {
    // Ignore storage access errors
  }

  return updatedWishes;
}

/**
 * Clears all wishes from LocalStorage and returns an empty array.
 * @returns {Array<never>}
 */
export function clearWishes() {
  try {
    window.localStorage.removeItem(WISHES_STORAGE_KEY);
  } catch {
    // Ignore storage access errors
  }
  return [];
}
