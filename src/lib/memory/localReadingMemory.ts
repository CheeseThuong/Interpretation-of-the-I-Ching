export interface SavedReading {
  id: string;
  type: 'tarot' | 'iching';
  question: string;
  topic?: string;
  birthDate?: string;
  zodiacSign?: string;
  spreadType?: string;
  cards?: Array<{
    name: string;
    orientation: 'upright' | 'reversed';
    position?: string;
  }>;
  hexagram?: {
    primary?: string;
    changed?: string;
    movingLines?: number[];
  };
  synthesis?: any;
  aiAnswer?: any;
  createdAt: string;
  feedback?: {
    helpful?: boolean;
    wrongContext?: boolean;
    tooGeneric?: boolean;
    note?: string;
  };
}

const STORAGE_KEY = 'kinhdichai_local_readings';
const SETTINGS_KEY = 'kinhdichai_memory_settings';

export function saveReadingToLocalMemory(reading: Omit<SavedReading, 'id' | 'createdAt'>): string {
  const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
  const newReading: SavedReading = {
    ...reading,
    id,
    createdAt: new Date().toISOString()
  };

  const history = getLocalReadingHistory();
  history.unshift(newReading); // add to top
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return id;
}

export function getLocalReadingHistory(limit?: number): SavedReading[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const history: SavedReading[] = data ? JSON.parse(data) : [];
    if (limit) {
      return history.slice(0, limit);
    }
    return history;
  } catch (error) {
    console.error('Failed to parse local reading history:', error);
    return [];
  }
}

export function getReadingById(id: string): SavedReading | null {
  const history = getLocalReadingHistory();
  return history.find(r => r.id === id) || null;
}

export function deleteReadingFromLocalMemory(id: string): void {
  const history = getLocalReadingHistory();
  const updated = history.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearLocalReadingHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function saveReadingFeedback(readingId: string, feedback: SavedReading['feedback']): void {
  const history = getLocalReadingHistory();
  const index = history.findIndex(r => r.id === readingId);
  if (index !== -1) {
    history[index].feedback = { ...history[index].feedback, ...feedback };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
}

export function getMemorySettings(): any {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { enabled: true };
  } catch {
    return { enabled: true };
  }
}

export function updateMemorySettings(settings: any): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
