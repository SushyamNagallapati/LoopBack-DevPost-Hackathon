import type { Loop } from '../types';

const STORAGE_KEY = 'loopback.loops';

export const getAllLoops = (): Loop[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading loops from localStorage:', error);
    return [];
  }
};

export const saveLoop = (loop: Loop): void => {
  try {
    const loops = getAllLoops();
    const existingIndex = loops.findIndex((l) => l.id === loop.id);
    
    if (existingIndex >= 0) {
      loops[existingIndex] = loop;
    } else {
      loops.push(loop);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loops));
  } catch (error) {
    console.error('Error saving loop to localStorage:', error);
  }
};

export const getLoopById = (id: string): Loop | null => {
  const loops = getAllLoops();
  return loops.find((l) => l.id === id) || null;
};

export const deleteLoop = (id: string): void => {
  try {
    const loops = getAllLoops();
    const filtered = loops.filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting loop from localStorage:', error);
  }
};

