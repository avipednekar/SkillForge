import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Send, StopCircle, Play, Loader2, User, Bot, Award, Sparkles } from 'lucide-react';

const InterviewCoach = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isInterviewStarted, setIsInterviewStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [loadingAI, setLoadingAI] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [sessionSummary, setSessionSummary] = useState(null);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loadingAI]);

    const startInterview = async () => {
        try {
            setLoadingAI(true);
            setSessionSummary(null);
            setMessages([]);

            // In a real app, fetch the actual resume text from profile
            const res = await api.post('/interview/start',
                { resumeText: "Candidate Resume Context..." }
            );

            setSessionId(res.data.sessionId);
            setIsInterviewStarted(true);

            const firstQuestion = res.data.questions[0];
            setCurrentQuestion(firstQuestion);

            setMessages([{
                sender: 'ai',
                message: firstQuestion,
                timestamp: new Date().toISOString()
            }]);

            setLoadingAI(false);
        } catch (err) {
            console.error(err);
            setLoadingAI(false);
            alert("Failed to start interview. Ensure backend is running.");
        }
    };

    const endInterview = async () => {
        if (!sessionId) return;
        try {
            const res = await api.post('/interview/end', { sessionId });
            setSessionSummary(res.data);
            setIsInterviewStarted(false);
            setSessionId(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = {
            sender: 'user',
            message: input,
            timestamp: new Date().toISOString()
        };

        // 1. Add user message immediately
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoadingAI(true);

        try {
            const res = await api.post('/interview/answer', {
                sessionId,
                question: currentQuestion,
                answer: input
            });

            // 2. Add system feedback (Coach's Note)
            const feedbackMsg = {
                sender: 'system',
                message: res.data.feedback,
                score: res.data.score,
                timestamp: new Date().toISOString()
            };

            // 3. Add next question
            const nextQuestion = res.data.nextQuestion || "Could you provide more details?";
            const nextQMsg = {
                sender: 'ai',
                message: nextQuestion,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, feedbackMsg, nextQMsg]);
            setCurrentQuestion(nextQuestion);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { sender: 'system', message: 'Error processing answer.', isError: true }]);
        } finally {
            setLoadingAI(false);
        }
    };

    if (sessionSummary) {
        return (
            <div className="h-full bg-surface p-8 rounded-2xl border border-white/10 shadow-xl animate-in fade-in zoom-in duration-300 flex flex-col justify-center">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                        <Award className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Interview Complete!</h2>
                    <p className="text-slate-400 mb-8 max-w-md">Great job practicing. Here's how you performed in this session.</p>

                    <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                        {/* Simple CSS circular progress representation */}
                        <div className="absolute inset-0 rounded-full border-8 border-white/5"></div>
                        <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent animate-spin-slow" style={{ animationDuration: '3s' }}></div>
                        <div className="flex flex-col items-center">
                            <span className="text-5xl font-black text-white">{sessionSummary.averageScore}</span>
                            <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold mt-1">Score</span>
                        </div>
                    </div>

                    <button onClick={() => setSessionSummary(null)}
                        className="btn btn-primary px-8 py-3 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
                        Start New Session
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-surface rounded-2xl border border-white/10 shadow-xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        {isInterviewStarted && (
                            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-surface rounded-full animate-pulse"></span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            Interview Coach
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">Beta</span>
                        </h2>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            {isInterviewStarted ? (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Session Active
                                </>
                            ) : 'Ready to start'}
                        </p>
                    </div>
                </div>
                {!isInterviewStarted ? (
                    <button onClick={startInterview} disabled={loadingAI}
                        className="btn btn-primary text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                        {loadingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                        Start
                    </button>
                ) : (
                    <button onClick={endInterview}
                        className="px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/50 transition-all flex items-center gap-2 text-xs font-medium">
                        <StopCircle className="w-3 h-3" /> End
                    </button>
                )}
            </div>

            {/* Chat Area - flex-1 allows it to take remaining height */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 bg-gradient-to-b from-transparent to-black/20">
                {!isInterviewStarted && messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-8">
                        <Bot className="w-16 h-16 text-slate-600 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Your Personal Interview Coach</h3>
                        <p className="text-sm text-slate-400 max-w-sm">
                            Click "Start" to begin a realistic mock interview tailored to your resume.
                        </p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>

                        {/* System Feedback / Coach's Note */}
                        {msg.sender === 'system' && (
                            <div className="w-full max-w-2xl mx-auto mb-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/50"></div>
                                <div className="flex gap-3">
                                    <div className="mt-0.5">
                                        <Sparkles className="w-4 h-4 text-yellow-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Coach's Feedback</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${msg.score >= 80 ? 'bg-green-500/20 text-green-400' :
                                                    msg.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                }`}>
                                                Score: {msg.score}/100
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed">{msg.message}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Chat Messages */}
                        {msg.sender !== 'system' && (
                            <div className={`flex gap-3 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg mt-1
                                    ${msg.sender === 'user' ? 'bg-primary' : 'bg-slate-700'}`}>
                                    {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                                </div>

                                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-md
                                    ${msg.sender === 'user'
                                        ? 'bg-primary text-white rounded-tr-none'
                                        : 'bg-white/10 text-slate-100 rounded-tl-none border border-white/5'}`}>
                                    {msg.message}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing Indicator */}
                {loadingAI && (
                    <div className="flex gap-3 items-start animate-in fade-in duration-300">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shadow-lg">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 h-[52px]">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-sm">
                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={!isInterviewStarted || loadingAI}
                        placeholder={isInterviewStarted ? "Type your answer..." : "Start session to chat"}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={!isInterviewStarted || loadingAI || !input.trim()}
                        className="absolute right-2 p-1.5 rounded-lg bg-primary text-white disabled:opacity-0 disabled:scale-90 transition-all hover:bg-primary-hover shadow-lg shadow-primary/20"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InterviewCoach;