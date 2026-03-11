"use client"
import React, { useEffect, useState } from 'react'
import { Bell, Check, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import axiosInstance from '@/lib/axios/axios'
import Link from 'next/link'

interface Notification {
    id: string
    title: string
    message: string
    type: string
    link: string | null
    is_read: boolean
    created_at: string
}

export function NotificationTray({ 
    isOpen, 
    onClose, 
    onUnreadCountChange 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onUnreadCountChange: (count: number) => void 
}) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(false)

    const fetchNotifications = async () => {
        try {
            const res = await axiosInstance.get('/notifications/')
            setNotifications(res.data)
            const unread = res.data.filter((n: Notification) => !n.is_read).length
            onUnreadCountChange(unread)
        } catch (error) {
            console.error("Failed to fetch notifications:", error)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchNotifications()
        }
    }, [isOpen])

    // Initial fetch for count
    useEffect(() => {
        fetchNotifications()
    }, [])

    const markAsRead = async (id: string) => {
        try {
            await axiosInstance.patch(`/notifications/${id}/read`)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
            onUnreadCountChange(notifications.filter(n => !n.is_read && n.id !== id).length)
        } catch (error) {
            console.error("Failed to mark notification as read:", error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await axiosInstance.patch('/notifications/read-all')
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            onUnreadCountChange(0)
        } catch (error) {
            console.error("Failed to mark all as read:", error)
        }
    }

    const deleteNotification = async (id: string) => {
        try {
            await axiosInstance.delete(`/notifications/${id}`)
            setNotifications(prev => prev.filter(n => n.id !== id))
            const unread = notifications.filter(n => !n.is_read && n.id !== id).length
            onUnreadCountChange(unread)
        } catch (error) {
            console.error("Failed to delete notification:", error)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-40 bg-black/5" 
                        onClick={onClose} 
                    />
                    
                    {/* Tray */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="absolute right-0 top-12 z-50 w-80 md:w-96 rounded-2xl border bg-card shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold">Notifications</h3>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-xs text-primary hover:underline hover:text-primary/80"
                                >
                                    Mark all as read
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="p-1 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-3">
                                    <Bell className="w-8 h-8 opacity-20" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div 
                                        key={notif.id}
                                        className={`group relative p-4 border-b last:border-0 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="flex justify-between gap-3">
                                            <div className="flex-1">
                                                <p className={`text-sm ${!notif.is_read ? 'font-semibold' : 'font-medium'}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                                    </span>
                                                    {notif.link && (
                                                        <Link 
                                                            href={notif.link} 
                                                            className="text-[10px] text-primary hover:underline"
                                                            onClick={onClose}
                                                        >
                                                            View details
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!notif.is_read && (
                                                    <button 
                                                        onClick={() => markAsRead(notif.id)}
                                                        className="p-1 hover:bg-primary/10 rounded-full text-primary"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => deleteNotification(notif.id)}
                                                    className="p-1 hover:bg-red-50 rounded-full text-red-400 hover:text-red-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
