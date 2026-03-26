const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('room4ai_token');
}

async function request(method, path, body = null, isFormData = false) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData && body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : (body ? JSON.stringify(body) : null),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  signup: (body) => request('POST', '/auth/signup', body),
  login: (body) => request('POST', '/auth/login', body),
  getMe: () => request('GET', '/auth/me'),
  updateTemplate: (template_choice) => request('PATCH', '/auth/template', { template_choice }),

  // Classes — multi-class support
  getClasses: () => request('GET', '/classes'),
  getClass: (id) => id ? request('GET', `/classes/${id}`) : request('GET', '/classes').then(r => ({ class: r.classes?.[0] || null })),
  createClass: (body) => request('POST', '/classes', body),
  updateClass: (id, body) => request('PATCH', `/classes/${id}`, body),
  deleteClass: (id) => request('DELETE', `/classes/${id}`),
  // Legacy alias used by LessonWizard
  saveClass: (body) => request('POST', '/classes', body),

  // Lessons
  getLessons: (classId) => request('GET', classId ? `/lessons?class_id=${classId}` : '/lessons'),
  getLesson: (id) => request('GET', `/lessons/${id}`),
  createLesson: (body) => request('POST', '/lessons', body),
  updateLesson: (id, body) => request('PATCH', `/lessons/${id}`, body),
  deleteLesson: (id) => request('DELETE', `/lessons/${id}`),
  analyzeLesson: (id, body) => request('POST', `/lessons/${id}/analyze`, body),
  suggestMiniLessons: (body) => request('POST', '/lessons/suggest-mini', body),
  suggestCoverage: (body) => request('POST', '/lessons/suggest-coverage', body),

  // Standards
  getStandards: (grade, subject) => request('GET', `/standards?grade=${encodeURIComponent(grade)}&subject=${encodeURIComponent(subject)}`),

  // Voice
  transcribeAudio: async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    const token = getToken();
    const res = await fetch(`${BASE_URL}/lessons/transcribe`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Transcription failed');
    return data;
  },
};
