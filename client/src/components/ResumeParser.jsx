import React, { useState } from 'react';
import api from '../utils/api';
import { Upload, FileText, CheckCircle, AlertCircle, Save, Loader2 } from 'lucide-react';

const ResumeParser = () => {
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const onFileChange = e => {
        setFile(e.target.files[0]);
        setError('');
        setParsedData(null);
    };

    const onUpload = async e => {
        e.preventDefault();
        if (!file) return setError('Please select a file');

        const formData = new FormData();
        formData.append('resume', file);

        setLoading(true);
        setError('');
        try {
            // 1. Upload & Extract Text
            const res = await api.post('/resume/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 2. Parse Text with AI
            const parseRes = await api.post('/resume/parse', { text: res.data.text });
            setParsedData(parseRes.data);
        } catch (err) {
            console.error(err);
            setError('Error uploading or parsing resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const syncToProfile = async () => {
        if (!parsedData) return;
        try {
            // Fetch current profile first to merge, or just overwrite
            const currentProfile = await api.get('/auth/me');

            const newSkills = [...new Set([...(currentProfile.data.profile.skills || []), ...parsedData.skills])];

            await api.put('/profile/me', {
                skills: newSkills,
                // You could also map parsedData.experience to bio or headline here
            });

            setSuccessMsg('Skills synced to your profile successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError('Failed to sync with profile');
        }
    };

    return (
        <div className="bg-surface p-6 rounded-2xl border border-white/10 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Resume Analyzer
            </h2>

            <form onSubmit={onUpload} className="mb-6">
                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-primary/50 hover:bg-white/5 transition-all cursor-pointer relative">
                    <input
                        type="file"
                        onChange={onFileChange}
                        accept=".pdf,.docx"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-300 font-medium">{file ? file.name : "Drop resume here or click to upload"}</p>
                    <p className="text-xs text-slate-500 mt-1">PDF or DOCX (Max 5MB)</p>
                </div>

                <button
                    type="submit"
                    disabled={loading || !file}
                    className="mt-4 w-full btn btn-primary py-2 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : 'Analyze Resume'}
                </button>

                {error && <div className="mt-3 text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</div>}
                {successMsg && <div className="mt-3 text-green-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {successMsg}</div>}
            </form>

            {parsedData && (
                <div className="space-y-5 animate-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h3 className="font-semibold text-white">Results</h3>
                        <button onClick={syncToProfile} className="text-xs flex items-center gap-1 text-primary hover:text-primary-hover transition-colors font-medium">
                            <Save className="w-3 h-3" /> Sync to Profile
                        </button>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-2">Detected Skills</p>
                        <div className="flex flex-wrap gap-2">
                            {parsedData.skills?.length > 0 ? parsedData.skills.map((skill, i) => (
                                <span key={i} className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded text-xs font-medium">
                                    {skill}
                                </span>
                            )) : <span className="text-slate-500 text-sm italic">No skills detected</span>}
                        </div>
                    </div>

                    {parsedData.experience?.length > 0 && (
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold mb-2">Experience</p>
                            <div className="space-y-3">
                                {parsedData.experience.map((exp, i) => (
                                    <div key={i} className="bg-black/20 p-3 rounded-lg border border-white/5">
                                        <p className="font-bold text-white text-sm">{exp.role}</p>
                                        <p className="text-primary text-xs">{exp.company}</p>
                                        <p className="text-slate-500 text-xs mt-1">{exp.duration}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResumeParser;