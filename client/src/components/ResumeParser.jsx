import React, { useState } from 'react';
import axios from 'axios';

const ResumeParser = () => {
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onFileChange = e => {
        setFile(e.target.files[0]);
        setError('');
    };

    const onUpload = async e => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/resume/upload', formData, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setText(res.data.text);

            // Auto-parse after upload
            const parseRes = await axios.post('http://localhost:5000/api/resume/parse',
                { text: res.data.text },
                { headers: { 'x-auth-token': token } }
            );
            setParsedData(parseRes.data);

            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Error uploading or parsing resume');
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 bg-surface p-6 rounded-xl border border-secondary/20 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-6">AI Resume Parser</h2>

            <form onSubmit={onUpload} className="mb-8">
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        onChange={onFileChange}
                        accept=".pdf,.docx"
                        className="block w-full text-sm text-slate-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-white
              hover:file:bg-primary-hover
            "
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className={`btn btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processing...' : 'Upload & Analyze'}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>

            {parsedData && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-white mb-2">Extracted Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {parsedData.skills.map((skill, index) => (
                                <span key={index} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-white mb-2">Experience</h3>
                        <div className="space-y-4">
                            {parsedData.experience.map((exp, index) => (
                                <div key={index} className="bg-background p-4 rounded-lg border border-secondary/30">
                                    <h4 className="font-bold text-white">{exp.role}</h4>
                                    <p className="text-primary">{exp.company}</p>
                                    <p className="text-slate-400 text-sm">{exp.duration}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {text && !parsedData && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-white mb-2">Extracted Text Preview</h3>
                    <div className="bg-background p-4 rounded-lg border border-secondary/30 text-slate-300 text-sm max-h-60 overflow-y-auto whitespace-pre-wrap">
                        {text}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeParser;
