import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { BookOpen, Video, FileText, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';

const LearningRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await api.get('/learning/recommendations');
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
        <div className="h-full bg-surface p-6 rounded-2xl border border-white/10 shadow-xl animate-pulse">
            <div className="h-8 bg-white/5 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
                <div className="h-32 bg-white/5 rounded-xl"></div>
                <div className="h-32 bg-white/5 rounded-xl"></div>
            </div>
        </div>
    );

    return (
        <div className="h-full bg-surface p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50"></div>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <Sparkles className="w-5 h-5 text-yellow-400" /> Learning Path
            </h2>

            <div className="space-y-4 relative z-10 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {recommendations.map((rec, index) => (
                    <div key={index} className="group bg-black/20 p-5 rounded-xl border border-white/5 hover:border-primary/30 transition-all duration-300 hover:bg-black/30 hover:-translate-y-1">
                        <div className="mb-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider mb-2">
                                Recommendation
                            </span>
                            <p className="text-slate-300 text-xs italic border-l-2 border-white/10 pl-3 py-1">
                                "{rec.reason}"
                            </p>
                        </div>

                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-slate-400" /> Resources
                        </h3>

                        <ul className="space-y-2 mb-4">
                            {rec.resources.map((resource, idx) => (
                                <li key={idx} className="group/item flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className="mt-1 p-1.5 rounded-lg bg-white/5 text-slate-400 group-hover/item:text-primary group-hover/item:bg-primary/10 transition-colors">
                                        {resource.type === 'video' ? <Video className="w-3 h-3" /> :
                                            resource.type === 'article' ? <FileText className="w-3 h-3" /> :
                                                <GraduationCap className="w-3 h-3" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-slate-200 text-sm font-medium hover:text-primary transition-colors block mb-0.5 truncate">
                                            {resource.title}
                                        </a>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wide ${resource.difficulty === 'beginner' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                resource.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                {resource.difficulty}
                                            </span>
                                            <span className="text-[10px] text-slate-500 capitalize">• {resource.type}</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-3 h-3 text-slate-600 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all self-center" />
                                </li>
                            ))}
                        </ul>

                        {rec.nextSteps && rec.nextSteps.length > 0 && (
                            <div className="pt-3 border-t border-white/5">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Skills to Unlock</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {rec.nextSteps.map((skill, idx) => (
                                        <span key={idx} className="bg-white/5 text-slate-300 px-2 py-0.5 rounded text-[10px] font-medium border border-white/10 group-hover:border-white/20 transition-colors">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {recommendations.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-slate-600" />
                        </div>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto">Complete your profile and add skills to get personalized recommendations.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningRecommendations;