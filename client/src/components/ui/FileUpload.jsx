import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, X } from 'lucide-react';

const FileUpload = ({ onFileSelect, selectedFile, onClear, accept = { 'image/*': [] }, label = "Drag & drop an image here, or click to select" }) => {
    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        multiple: false
    });

    if (selectedFile) {
        return (
            <div className="relative p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4 group">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <File className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear();
                    }}
                    className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-white/10 hover:border-primary/50 hover:bg-white/5'
                }`}
        >
            <input {...getInputProps()} />
            <div className="w-12 h-12 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 text-slate-400 group-hover:text-primary transition-colors">
                <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-300 font-medium mb-1">{label}</p>
            <p className="text-xs text-slate-500">Supports: {Object.keys(accept).join(', ').replace(/\/\*/g, '')}</p>
        </div>
    );
};

export default FileUpload;
