import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Send, Mic, StopCircle, Play, Loader2, User, Bot, Award } from 'lucide-react';

const InterviewCoach = () => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isInterviewStarted, setIsInterviewStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [loadingAI, setLoadingAI] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [sessionSummary, setSessionSummary] = useState(null);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            newSocket.emit('join_interview', 'interview_room_1');
        });

        newSocket.on('receive_message', (message) => {
            console.log("Received message:", message);
            setMessages((prev) => [...prev, message]);
        });

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startInterview = async () => {
        try {
            setLoadingAI(true);
            setSessionSummary(null);
            setMessages([]);
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/interview/start',
                { resumeText: "Node.js Developer..." },
                { headers: { 'x-auth-token': token } }
            );

            setSessionId(res.data.sessionId);
            setIsInterviewStarted(true);
            const firstQuestion = res.data.questions[0];
            setCurrentQuestion(firstQuestion);

            const messageData = {
                room: 'interview_room_1',
                message: firstQuestion,
                sender: 'ai',
                timestamp: new Date().toISOString()
            };
            socket.emit('send_message', messageData);
            setLoadingAI(false);
        } catch (err) {
            console.error(err);
            setLoadingAI(false);
        }
    };

    const endInterview = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/interview/end',
                { sessionId },
                { headers: { 'x-auth-token': token } }
            );
            setSessionSummary(res.data);
            setIsInterviewStarted(false);
            setSessionId(null);
        } catch (err) {
            console.error(err);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (input.trim() && socket) {
            const userMessage = {
                room: 'interview_room_1',
                message: input,
                sender: 'user',
                timestamp: new Date().toISOString()
            };

            socket.emit('send_message', userMessage);
            setInput('');
            setLoadingAI(true);

            try {
                const token = localStorage.getItem('token');
                const res = await axios.post('http://localhost:5000/api/interview/answer',
                    { sessionId, question: currentQuestion, answer: input },
                    { headers: { 'x-auth-token': token } }
                );

                const feedbackMessage = {
                    room: 'interview_room_1',
                    message: `Feedback: ${res.data.feedback} (Score: ${res.data.score}/100)`,
                    sender: 'system',
                    timestamp: new Date().toISOString()
                };
                socket.emit('send_message', feedbackMessage);

                // Use the dynamically generated next question from the backend
                const nextQuestion = res.data.nextQuestion || "Could you provide more details on your experience?";
                setCurrentQuestion(nextQuestion);
                const nextQMessage = {
                    room: 'interview_room_1',
                    message: nextQuestion,
                    sender: 'ai',
                    timestamp: new Date().toISOString()
                };
                socket.emit('send_message', nextQMessage);
                setLoadingAI(false);

            } catch (err) {
                console.error(err);
                setLoadingAI(false);
            }
        }
    };

    if (sessionSummary) {
        return (
            <div className="mt-8 bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <Award className="w-8 h-8 text-yellow-400" />
                    <h2 className="text-2xl font-bold text-white">Interview Summary</h2>
                </div>

                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 p-6 rounded-xl border border-white/10 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/5 mask-image-gradient-to-b" />
                        <p className="text-slate-300 mb-2 relative z-10">Overall Performance Score</p>
                        <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 relative z-10">
                            {sessionSummary.averageScore}<span className="text-2xl text-slate-500">/100</span>
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            Detailed Feedback
                        </h3>
                        {sessionSummary.scores.map((item, index) => (
                            <div key={index} className="bg-white/5 p-5 rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
                                <div className="mb-3">
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Question {index + 1}</span>
                                    <p className="text-white font-medium mt-1">{item.question}</p>
                                </div>
                                <div className="mb-3 pl-4 border-l-2 border-slate-700">
                                    <p className="text-slate-400 text-sm italic">"{item.answer}"</p>
                                </div>
                                <div className="flex justify-between items-start gap-4 bg-black/20 p-3 rounded-lg">
                                    <p className="text-sm text-slate-300 flex-1"><span className="text-yellow-400 font-bold">Feedback:</span> {item.feedback}</p>
                                    <span className={`text-sm font-bold px-2 py-1 rounded ${item.score >= 70 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {item.score}/100
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={() => setSessionSummary(null)} className="btn btn-secondary w-full py-3 font-semibold">
                        Start New Session
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-white/5 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-2xl h-[700px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-black/20 p-4 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">AI Interview Coach</h2>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-xs text-slate-400">{isConnected ? 'Online' : 'Offline'}</span>
                        </div>
                    </div>
                </div>

                {!isInterviewStarted ? (
                    <button
                        onClick={startInterview}
                        disabled={!isConnected || loadingAI}
                        className="btn btn-primary text-sm px-6 py-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                    >
                        Start Interview
                    </button>
                ) : (
                    <button
                        onClick={endInterview}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium border border-red-500/20"
                    >
                        <StopCircle className="w-4 h-4" /> End Session
                    </button>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-black/20">
                {messages.length === 0 && !isInterviewStarted && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                            <Bot className="w-12 h-12 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Ready to practice?</h3>
                        <p className="text-slate-400 max-w-md">
                            Our AI coach will simulate a real technical interview based on your resume.
                            You'll receive real-time feedback on your answers.
                        </p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${msg.sender === 'user' ? 'bg-slate-700' : msg.sender === 'system' ? 'bg-yellow-500/20' : 'bg-primary/20'
                            }`}>
                            {msg.sender === 'user' ? <User className="w-4 h-4 text-slate-300" /> :
                                msg.sender === 'system' ? <Award className="w-4 h-4 text-yellow-400" /> :
                                    <Bot className="w-4 h-4 text-primary" />}
                        </div>

                        <div className={`max-w-[80%] space-y-1`}>
                            <div className={`p-4 rounded-2xl shadow-sm ${msg.sender === 'user'
                                ? 'bg-primary text-white rounded-tr-none'
                                : msg.sender === 'system'
                                    ? 'bg-yellow-500/10 text-yellow-100 border border-yellow-500/20'
                                    : 'bg-white/10 text-slate-100 rounded-tl-none border border-white/5'
                                }`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                            </div>
                            <span className={`text-[10px] text-slate-500 px-1 block ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {loadingAI && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                            <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-white/5 text-slate-300 p-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm">Analyzing your response...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/20 border-t border-white/5">
                <form onSubmit={sendMessage} className="flex gap-3 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isInterviewStarted ? "Type your answer here..." : "Start the interview to begin chatting..."}
                        disabled={!isInterviewStarted || loadingAI}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!isConnected || !isInterviewStarted || loadingAI || !input.trim()}
                        className="btn btn-primary px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InterviewCoach;
