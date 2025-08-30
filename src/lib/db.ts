import Dexie, { type Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'

// Core types
export type BlobRef = {
  id: string // uuid
  mime: string
  size: number
}

export type Asset = {
  id: string
  type: 'header' | 'background' | 'font'
  name: string
  mime: string
  blobRef: string // BlobRef.id
  createdAt: number
  updatedAt: number
  meta?: Record<string, unknown>
}

export type CanvasTextSpec = {
  text: string
  fontFamily: string
  fontSize: number
  color: string
  align: 'left' | 'center' | 'right'
  rtl?: boolean
  box: { x: number; y: number; w: number; h: number }
  rotation?: number
}

export type CanvasImageLayer = {
  assetId: string
  x: number
  y: number
  w: number
  h: number
  rotation?: number
  opacity?: number
}

export type CanvasSpec = {
  width: number
  height: number
  background?: { assetId?: string; color?: string; opacity?: number; fit?: 'cover' | 'contain' }
  headers: CanvasImageLayer[]
  textAr?: CanvasTextSpec
  textFr?: CanvasTextSpec
  contact?: CanvasTextSpec
}

export type GeneratedExport = {
  id: string
  type: 'png' | 'jpeg' | 'pdf'
  blobRef: string
  width?: number
  height?: number
  createdAt: number
}

export type AdProject = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  canvasSpec: CanvasSpec
  assetRefs: string[] // Asset IDs referenced for quick lookup
  generatedExports: GeneratedExport[]
  thumbnailBlobRef?: string
}

export type AISession = {
  id: string
  adProjectId?: string
  prompt: string
  params?: Record<string, unknown>
  resultTextAr?: string
  resultTextFr?: string
  createdAt: number
}

export type Settings = {
  id: 'app-settings'
  theme?: 'light' | 'dark' | 'system'
  rtl?: boolean
  ai?: { endpoint?: string; apiKey?: string }
  lastUsedFonts?: { ar?: string; fr?: string }
}

export class PAWSDB extends Dexie {
  blobs!: Table<{ id: string; blob: Blob; mime: string; size: number }>
  assets!: Table<Asset>
  ad_projects!: Table<AdProject>
  ai_sessions!: Table<AISession>
  settings!: Table<Settings>

  constructor() {
    super('paws-db')
    this.version(1).stores({
      blobs: '&id',
      assets: '&id, type, updatedAt',
      ad_projects: '&id, updatedAt',
      ai_sessions: '&id, adProjectId, createdAt',
      settings: '&id'
    })
  }
}

export const db = new PAWSDB()

// Helpers
export async function putBlob(blob: Blob, mime: string): Promise<BlobRef> {
  const id = uuidv4()
  await db.blobs.put({ id, blob, mime, size: blob.size })
  return { id, mime, size: blob.size }
}

export async function getBlob(refId: string): Promise<Blob | undefined> {
  const row = await db.blobs.get(refId)
  return row?.blob
}
