import api from './client'

export async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    const { token, user } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    return user
}

export function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
}

export function getUser() {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
}

export function isLoggedIn() {
    return !!localStorage.getItem('token')
}
