import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Send, StopCircle, Play, Loader2, User, Bot, Award } from 'lucide-react';

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
    }, [messages]);

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

            // 2. Add system feedback
            const feedbackMsg = {
                sender: 'system',
                message: `Feedback: ${res.data.feedback} (Score: ${res.data.score})`,
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
            setMessages(prev => [...prev, { sender: 'system', message: 'Error processing answer.' }]);
        } finally {
            setLoadingAI(false);
        }
    };

    if (sessionSummary) {
        return (
            <div className="mt-8 bg-surface p-8 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in">
                <div className="flex items-center gap-3 mb-8">
                    <Award className="w-8 h-8 text-yellow-400" />
                    <h2 className="text-2xl font-bold text-white">Interview Summary</h2>
                </div>
                <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 p-6 rounded-xl border border-white/10 text-center mb-8">
                    <p className="text-slate-300 mb-2">Overall Performance Score</p>
                    <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                        {sessionSummary.averageScore}<span className="text-2xl text-slate-500">/100</span>
                    </p>
                </div>
                <button onClick={() => setSessionSummary(null)} className="btn btn-secondary w-full py-3 font-semibold">
                    Start New Session
                </button>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-surface rounded-2xl border border-white/10 shadow-2xl h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20 rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">AI Interview Coach</h2>
                        <p className="text-xs text-slate-400">{isInterviewStarted ? 'Interview in Progress' : 'Ready to Start'}</p>
                    </div>
                </div>
                {!isInterviewStarted ? (
                    <button onClick={startInterview} disabled={loadingAI} className="btn btn-primary text-sm px-4 py-2 flex items-center gap-2">
                        {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Start
                    </button>
                ) : (
                    <button onClick={endInterview} className="btn btn-secondary text-sm px-4 py-2 text-red-400 border-red-500/30 hover:bg-red-500/10">
                        <StopCircle className="w-4 h-4 mr-2" /> End
                    </button>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 
                            ${msg.sender === 'user' ? 'bg-primary' : msg.sender === 'system' ? 'bg-yellow-500/20' : 'bg-slate-700'}`}>
                            {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> :
                                msg.sender === 'system' ? <Award className="w-4 h-4 text-yellow-400" /> :
                                    <Bot className="w-4 h-4 text-slate-300" />}
                        </div>
                        <div className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed
                            ${msg.sender === 'user' ? 'bg-primary text-white rounded-tr-none' :
                                msg.sender === 'system' ? 'bg-yellow-500/10 text-yellow-200 border border-yellow-500/20' :
                                    'bg-white/10 text-slate-200 rounded-tl-none'}`}>
                            {msg.message}
                        </div>
                    </div>
                ))}
                {loadingAI && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-slate-300" />
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl rounded-tl-none flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm text-slate-400">AI is thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-black/20 rounded-b-2xl">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={!isInterviewStarted || loadingAI}
                        placeholder={isInterviewStarted ? "Type your answer..." : "Click Start to begin"}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-50"
                    />
                    <button type="submit" disabled={!isInterviewStarted || loadingAI || !input.trim()}
                        className="btn btn-primary px-4 rounded-lg disabled:opacity-50">
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InterviewCoach;