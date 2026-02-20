import React, { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Sparkles } from 'lucide-react'

const botReplies = {
    default: [
        "Hi! I'm EduBot 🤖 How can I help you today?",
        "Sure! Let me help you with that.",
        "Great question! Here's what I found for you.",
        "I'm here to assist you anytime!",
    ],
    attendance: [
        "Your attendance is tracked daily. Make sure to mark it before class starts!",
        "Average attendance requirement is 75%. You're looking good! ✅",
    ],
    result: [
        "Your latest results have been published. Check the Results tab for details!",
        "You can download your marksheet from the Results page.",
    ],
    notes: [
        "Notes are uploaded by your subject teachers. Check the Notes section!",
        "You can filter notes by subject or date.",
    ],
    fees: [
        "Your current fee status is available in the Fees section.",
        "Due date for semester fees is 15th March. Pay online via the Fees tab!",
    ],
    schedule: [
        "Your timetable is available in the Timetable section.",
        "Classes run from 9 AM to 4 PM. Check the timetable for your schedule!",
    ],
    hello: ["Hello! 👋 How are you today? How can I assist you?"],
    help: ["I can help you with attendance, results, fees, timetable, notes, and more! Just ask."],
}

function getReply(msg) {
    const m = msg.toLowerCase()
    if (/hello|hi|hey|howdy/.test(m)) return botReplies.hello[0]
    if (/attend/.test(m)) return botReplies.attendance[Math.floor(Math.random() * botReplies.attendance.length)]
    if (/result|grade|mark|score/.test(m)) return botReplies.result[Math.floor(Math.random() * botReplies.result.length)]
    if (/note|material|subject/.test(m)) return botReplies.notes[Math.floor(Math.random() * botReplies.notes.length)]
    if (/fee|payment|due/.test(m)) return botReplies.fees[Math.floor(Math.random() * botReplies.fees.length)]
    if (/schedule|timetable|class|time/.test(m)) return botReplies.schedule[Math.floor(Math.random() * botReplies.schedule.length)]
    if (/help|what can/.test(m)) return botReplies.help[0]
    return botReplies.default[Math.floor(Math.random() * botReplies.default.length)]
}

export default function Chatbot({ accentColor = 'var(--accent-purple)' }) {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([
        { from: 'bot', text: "Hi! I'm EduBot 🤖 Ask me anything about attendance, results, fees, timetable, or notes!" }
    ])
    const [input, setInput] = useState('')
    const [typing, setTyping] = useState(false)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, typing])

    const sendMessage = () => {
        const text = input.trim()
        if (!text) return
        setInput('')
        setMessages(prev => [...prev, { from: 'user', text }])
        setTyping(true)
        setTimeout(() => {
            setTyping(false)
            setMessages(prev => [...prev, { from: 'bot', text: getReply(text) }])
        }, 900 + Math.random() * 600)
    }

    const handleKey = (e) => { if (e.key === 'Enter') sendMessage() }

    return (
        <>
            {open && (
                <div className="chatbot-panel">
                    <div className="chat-header">
                        <div className="flex-row" style={{ gap: 10 }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: '50%',
                                background: `linear-gradient(135deg, ${accentColor}, #9c6cff)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Bot size={18} color="#fff" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>EduBot</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--accent-teal)' }}>● Online</div>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className="chat-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`chat-bubble ${m.from}`}>{m.text}</div>
                        ))}
                        {typing && (
                            <div className="chat-bubble bot" style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '12px 16px' }}>
                                <span style={{ animation: 'pulse-glow 1s infinite', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-purple)', display: 'inline-block' }} />
                                <span style={{ animation: 'pulse-glow 1s 0.2s infinite', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-purple)', display: 'inline-block' }} />
                                <span style={{ animation: 'pulse-glow 1s 0.4s infinite', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-purple)', display: 'inline-block' }} />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input-row">
                        <input
                            className="chat-input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Ask anything..."
                        />
                        <button className="chat-send" onClick={sendMessage} style={{ background: accentColor }}>
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
            <button className="chatbot-fab" onClick={() => setOpen(o => !o)} style={{ background: `linear-gradient(135deg, ${accentColor}, #9c6cff)` }}>
                {open ? <X size={22} color="#fff" /> : <Sparkles size={22} color="#fff" />}
            </button>
        </>
    )
}
