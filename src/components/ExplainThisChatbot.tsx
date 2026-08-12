import React, { useState, useEffect, useRef } from 'react';
import { Question, ChatMessage, ChatAttachment } from '../types';
import { explainQuestionAi, sendMultimodalChatMessageAi } from '../services/api';
import {
  Bot,
  Send,
  X,
  Sparkles,
  User,
  Paperclip,
  Image as ImageIcon,
  Mic,
  MicOff,
  FileText,
  Music,
  Trash2,
  Volume2
} from 'lucide-react';

interface ExplainThisChatbotProps {
  question?: Question | null;
  userSelectedOption?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainThisChatbot: React.FC<ExplainThisChatbotProps> = ({
  question,
  userSelectedOption,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const PRESET_PROMPTS = question
    ? [
        '⚡ Give me a 10-second mental math shortcut',
        '📚 Explain the core formula/rule behind this',
        '❌ Why is my selected option incorrect?',
        '🎯 How to identify similar questions in exams?',
      ]
    : [
        '📚 Solve my Math / Aptitude doubt',
        '💻 Debug code or explain CS concept',
        '🏛️ Explain Indian Polity / Current Affairs',
        '📄 Summarize attached Notification / Notes PDF',
      ];

  // Initialize chatbot messages when opened
  useEffect(() => {
    if (isOpen) {
      if (question) {
        const initialMessage: ChatMessage = {
          id: `msg_init_${Date.now()}`,
          sender: 'assistant',
          text: `Hello! I'm **HARSHA'S** for CrackIt AI.\n\nLet me break down this ${question.topicTag || 'Question'} step-by-step with formulas and speed tricks:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([initialMessage]);
        fetchInitialExplanation(question);
      } else if (messages.length === 0) {
        const initialMessage: ChatMessage = {
          id: `msg_init_global_${Date.now()}`,
          sender: 'assistant',
          text: `👋 Welcome to **HARSHA'S** on CrackIt AI!\n\nI am your Gemini-powered multimodal AI Tutor. Ask me any question or upload:\n• 📄 **Documents & PDFs** (Syllabus, Exam Notifications, Study Notes)\n• 🖼️ **Images** (Math formulas, Question screenshots)\n• 🎙️ **Audio Recordings** (Speak your doubt directly!)\n\nHow can I help your preparation today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([initialMessage]);
      }
    }
  }, [question, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle voice recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const fetchInitialExplanation = async (q: Question) => {
    setIsLoading(true);
    try {
      const responseText = await explainQuestionAi({
        questionText: q.questionText,
        options: q.options,
        correctOption: q.correctOption,
        userSelectedOption,
        explanation: q.explanation,
        userQuery: 'Provide a step-by-step breakdown with core concept and fast resolution technique.',
      });

      const aiMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: 'Standard Explanation:\n' + (q.explanation || 'Detailed explanation not available.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<{ base64Data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const commaIndex = result.indexOf(',');
        const base64Data = commaIndex !== -1 ? result.substring(commaIndex + 1) : result;
        const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'text/plain');
        resolve({ base64Data, mimeType });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isImageOnly = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const { base64Data, mimeType } = await fileToBase64(file);
        let type: 'image' | 'doc' | 'audio' = 'doc';
        if (mimeType.startsWith('image/')) type = 'image';
        else if (mimeType.startsWith('audio/')) type = 'audio';

        const previewUrl = type === 'image' ? URL.createObjectURL(file) : undefined;

        const newAtt: ChatAttachment = {
          id: `att_${Date.now()}_${i}`,
          name: file.name,
          type,
          mimeType,
          base64Data,
          previewUrl,
        };

        setAttachments((prev) => [...prev, newAtt]);
      } catch (err) {
        console.error('Failed to attach file', err);
      }
    }

    // Reset input
    e.target.value = '';
  };

  // Start / Stop Voice Recorder
  const toggleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], `Voice_Note_${Date.now()}.webm`, {
            type: 'audio/webm',
          });
          const { base64Data, mimeType } = await fileToBase64(audioFile);

          const audioAttachment: ChatAttachment = {
            id: `att_voice_${Date.now()}`,
            name: `Voice Query (${recordingSeconds}s)`,
            type: 'audio',
            mimeType: mimeType || 'audio/webm',
            base64Data,
            previewUrl: URL.createObjectURL(audioBlob),
          };

          setAttachments((prev) => [...prev, audioAttachment]);

          // Stop all audio tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        alert('Microphone access is required to record voice notes.');
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputValue.trim();
    if ((!textToSend && attachments.length === 0) || isLoading) return;

    const currentAttachments = [...attachments];
    if (!queryText) {
      setInputValue('');
      setAttachments([]);
    }

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: textToSend || 'Please process my attached files/recording:',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: currentAttachments,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let aiReply = '';
      if (currentAttachments.length > 0 || !question) {
        // Use universal multimodal chat API
        const contextStr = question
          ? `Current Exam Question: "${question.questionText}" | Topic: ${question.topicTag}`
          : 'CrackIt AI Preparation Platform';

        aiReply = await sendMultimodalChatMessageAi({
          message: textToSend,
          attachments: currentAttachments.map((a) => ({
            name: a.name,
            mimeType: a.mimeType,
            base64Data: a.base64Data,
          })),
          contextPrompt: contextStr,
        });
      } else {
        // Standard question doubt solver
        aiReply = await explainQuestionAi({
          questionText: question.questionText,
          options: question.options,
          correctOption: question.correctOption,
          userSelectedOption,
          explanation: question.explanation,
          userQuery: textToSend,
        });
      }

      const aiMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'assistant',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errReply: ChatMessage = {
        id: `msg_ai_err_${Date.now()}`,
        sender: 'assistant',
        text: `Error processing query: ${err?.message || 'Unable to connect to Gemini API.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errReply]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg h-full glass-panel border-l border-sky-500/30 bg-slate-950/95 backdrop-blur-3xl flex flex-col shadow-2xl relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.csv,audio/*"
          className="hidden"
          onChange={(e) => handleFileUpload(e, false)}
        />
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileUpload(e, true)}
        />

        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 text-white shadow-lg shadow-sky-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white tracking-tight">HARSHA'S</h3>
                <span className="px-2 py-0.5 text-[9px] font-extrabold bg-sky-500/20 text-sky-300 rounded-full border border-sky-500/30">
                  Multimodal Gemini
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Accepts Text • PDFs • Images • Voice Audio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Context Banner if active */}
        {question && (
          <div className="p-3 bg-slate-900/90 border-b border-white/10 space-y-1 relative z-10">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                {question.topicTag}
              </span>
              {question.pyqSource && (
                <span className="text-purple-300 font-semibold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {question.pyqSource}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-200 font-medium line-clamp-2 mt-0.5">"{question.questionText}"</p>
          </div>
        )}

        {/* Quick Presets */}
        <div className="p-2 bg-slate-950/80 border-b border-white/5 flex gap-1.5 overflow-x-auto custom-scrollbar relative z-10">
          {PRESET_PROMPTS.map((promptText, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(promptText)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-xl text-[10px] font-semibold bg-slate-900 text-slate-300 border border-white/10 hover:border-sky-400/50 hover:text-sky-300 transition-all shrink-0 disabled:opacity-50"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 relative z-10 custom-scrollbar">
          {messages.map((msg) => {
            const isAi = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAi ? 'items-start' : 'items-end flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    isAi
                      ? 'bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {isAi ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isAi
                      ? 'bg-slate-900/90 text-slate-100 border border-sky-500/20 shadow-xl whitespace-pre-wrap'
                      : 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white shadow-lg'
                  }`}
                >
                  {/* Attachments rendering inside user bubble */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2.5 space-y-2">
                      {msg.attachments.map((att) => (
                        <div key={att.id} className="rounded-xl overflow-hidden bg-black/30 border border-white/20 p-2">
                          {att.type === 'image' && att.previewUrl ? (
                            <img src={att.previewUrl} alt={att.name} className="max-h-40 rounded-lg object-contain w-full" />
                          ) : att.type === 'audio' ? (
                            <div className="flex items-center gap-2 text-sky-200">
                              <Volume2 className="w-4 h-4 text-sky-400" />
                              <span className="text-[11px] font-semibold truncate">{att.name}</span>
                              {att.previewUrl && (
                                <audio controls src={att.previewUrl} className="h-7 w-full mt-1" />
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-200">
                              <FileText className="w-4 h-4 text-indigo-400" />
                              <span className="text-[11px] font-semibold truncate">{att.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.text}

                  <span
                    className={`block text-[9px] mt-1.5 opacity-60 text-right ${
                      isAi ? 'text-slate-400' : 'text-slate-200'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* AI Loading State */}
          {isLoading && (
            <div className="flex items-center gap-3 animate-fadeIn">
              <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-sky-500/30 text-xs text-sky-300 flex items-center gap-2">
                <span>HARSHA'S is processing files & generating solution...</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Attachment Previews Bar */}
        {attachments.length > 0 && (
          <div className="p-2 bg-slate-900/95 border-t border-white/10 flex items-center gap-2 overflow-x-auto custom-scrollbar relative z-10">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800 border border-sky-500/30 text-slate-200 text-xs shrink-0"
              >
                {att.type === 'image' ? (
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                ) : att.type === 'audio' ? (
                  <Music className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span className="text-[11px] font-medium max-w-[120px] truncate">{att.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Recording Banner */}
        {isRecording && (
          <div className="p-2.5 bg-rose-500/10 border-t border-rose-500/30 flex items-center justify-between px-4 relative z-10 animate-pulse">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              Recording Voice Doubt ({recordingSeconds}s)... Speak clearly.
            </div>
            <button
              onClick={toggleVoiceRecording}
              className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-500 transition-all"
            >
              Stop & Attach
            </button>
          </div>
        )}

        {/* Multimodal Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-white/10 bg-slate-900/90 flex items-center gap-2 relative z-10"
        >
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Document / PDF / File"
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-sky-300 hover:bg-slate-700 transition-all border border-white/10 shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Image Upload Button */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            title="Upload Image / Screenshot"
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-sky-300 hover:bg-slate-700 transition-all border border-white/10 shrink-0"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Voice Microphone Record Button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            title={isRecording ? 'Stop Recording' : 'Record Voice Query'}
            className={`p-2.5 rounded-xl transition-all border border-white/10 shrink-0 ${
              isRecording
                ? 'bg-rose-600 text-white animate-bounce'
                : 'bg-slate-800 text-slate-300 hover:text-purple-300 hover:bg-slate-700'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={
              attachments.length > 0
                ? 'Add prompt or press send...'
                : 'Ask doubt, paste question, or attach media...'
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputValue.trim() && attachments.length === 0) || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:brightness-110 text-white shadow-lg disabled:opacity-40 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export const DoubtChatbotPanel = ExplainThisChatbot;
