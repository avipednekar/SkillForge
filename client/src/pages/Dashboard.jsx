import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { LogOut, Edit2, User, Github, Linkedin, Globe, Code, Briefcase, Award, Home } from 'lucide-react';
import Projects from '../components/Projects';
import ResumeParser from '../components/ResumeParser';
import InterviewCoach from '../components/InterviewCoach';
import LearningRecommendations from '../components/LearningRecommendations';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        headline: '',
        bio: '',
        skills: '',
        socials: {
            linkedin: '',
            github: '',
            website: ''
        }
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data);
                setFormData({
                    firstName: res.data.profile?.firstName || '',
                    lastName: res.data.profile?.lastName || '',
                    headline: res.data.profile?.headline || '',
                    bio: res.data.profile?.bio || '',
                    skills: res.data.profile?.skills?.join(', ') || '',
                    socials: {
                        linkedin: res.data.profile?.socials?.linkedin || '',
                        github: res.data.profile?.socials?.github || '',
                        website: res.data.profile?.socials?.website || ''
                    }
                });
                setLoading(false);
            } catch (err) {
                console.error(err);
                navigate('/login');
            }
        };
        fetchProfile();
    }, [navigate]);

    const onChange = e => {
        if (e.target.name.startsWith('socials.')) {
            const socialField = e.target.name.split('.')[1];
            setFormData({
                ...formData,
                socials: { ...formData.socials, [socialField]: e.target.value }
            });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await api.put('/profile/me', formData);
            setUser(res.data);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary/30">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-white">
                                SF
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                SkillForge
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                            >
                                <Home className="w-4 h-4" />
                                Home
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    navigate('/login');
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border border-white/5 p-8 sm:p-12">
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-30"></div>

                    <div className="relative z-10">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">{user.profile?.firstName || user.username}</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl">
                            Track your progress, practice interviews, and build your portfolio all in one place.
                            You're on your way to landing your dream job.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Profile & Resume (4 cols) */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Profile Card */}
                        <div className="bg-surface rounded-2xl p-6 border border-white/10 shadow-xl relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>

                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" /> Profile
                                </h2>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>

                            {isEditing ? (
                                <form onSubmit={onSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={onChange}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={onChange}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Headline</label>
                                        <input
                                            type="text"
                                            name="headline"
                                            value={formData.headline}
                                            onChange={onChange}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Bio</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={onChange}
                                            rows="3"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Skills</label>
                                        <input
                                            type="text"
                                            name="skills"
                                            value={formData.skills}
                                            onChange={onChange}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-500 uppercase block">Social Links</label>
                                        <div className="relative">
                                            <Linkedin className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                                            <input
                                                type="text"
                                                name="socials.linkedin"
                                                value={formData.socials.linkedin}
                                                onChange={onChange}
                                                placeholder="LinkedIn URL"
                                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Github className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                                            <input
                                                type="text"
                                                name="socials.github"
                                                value={formData.socials.github}
                                                onChange={onChange}
                                                placeholder="GitHub URL"
                                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full btn btn-primary py-2 text-sm">Save Profile</button>
                                </form>
                            ) : (
                                <div className="text-center">
                                    <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-primary to-purple-600 rounded-full p-1 mb-4 shadow-lg shadow-primary/20">
                                        <div className="w-full h-full bg-surface rounded-full flex items-center justify-center text-4xl font-bold text-white">
                                            {user.profile?.firstName ? user.profile.firstName.charAt(0) : user.username.charAt(0).toUpperCase()}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {user.profile?.firstName} {user.profile?.lastName}
                                    </h3>
                                    <p className="text-primary font-medium mb-4">{user.profile?.headline || 'Software Engineer'}</p>

                                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                        {user.profile?.bio || 'No bio added yet. Click edit to tell your story.'}
                                    </p>

                                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                                        {user.profile?.skills?.map((skill, index) => (
                                            <span key={index} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                                                {skill}
                                            </span>
                                        ))}
                                        {(!user.profile?.skills || user.profile.skills.length === 0) && (
                                            <span className="text-slate-500 text-xs italic">Add skills to get recommendations</span>
                                        )}
                                    </div>

                                    <div className="flex justify-center gap-4 pt-4 border-t border-white/5">
                                        {user.profile?.socials?.github && (
                                            <a href={user.profile.socials.github} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                                <Github className="w-5 h-5" />
                                            </a>
                                        )}
                                        {user.profile?.socials?.linkedin && (
                                            <a href={user.profile.socials.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                                <Linkedin className="w-5 h-5" />
                                            </a>
                                        )}
                                        {user.profile?.socials?.website && (
                                            <a href={user.profile.socials.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                                <Globe className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Resume Parser Component */}
                        <ResumeParser />
                    </div>

                    {/* Right Column: Main Content (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Projects Section */}
                        <Projects />

                        {/* Interview Coach & Learning - Split 2 cols on large screens */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <div className="w-full">
                                <InterviewCoach />
                            </div>
                            <div className="w-full">
                                <LearningRecommendations />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
