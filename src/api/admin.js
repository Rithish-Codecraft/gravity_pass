import api from './client'

export const getDashboard = () => api.get('/admin/dashboard').then(r => r.data)
export const getStudents = () => api.get('/admin/students').then(r => r.data)
export const getStaff = () => api.get('/admin/staff').then(r => r.data)
export const getUsers = () => api.get('/admin/users').then(r => r.data)
export const createUser = (data) => api.post('/admin/users', data).then(r => r.data)
export const deleteUser = (id) => api.delete(`/admin/users/${id}`).then(r => r.data)
