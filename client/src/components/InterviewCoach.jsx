import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

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
            setMessages((prev) => {
                if (prev.some(m => m.timestamp === message.timestamp && m.message === message.message)) {
                    return prev;
                }
                return [...prev, message];
            });
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

                setTimeout(() => {
                    const nextQuestion = "How do you handle error handling in Express.js?";
                    setCurrentQuestion(nextQuestion);
                    const nextQMessage = {
                        room: 'interview_room_1',
                        message: nextQuestion,
                        sender: 'ai',
                        timestamp: new Date().toISOString()
                    };
                    socket.emit('send_message', nextQMessage);
                    setLoadingAI(false);
                }, 1000);

            } catch (err) {
                console.error(err);
                setLoadingAI(false);
            }
        }
    };

    if (sessionSummary) {
        return (
            <div className="mt-8 bg-surface p-6 rounded-xl border border-secondary/20 shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-6">Interview Summary</h2>
                <div className="space-y-6">
                    <div className="bg-background p-4 rounded-lg border border-secondary/30 text-center">
                        <p className="text-slate-400 mb-1">Average Score</p>
                        <p className="text-4xl font-bold text-primary">{sessionSummary.averageScore}/100</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Detailed Feedback</h3>
                        {sessionSummary.scores.map((item, index) => (
                            <div key={index} className="bg-background p-4 rounded-lg border border-secondary/30">
                                <p className="text-white font-medium mb-2">Q: {item.question}</p>
                                <p className="text-slate-300 mb-2">A: {item.answer}</p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-primary">{item.feedback}</span>
                                    <span className="font-bold text-white">Score: {item.score}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={() => setSessionSummary(null)} className="btn btn-secondary w-full">
                        Start New Interview
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-surface p-6 rounded-xl border border-secondary/20 shadow-lg h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-secondary/20 pb-4">
                <h2 className="text-xl font-semibold text-white">AI Interview Coach</h2>
                <div className="flex items-center gap-4">
                    {!isInterviewStarted ? (
                        <button
                            onClick={startInterview}
                            disabled={!isConnected || loadingAI}
                            className="btn btn-primary text-xs px-3 py-1"
                        >
                            Start Interview
                        </button>
                    ) : (
                        <button
                            onClick={endInterview}
                            className="btn btn-secondary text-xs px-3 py-1 bg-red-500/20 text-red-300 hover:bg-red-500/30 border-red-500/30"
                        >
                            End Interview
                        </button>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs ${isConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.length === 0 && !isInterviewStarted && (
                    <div className="text-center text-slate-400 mt-20">
                        <p>Click "Start Interview" to begin your session.</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user'
                                    ? 'bg-primary text-white rounded-br-none'
                                    : msg.sender === 'system'
                                        ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30'
                                        : 'bg-secondary/30 text-slate-200 rounded-bl-none'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                            <span className="text-xs opacity-50 mt-1 block">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                {loadingAI && (
                    <div className="flex justify-start">
                        <div className="bg-secondary/30 text-slate-200 rounded-lg rounded-bl-none p-3">
                            <p className="animate-pulse">AI is thinking...</p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isInterviewStarted ? "Type your answer..." : "Start interview to chat..."}
                    disabled={!isInterviewStarted || loadingAI}
                    className="flex-1 bg-background border border-secondary/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={!isConnected || !isInterviewStarted || loadingAI}
                    className="btn btn-primary px-6 disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default InterviewCoach;
