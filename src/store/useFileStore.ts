import { create } from 'zustand'
import type { BatchFile, ExportProgress } from '@/types/file.types'

interface FileStore {
  files: BatchFile[]
  activeFileId: string | null
  exportProgress: ExportProgress | null
  isExporting: boolean

  addFiles: (files: File[]) => void
  removeFile: (id: string) => void
  setActiveFile: (id: string) => void
  updateFile: (id: string, changes: Partial<BatchFile>) => void
  clearFiles: () => void
  setExportProgress: (progress: ExportProgress | null) => void
  setIsExporting: (v: boolean) => void
  getActiveFile: () => BatchFile | null
  getReferenceFile: () => BatchFile | null
}

function makeBatchFile(file: File, index: number): BatchFile {
  return {
    id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
    file,
    name: file.name,
    duration: 0,
    status: index === 0 ? 'reference' : 'pending',
  }
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  activeFileId: null,
  exportProgress: null,
  isExporting: false,

  addFiles: (newFiles) =>
    set((s) => {
      const offset = s.files.length
      const added = newFiles.map((f, i) => makeBatchFile(f, offset + i))
      if (offset === 0 && added.length > 0) {
        added[0].status = 'reference'
      }
      const files = [...s.files, ...added]
      const activeFileId = s.activeFileId ?? (files[0]?.id ?? null)
      return { files, activeFileId }
    }),

  removeFile: (id) =>
    set((s) => {
      const files = s.files.filter((f) => f.id !== id)
      if (files.length > 0) files[0].status = 'reference'
      const activeFileId =
        s.activeFileId === id ? (files[0]?.id ?? null) : s.activeFileId
      return { files, activeFileId }
    }),

  setActiveFile: (id) => set({ activeFileId: id }),

  updateFile: (id, changes) =>
    set((s) => ({
      files: s.files.map((f) => (f.id === id ? { ...f, ...changes } : f)),
    })),

  clearFiles: () => set({ files: [], activeFileId: null }),

  setExportProgress: (progress) => set({ exportProgress: progress }),
  setIsExporting: (v) => set({ isExporting: v }),

  getActiveFile: () => {
    const { files, activeFileId } = get()
    return files.find((f) => f.id === activeFileId) ?? null
  },

  getReferenceFile: () => {
    return get().files.find((f) => f.status === 'reference') ?? get().files[0] ?? null
  },
}))
