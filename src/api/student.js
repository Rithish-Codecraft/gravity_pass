import api from './client'

export const getDashboard = () => api.get('/students/me/dashboard').then(r => r.data)
export const getAttendanceLog = () => api.get('/students/me/attendance-log').then(r => r.data)
export const punchIn = (subject, room) => api.post('/students/me/attendance/punch', { subject, room }).then(r => r.data)
export const getResults = (semester) => api.get('/results', { params: { semester } }).then(r => r.data)
export const getFees = () => api.get('/fees').then(r => r.data)
export const payFee = (id) => api.patch(`/fees/${id}/pay`).then(r => r.data)
export const getEvents = () => api.get('/events').then(r => r.data)
export const registerEvent = (id) => api.post(`/events/${id}/register`).then(r => r.data)
export const cancelEvent = (id) => api.delete(`/events/${id}/register`).then(r => r.data)
export const getAnnouncements = () => api.get('/announcements').then(r => r.data)
export const submitFeedback = (data) => api.post('/feedback', data).then(r => r.data)
export const getNotes = (subject) => api.get('/notes', { params: { subject } }).then(r => r.data)
