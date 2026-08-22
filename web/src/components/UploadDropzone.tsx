"use client"

import {useCallback, useState} from "react";
import {useDropzone} from 'react-dropzone'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'


interface  uploadDropZoneProps {
    onFileSelected : (file : File | null) => void;
    selectedFile : File | null
}

function uploadDropZone({onFileSelected, selectedFile}: uploadDropZoneProps) {

    const onDrop = useCallback(
        (acc)
    )

}