import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Photo, PhotoType } from '@/components/photos/photos-page';
import type { AdFormData } from '@/components/ad-creator/ad-form';

// Settings interface
export interface AppSettings {
  apiKey?: string;
  systemPrompt?: string;
  id?: string; // Add id to the interface
}

// Define our database schema
interface ClinicAdsDB extends DBSchema {
  photos: {
    key: string;
    value: Photo;
    indexes: {
      'by-type': PhotoType;
    };
  };
  ads: {
    key: string;
    value: AdFormData & { id: string; createdAt: number; updatedAt: number };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

// Database version
const DB_VERSION = 2;

// Database name
const DB_NAME = 'clinic-ads-db';

// Initialize the database
async function initDB(): Promise<IDBPDatabase<ClinicAdsDB>> {
  return openDB<ClinicAdsDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Create a store for photos
      if (!db.objectStoreNames.contains('photos')) {
        const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
        photoStore.createIndex('by-type', 'type');
      }

      // Create a store for ads
      if (!db.objectStoreNames.contains('ads')) {
        db.createObjectStore('ads', { keyPath: 'id' });
      }
      
      // Create a store for settings (added in version 2)
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      }
    },
  });
}

// Photo storage operations
export async function savePhoto(photo: Photo): Promise<string> {
  const db = await initDB();
  await db.put('photos', photo);
  return photo.id;
}

export async function getPhoto(id: string): Promise<Photo | undefined> {
  const db = await initDB();
  return db.get('photos', id);
}

export async function getAllPhotos(): Promise<Photo[]> {
  const db = await initDB();
  return db.getAll('photos');
}

export async function getPhotosByType(type: PhotoType): Promise<Photo[]> {
  const db = await initDB();
  return db.getAllFromIndex('photos', 'by-type', type);
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('photos', id);
}

// Ad storage operations
export async function saveAd(adData: AdFormData, existingId?: string): Promise<string> {
  const db = await initDB();
  const timestamp = Date.now();
  const id = existingId || crypto.randomUUID();
  
  let adWithMetadata;
  
  if (existingId) {
    // If updating an existing ad, preserve the original createdAt timestamp
    const existingAd = await db.get('ads', existingId);
    adWithMetadata = {
      ...adData,
      id,
      createdAt: existingAd?.createdAt || timestamp,
      updatedAt: timestamp,
    };
  } else {
    // New ad
    adWithMetadata = {
      ...adData,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }
  
  await db.put('ads', adWithMetadata);
  return id;
}

export async function getAd(id: string): Promise<(AdFormData & { id: string; createdAt: number; updatedAt: number }) | undefined> {
  const db = await initDB();
  return db.get('ads', id);
}

export async function getAllAds(): Promise<(AdFormData & { id: string; createdAt: number; updatedAt: number })[]> {
  const db = await initDB();
  return db.getAll('ads');
}

export async function deleteAd(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('ads', id);
}

// Export/Import functionality for backup
export async function exportData(): Promise<string> {
  const photos = await getAllPhotos();
  const ads = await getAllAds();
  
  const exportData = {
    photos,
    ads,
    exportDate: new Date().toISOString(),
  };
  
  return JSON.stringify(exportData);
}

export async function importData(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData);
    const db = await initDB();
    
    // Clear existing data
    const photoStore = db.transaction('photos', 'readwrite').objectStore('photos');
    await photoStore.clear();
    
    const adStore = db.transaction('ads', 'readwrite').objectStore('ads');
    await adStore.clear();
    
    // Import photos
    const photoTx = db.transaction('photos', 'readwrite');
    await Promise.all(data.photos.map((photo: Photo) => photoTx.store.add(photo)));
    await photoTx.done;
    
    // Import ads
    const adTx = db.transaction('ads', 'readwrite');
    await Promise.all(data.ads.map((ad: any) => adTx.store.add(ad)));
    await adTx.done;
    
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Failed to import data. The file might be corrupted.');
  }
}

// Settings storage operations
export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await initDB();
  await db.put('settings', { id: 'app-settings', ...settings });
}

export async function getSettings(): Promise<AppSettings> {
  const db = await initDB();
  const settings = await db.get('settings', 'app-settings');
  return settings || { apiKey: '', systemPrompt: '' };
}
