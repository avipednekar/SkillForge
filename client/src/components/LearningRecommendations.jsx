import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, Video, FileText, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';

const LearningRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/learning/recommendations', {
                    headers: { 'x-auth-token': token }
                });
                setRecommendations(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, []);

    if (loading) return (
        <div className="mt-8 bg-surface p-6 rounded-2xl border border-white/10 shadow-lg animate-pulse">
            <div className="h-8 bg-white/5 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-white/5 rounded-xl"></div>
                <div className="h-64 bg-white/5 rounded-xl"></div>
            </div>
        </div>
    );

    return (
        <div className="mt-8 bg-surface p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50"></div>

            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2 relative z-10">
                <Sparkles className="w-6 h-6 text-yellow-400" /> Personalized Learning Path
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {recommendations.map((rec, index) => (
                    <div key={index} className="group bg-black/20 p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-all duration-300 hover:bg-black/30 hover:-translate-y-1">
                        <div className="mb-6">
                            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                                Recommendation
                            </span>
                            <p className="text-slate-300 text-sm italic border-l-2 border-white/10 pl-3 py-1">
                                "{rec.reason}"
                            </p>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-slate-400" /> Recommended Resources
                        </h3>

                        <ul className="space-y-3 mb-6">
                            {rec.resources.map((resource, idx) => (
                                <li key={idx} className="group/item flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className="mt-1 p-2 rounded-lg bg-white/5 text-slate-400 group-hover/item:text-primary group-hover/item:bg-primary/10 transition-colors">
                                        {resource.type === 'video' ? <Video className="w-4 h-4" /> :
                                            resource.type === 'article' ? <FileText className="w-4 h-4" /> :
                                                <GraduationCap className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1">
                                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-slate-200 font-medium hover:text-primary transition-colors block mb-1">
                                            {resource.title}
                                        </a>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide ${resource.difficulty === 'beginner' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    resource.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                        'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                {resource.difficulty}
                                            </span>
                                            <span className="text-xs text-slate-500 capitalize">• {resource.type}</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-600 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all self-center" />
                                </li>
                            ))}
                        </ul>

                        {rec.nextSteps && rec.nextSteps.length > 0 && (
                            <div className="pt-4 border-t border-white/5">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Next Skills to Unlock</h4>
                                <div className="flex flex-wrap gap-2">
                                    {rec.nextSteps.map((skill, idx) => (
                                        <span key={idx} className="bg-white/5 text-slate-300 px-2.5 py-1 rounded-md text-xs font-medium border border-white/10 group-hover:border-white/20 transition-colors">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {recommendations.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="text-slate-400">Complete your profile and add skills to get personalized recommendations.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningRecommendations;
