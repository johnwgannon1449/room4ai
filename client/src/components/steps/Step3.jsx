import { useState, useRef } from 'react';
import { api } from '../../utils/api';

export default function Step3({ data, onChange, onNext, onBack }) {
  const [content, setContent] = useState(data?.content || '');
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  async function startRecording() {
    setVoiceError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setTranscribing(true);
        try {
          const res = await api.transcribeAudio(blob);
          const updated = content + (content ? ' ' : '') + res.text;
          setContent(updated);
          onChange({ content: updated });
        } catch (err) {
          setVoiceError('Transcription failed: ' + err.message);
        } finally {
          setTranscribing(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      setVoiceError('Microphone access denied. Please allow microphone access and try again.');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  function handleChange(val) {
    setContent(val);
    onChange({ content: val });
  }

  function handleSubmit() {
    if (!content.trim()) {
      setError('Please describe your lesson content before continuing.');
      return;
    }
    setError('');
    onNext({ content });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Lesson Content</h2>
        <p className="text-label text-sm">Describe your lesson plan in detail. Use voice input or type directly.</p>
      </div>

      {/* Voice input area */}
      <div className="bg-background rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary">Voice Input</span>
          {transcribing && (
            <span className="text-xs text-label flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse inline-block" />
              Transcribing...
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={transcribing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              recording
                ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                : 'bg-primary text-white hover:bg-primary-dark'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <svg className="w-4 h-4" fill={recording ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            {recording ? 'Stop Recording' : 'Start Recording'}
          </button>
          {recording && (
            <span className="text-sm text-red-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping inline-block" />
              Recording...
            </span>
          )}
        </div>
        {voiceError && <p className="text-red-500 text-xs mt-2">{voiceError}</p>}
        <p className="text-xs text-gray-400 mt-2">Speak naturally — transcription will be appended to your lesson content.</p>
      </div>

      {/* Text area */}
      <div>
        <label className="label">Lesson Content *</label>
        <textarea
          className={`input-field min-h-[280px] resize-y ${error ? 'border-red-400 ring-1 ring-red-400' : ''}`}
          placeholder="Describe your lesson in detail. Include: introduction, main activities, materials needed, assessment methods, differentiation strategies, closure activities..."
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => onChange({ content })}
        />
        <div className="flex justify-between mt-1">
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <span className="text-xs text-gray-400 ml-auto">{content.length} characters</span>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-ghost">← Back</button>
        <button onClick={handleSubmit} className="btn-primary">
          Analyze Coverage →
        </button>
      </div>
    </div>
  );
}
