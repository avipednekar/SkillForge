import React, { useState } from 'react';
import api from '../utils/api';
import { FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from './ui/FileUpload';

const ResumeParser = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [parseResult, setParseResult] = useState(null);

    const handleFileSelect = (selectedFile) => {
        if (!selectedFile) return;

        // Validate file type
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!validTypes.includes(selectedFile.type)) {
            toast.error('Please upload a valid PDF, DOCX, or TXT file');
            return;
        }

        // Validate file size (5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }

        setFile(selectedFile);
        setParseResult(null);
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const res = await api.post('/resume/parse', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setParseResult(res.data);
            toast.success('Resume parsed successfully!');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to parse resume');
        } finally {
            setUploading(false);
        }
    };

    const onClear = () => {
        setFile(null);
        setParseResult(null);
    };

    return (
        <div className="bg-surface rounded-2xl border border-white/10 p-6 shadow-xl max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Resume Parser
            </h2>

            <div className="space-y-6">
                <FileUpload
                    onFileSelect={handleFileSelect}
                    selectedFile={file}
                    onClear={onClear}
                    accept={{
                        'application/pdf': ['.pdf'],
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                        'text/plain': ['.txt']
                    }}
                    label="Drag & drop your resume here"
                />

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full btn btn-primary py-3 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Parsing Resume...
                        </>
                    ) : (
                        'Analyze Resume'
                    )}
                </button>

                {parseResult && (
                    <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle className="w-5 h-5" />
                                <h3 className="font-bold">Analysis Complete</h3>
                            </div>

                            {/* ATS Score Gauge */}
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">ATS Score</div>
                                    <div className="text-lg font-bold text-white">
                                        {Math.min((parseResult.skills?.length || 0) * 10, 95)}%
                                    </div>
                                </div>
                                <div className="relative w-12 h-12">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="transparent"
                                            className="text-white/10"
                                        />
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="transparent"
                                            strokeDasharray={2 * Math.PI * 20}
                                            strokeDashoffset={2 * Math.PI * 20 * (1 - Math.min((parseResult.skills?.length || 0) * 10, 95) / 100)}
                                            className="text-primary transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 text-sm text-slate-300">
                            <div>
                                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider block mb-1">Detected Skills</span>
                                <div className="flex flex-wrap gap-2">
                                    {parseResult.skills && parseResult.skills.length > 0 ? (
                                        parseResult.skills.map((skill, idx) => (
                                            <span key={idx} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium border border-primary/20">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-500 italic">No specific skills detected</span>
                                    )}
                                </div>
                            </div>

                            {parseResult.experience && parseResult.experience.length > 0 && (
                                <div className="mt-4">
                                    <span className="text-slate-500 text-xs uppercase font-bold tracking-wider block mb-2">Experience</span>
                                    <div className="space-y-3">
                                        {parseResult.experience.map((exp, idx) => (
                                            <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/10">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-semibold text-white">{exp.role}</h4>
                                                    <span className="text-xs text-slate-400 bg-black/20 px-2 py-1 rounded">{exp.duration}</span>
                                                </div>
                                                <div className="text-sm text-primary mb-1">{exp.company}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* NEW: Education Section */}
                            {parseResult.education && parseResult.education.length > 0 && (
                                <div className="mt-4">
                                    <span className="text-slate-500 text-xs uppercase font-bold tracking-wider block mb-2">Education</span>
                                    <div className="grid grid-cols-1 gap-2">
                                        {parseResult.education.map((edu, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white/5 p-2 px-3 rounded border border-white/10">
                                                <div>
                                                    <div className="font-medium text-white text-sm">{edu.degree}</div>
                                                    <div className="text-xs text-slate-400">{edu.school}</div>
                                                </div>
                                                <div className="text-xs text-primary font-mono">{edu.year}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* NEW: Projects Section */}
                            {parseResult.projects && parseResult.projects.length > 0 && (
                                <div className="mt-4">
                                    <span className="text-slate-500 text-xs uppercase font-bold tracking-wider block mb-2">Projects</span>
                                    <div className="space-y-3">
                                        {parseResult.projects.map((proj, idx) => (
                                            <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/10">
                                                <h4 className="font-semibold text-white text-sm">{proj.name}</h4>
                                                <p className="text-xs text-slate-300 mt-1">{proj.description}</p>
                                                {proj.techStack && (
                                                    <div className="mt-2 text-xs text-slate-500">
                                                        Stack: <span className="text-slate-400">{proj.techStack}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {parseResult.suggestions && (
                                <div>
                                    <span className="text-slate-500 text-xs uppercase font-bold tracking-wider block mb-1">Suggestions</span>
                                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                                        {parseResult.suggestions.map((suggestion, idx) => (
                                            <li key={idx}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeParser;