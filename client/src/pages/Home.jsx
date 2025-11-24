import React from 'react';
import { Link } from 'react-router-dom';
import {
    Sparkles,
    FileText,
    MessageSquare,
    TrendingUp,
    Award,
    Users,
    CheckCircle,
    ArrowRight,
    Star,
    Zap,
    Target,
    BarChart
} from 'lucide-react';
import heroBanner from '../assets/hero_banner.png';
import aiResume from '../assets/ai_resume.png';
import interviewCoach from '../assets/interview_coach.png';
import learningPath from '../assets/learning_path.png';

const Home = () => {
    return (
        <div className="min-h-screen bg-background text-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20"></div>
                <img
                    src={heroBanner}
                    alt="SkillForge"
                    className="absolute inset-0 w-full h-full object-cover opacity-10"
                />
                <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <Sparkles className="w-8 h-8 text-primary" />
                            <span className="text-primary font-semibold text-lg">AI-Powered Career Development</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Welcome to SkillForge
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed">
                            Transform your career journey with AI-powered resume optimization,
                            personalized interview coaching, and intelligent learning recommendations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="btn btn-primary text-lg px-8 py-4 group">
                                Get Started Free
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/login" className="btn btn-secondary text-lg px-8 py-4">
                                Sign In
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-secondary/20">
                            <div>
                                <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                                <div className="text-slate-400">Active Users</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                                <div className="text-slate-400">Success Rate</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-primary mb-2">50K+</div>
                                <div className="text-slate-400">Resumes Optimized</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-surface/30">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Powerful Features to Accelerate Your Career
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Everything you need to stand out in the job market, powered by cutting-edge AI
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* AI Resume Parser */}
                        <div className="bg-surface rounded-2xl p-8 border border-secondary/20 hover:border-primary/50 transition-all group">
                            <img src={aiResume} alt="AI Resume Parser" className="w-full h-48 object-cover rounded-lg mb-6" />
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold">AI Resume Parser</h3>
                            </div>
                            <p className="text-slate-300 mb-6">
                                Upload your resume and let our AI extract, analyze, and optimize your skills,
                                experience, and achievements with intelligent suggestions.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Automatic skill extraction</span>
                                </li>
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>ATS optimization tips</span>
                                </li>
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Industry-specific recommendations</span>
                                </li>
                            </ul>
                        </div>

                        {/* AI Interview Coach */}
                        <div className="bg-surface rounded-2xl p-8 border border-secondary/20 hover:border-primary/50 transition-all group">
                            <img src={interviewCoach} alt="AI Interview Coach" className="w-full h-48 object-cover rounded-lg mb-6" />
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                                    <MessageSquare className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold">AI Interview Coach</h3>
                            </div>
                            <p className="text-slate-300 mb-6">
                                Practice with our intelligent AI interviewer that adapts to your responses,
                                provides real-time feedback, and helps you ace your interviews.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Personalized interview questions</span>
                                </li>
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Real-time answer evaluation</span>
                                </li>
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Detailed performance analytics</span>
                                </li>
                            </ul>
                        </div>

                        {/* Learning Recommendations */}
                        <div className="bg-surface rounded-2xl p-8 border border-secondary/20 hover:border-primary/50 transition-all group">
                            <img src={learningPath} alt="Learning Path" className="w-full h-48 object-cover rounded-lg mb-6" />
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                                    <TrendingUp className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold">Learning Paths</h3>
                            </div>
                            <p className="text-slate-300 mb-6">
                                Get personalized course recommendations based on your skills, goals, and
                                industry trends to continuously upskill and stay competitive.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Skill gap analysis</span>
                                </li>
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Curated learning resources</span>
                                </li>
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Progress tracking</span>
                                </li>
                            </ul>
                        </div>

                        {/* Portfolio Builder */}
                        <div className="bg-surface rounded-2xl p-8 border border-secondary/20 hover:border-primary/50 transition-all group">
                            <div className="h-48 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg mb-6 flex items-center justify-center">
                                <Award className="w-24 h-24 text-primary/50" />
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                                    <Award className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold">Portfolio Builder</h3>
                            </div>
                            <p className="text-slate-300 mb-6">
                                Create a stunning portfolio to showcase your projects, skills, and achievements
                                with customizable templates.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Professional templates</span>
                                </li>
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Project showcase</span>
                                </li>
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Share with recruiters</span>
                                </li>
                            </ul>
                        </div>

                        {/* Vector DB (RAG) */}
                        <div className="bg-surface rounded-2xl p-8 border border-secondary/20 hover:border-primary/50 transition-all group">
                            <div className="h-48 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg mb-6 flex items-center justify-center">
                                <Target className="w-24 h-24 text-primary/50" />
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                                    <Zap className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold">Smart Matching</h3>
                            </div>
                            <p className="text-slate-300 mb-6">
                                Our RAG-powered vector database matches you with relevant opportunities,
                                questions, and resources based on your unique profile.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Semantic search</span>
                                </li>
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Context-aware recommendations</span>
                                </li>
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Personalized insights</span>
                                </li>
                            </ul>
                        </div>

                        {/* Analytics */}
                        <div className="bg-surface rounded-2xl p-8 border border-secondary/20 hover:border-primary/50 transition-all group">
                            <div className="h-48 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-lg mb-6 flex items-center justify-center">
                                <BarChart className="w-24 h-24 text-primary/50" />
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                                    <BarChart className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold">Performance Analytics</h3>
                            </div>
                            <p className="text-slate-300 mb-6">
                                Track your progress with detailed analytics on interview performance,
                                skill development, and application success rates.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Interview score trends</span>
                                </li>
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Skill progression charts</span>
                                </li>
                                <li className="flex items-start gap-2 text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>Actionable insights</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Loved by Job Seekers Worldwide
                        </h2>
                        <p className="text-xl text-slate-400">
                            See what our users have to say about their SkillForge experience
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Sarah Chen",
                                role: "Software Engineer",
                                company: "Tech Giant Inc.",
                                quote: "SkillForge's AI interview coach helped me prepare for technical interviews. I landed my dream job within 2 months!",
                                rating: 5
                            },
                            {
                                name: "Michael Rodriguez",
                                role: "Product Manager",
                                company: "Startup XYZ",
                                quote: "The resume optimization feature is incredible. My resume got noticed by recruiters immediately after using SkillForge.",
                                rating: 5
                            },
                            {
                                name: "Emily Thompson",
                                role: "Data Scientist",
                                company: "AI Research Lab",
                                quote: "The personalized learning paths helped me upskill in machine learning. Best career investment I've made!",
                                rating: 5
                            }
                        ].map((testimonial, idx) => (
                            <div key={idx} className="bg-surface rounded-2xl p-8 border border-secondary/20">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{testimonial.name}</div>
                                        <div className="text-sm text-slate-400">{testimonial.role} at {testimonial.company}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Transform Your Career?
                    </h2>
                    <p className="text-xl text-slate-300 mb-10">
                        Join thousands of professionals who are accelerating their careers with SkillForge
                    </p>
                    <Link to="/register" className="btn btn-primary text-lg px-10 py-5 inline-flex items-center gap-2 group">
                        Start Your Free Trial
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <p className="mt-6 text-slate-400">
                        No credit card required • Free forever plan available
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-secondary/20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-primary" />
                            <span className="text-xl font-bold">SkillForge</span>
                        </div>
                        <div className="text-slate-400 text-sm">
                            © 2024 SkillForge. All rights reserved. Empowering careers with AI.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
