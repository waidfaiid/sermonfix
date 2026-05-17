import { useRef } from 'react'
import { Layout } from '@/components/layout/Layout'
import { DropZone } from '@/components/import/DropZone'
import { FileList } from '@/components/import/FileList'
import { WaveformDisplay } from '@/components/waveform/WaveformDisplay'
import { TransportControls } from '@/components/waveform/TransportControls'
import { ProcessingPanel } from '@/components/processing/ProcessingPanel'
import { EQProPanel } from '@/components/eq/EQProPanel'
import { ExportPanel } from '@/components/export/ExportPanel'
import { ExportProgress } from '@/components/export/ExportProgress'
import { ToastContainer } from '@/components/ui/Toast'
import { InstallPrompt } from '@/components/ui/InstallPrompt'
import { useFileStore } from '@/store/useFileStore'
import { useAudioEngine } from '@/hooks/useAudioEngine'
import { useFFmpegLoader } from '@/hooks/useFFmpegLoader'
import { Plus } from 'lucide-react'

function WorkspaceView() {
  const activeFile = useFileStore((s) => s.getActiveFile())
  const files = useFileStore((s) => s.files)
  const addFiles = useFileStore((s) => s.addFiles)
  const inputRef = useRef<HTMLInputElement>(null)

  useAudioEngine()

  if (!activeFile) return <DropZone />

  return (
    <div className="flex flex-col overflow-y-auto">
      {/* File name + add more */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-card-border">
        <div className="min-w-0 flex-1">
          <p className="text-text-primary text-sm font-medium truncate">{activeFile.name}</p>
          <p className="text-text-secondary text-xs">
            {files.length > 1 ? `${files.length} Dateien geladen` : 'Datei geladen'}
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors ml-4 shrink-0"
        >
          <Plus size={14} />
          Dateien
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".mp3,.wav,.aiff,.flac,.aac,.m4a,.ogg"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
        />
      </div>

      {/* Waveform */}
      <WaveformDisplay file={activeFile.file} />

      {/* Transport */}
      <TransportControls />

      <div className="h-px bg-card-border mx-4 my-1" />

      {/* Processing */}
      <ProcessingPanel />

      <div className="h-px bg-card-border mx-4 my-1" />

      {/* Export */}
      <ExportPanel />

      {/* Batch file list */}
      <FileList />
    </div>
  )
}

export default function App() {
  useFFmpegLoader()

  const hasFiles = useFileStore((s) => s.files.length > 0)

  return (
    <Layout>
      {hasFiles ? <WorkspaceView /> : <DropZone />}
      <EQProPanel />
      <ExportProgress />
      <ToastContainer />
      <InstallPrompt />
    </Layout>
  )
}
