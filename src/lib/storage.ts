import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Photo, PhotoType } from '@/components/photos/photos-page';
import type { AdFormData } from '@/components/ad-creator/ad-form';

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
}

// Database version
const DB_VERSION = 1;

// Database name
const DB_NAME = 'clinic-ads-db';

// Initialize the database
async function initDB(): Promise<IDBPDatabase<ClinicAdsDB>> {
  return openDB<ClinicAdsDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create a store for photos
      if (!db.objectStoreNames.contains('photos')) {
        const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
        photoStore.createIndex('by-type', 'type');
      }

      // Create a store for ads
      if (!db.objectStoreNames.contains('ads')) {
        db.createObjectStore('ads', { keyPath: 'id' });
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
export async function saveAd(
  ad: AdFormData & { id?: string }
): Promise<string> {
  const db = await initDB();
  const now = Date.now();
  
  const adToSave = {
    ...ad,
    id: ad.id || `ad-${now}`,
    createdAt: ad.id ? (await db.get('ads', ad.id))?.createdAt || now : now,
    updatedAt: now,
  };
  
  await db.put('ads', adToSave);
  return adToSave.id;
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
