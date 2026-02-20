import React from 'react'
import PageHeader from '../../components/PageHeader'
import BottomNav from '../../components/BottomNav'
import Chatbot from '../../components/Chatbot'
import { LayoutDashboard, GraduationCap, Users, UserCog, FileBarChart } from 'lucide-react'

const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { label: 'Students', icon: GraduationCap, path: '/admin/student-performance' },
    { label: 'Staff', icon: Users, path: '/admin/staff-performance' },
    { label: 'Users', icon: UserCog, path: '/admin/users' },
    { label: 'Reports', icon: FileBarChart, path: '/admin/reports' },
]

export default function AdminStudentPerformance() {
    return (
        <div className="page-wrapper">
            <PageHeader title="Student Performance" subtitle="Debugging..." role="admin" back="/admin" />
            <div className="page-content">
                <h1>Debug Mode</h1>
            </div>
            <BottomNav role="admin" items={navItems} />
            <Chatbot accentColor="var(--accent-gold)" />
        </div>
    )
}
