import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const res = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: { 'x-auth-token': token }
                });
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
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/profile/me', formData, {
                headers: { 'x-auth-token': token }
            });
            setUser(res.data);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading...</div>;

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/login');
                        }}
                        className="btn btn-secondary"
                    >
                        Logout
                    </button>
                </div>

                <div className="bg-surface rounded-xl p-6 border border-secondary/20 shadow-lg mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-primary hover:text-primary-hover"
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    {isEditing ? (
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={onChange}
                                        className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={onChange}
                                        className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Headline</label>
                                <input
                                    type="text"
                                    name="headline"
                                    value={formData.headline}
                                    onChange={onChange}
                                    className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g. Full Stack Developer"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={onChange}
                                    rows="4"
                                    className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Skills (comma separated)</label>
                                <input
                                    type="text"
                                    name="skills"
                                    value={formData.skills}
                                    onChange={onChange}
                                    className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">LinkedIn URL</label>
                                    <input
                                        type="text"
                                        name="socials.linkedin"
                                        value={formData.socials.linkedin}
                                        onChange={onChange}
                                        className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">GitHub URL</label>
                                    <input
                                        type="text"
                                        name="socials.github"
                                        value={formData.socials.github}
                                        onChange={onChange}
                                        className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Website URL</label>
                                    <input
                                        type="text"
                                        name="socials.website"
                                        value={formData.socials.website}
                                        onChange={onChange}
                                        className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-white">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">
                                        {user.profile?.firstName} {user.profile?.lastName}
                                    </h3>
                                    <p className="text-primary">{user.profile?.headline || 'No headline set'}</p>
                                    <p className="text-slate-400">@{user.username}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-medium text-white mb-2">About</h4>
                                <p className="text-slate-300">{user.profile?.bio || 'No bio added yet.'}</p>
                            </div>

                            <div>
                                <h4 className="text-lg font-medium text-white mb-2">Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {user.profile?.skills?.map((skill, index) => (
                                        <span key={index} className="bg-secondary/20 text-slate-200 px-3 py-1 rounded-full text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                    {(!user.profile?.skills || user.profile.skills.length === 0) && (
                                        <p className="text-slate-400 text-sm">No skills added yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <Projects />
                <ResumeParser />
                <InterviewCoach />
                <LearningRecommendations />
            </div>
        </div>
    );
};

export default Dashboard;
