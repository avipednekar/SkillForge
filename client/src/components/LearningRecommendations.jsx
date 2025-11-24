import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

    if (loading) return <div className="text-slate-400">Loading recommendations...</div>;

    return (
        <div className="mt-8 bg-surface p-6 rounded-xl border border-secondary/20 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-6">Personalized Learning Path</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map((rec, index) => (
                    <div key={index} className="bg-background p-5 rounded-lg border border-secondary/30 hover:border-primary/50 transition-colors">
                        <div className="mb-4">
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">{rec.reason}</span>
                        </div>

                        <h3 className="text-lg font-medium text-white mb-3">Recommended Resources</h3>
                        <ul className="space-y-3 mb-4">
                            {rec.resources.map((resource, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="mt-1 text-secondary">
                                        {resource.type === 'video' ? '🎥' : resource.type === 'article' ? '📄' : '🎓'}
                                    </span>
                                    <div>
                                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-primary hover:underline block">
                                            {resource.title}
                                        </a>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${resource.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300' :
                                                resource.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                                                    'bg-red-500/20 text-red-300'
                                            }`}>
                                            {resource.difficulty}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {rec.nextSteps && rec.nextSteps.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-slate-400 mb-2">Next Skills to Unlock:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {rec.nextSteps.map((skill, idx) => (
                                        <span key={idx} className="bg-secondary/20 text-slate-300 px-2 py-1 rounded text-xs border border-secondary/30">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LearningRecommendations;
