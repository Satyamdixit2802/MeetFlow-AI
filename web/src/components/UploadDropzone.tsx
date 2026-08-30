"use client"

import {useCallback} from "react";
import {useDropzone} from 'react-dropzone'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'
import { CircleCheckBig, FolderOpen, MicAudioLines } from 'lucide-react';

interface  uploadDropZoneProps {
    onFileSelect : (file : File | null) => void;
    selectedFile : File | null
}

export function UploadDropzone({ onFileSelect, selectedFile }: uploadDropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) onFileSelect(acceptedFiles[0])
    },
    [onFileSelect]
  )

  const {getRootProps, isDragActive, getInputProps} =  useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".ogg", ".webm"],
      "text/plain": [".txt"],
    },
    maxFiles : 1,
    maxSize : 25 * 1024 * 1024
})
return (
    <div 
    {...getRootProps()}
    className={cn(
      "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors",
      isDragActive 
      ? "border-primary bg-primary/5"
      : "border-border hover:border-primary-50 hover:bg-muted/30",
      selectedFile && "border-green-500 bg-green-500/5"
    )}>
      <input {...getInputProps()} />

      {selectedFile ? (
        <div className="space-y-2">
          <div className="text-3xl"><CircleCheckBig size = {30} /></div>
          <p className="font-medium">{selectedFile.name}</p>
          <p text-muted-foreground text-sm>
            {(selectedFile.size/1024/1024).toFixed(2)}MB
          </p>
          <Button variant="ghost"
          size="sm" onClick={(e) => {
            e.stopPropagation()
            onFileSelect(null)
          }}> Remove </Button>
        </div>
      ): isDragActive ? 
    (<div className="space-y-2">
      <div className="text-3xl"><FolderOpen size={30}/></div>
      <p className="font-medium">Drop it here</p>
    </div>): 
    ( <div className="space-y-3">
      <div className="text-4xl"><MicAudioLines size={30}/></div>
      <div>
        <p className="font-medium">Drag & drop your meeting recording</p>
        <p className="text-sm text-muted-foreground mt-1">
          or click to browse - MP3, WAV, M4A, TEXT upto 25 MB
        </p>
      </div>

    </div>)}
        
        
    </div>
)
}

