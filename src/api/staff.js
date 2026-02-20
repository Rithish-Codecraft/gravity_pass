import api from './client'

export const getDashboard = () => api.get('/staff/me/dashboard').then(r => r.data)
export const getTimetable = () => api.get('/staff/me/timetable').then(r => r.data)
export const saveTimetable = (rows) => api.put('/staff/me/timetable', { rows }).then(r => r.data)
export const getAttendanceList = (date, subject) => api.get('/attendance', { params: { date, subject } }).then(r => r.data)
export const submitAttendance = (date, subject, records) => api.post('/attendance/submit', { date, subject, records }).then(r => r.data)
export const getAnnouncements = () => api.get('/announcements').then(r => r.data)
export const postAnnouncement = (data) => api.post('/announcements', data).then(r => r.data)
export const getLeave = () => api.get('/leave').then(r => r.data)
export const applyLeave = (data) => api.post('/leave', data).then(r => r.data)
export const getNotes = (subject) => api.get('/notes', { params: { subject } }).then(r => r.data)
export const uploadNote = (formData) => api.post('/notes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
