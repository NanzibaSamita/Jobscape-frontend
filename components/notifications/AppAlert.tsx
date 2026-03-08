"use client"
import React, { useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import { removeAlert, AlertType } from '@/lib/store/slices/notificationSlice'

const alertVariants = {
    success: {
        icon: CheckCircle,
        color: 'text-green-500',
        bg: 'bg-green-50',
        border: 'border-green-100',
    },
    error: {
        icon: XCircle,
        color: 'text-red-500',
        bg: 'bg-red-50',
        border: 'border-red-100',
    },
    warning: {
        icon: AlertCircle,
        color: 'text-amber-500',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
    },
    info: {
        icon: Info,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
    }
}

export function AppAlertContainer() {
    const alerts = useAppSelector(state => state.notification.alerts)
    const dispatch = useAppDispatch()

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
            <AnimatePresence>
                {alerts.map(alert => (
                    <AppAlertItem 
                        key={alert.id} 
                        alert={alert} 
                        onClose={() => dispatch(removeAlert(alert.id))} 
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}

function AppAlertItem({ alert, onClose }: { alert: any; onClose: () => void }) {
    const { icon: Icon, color, bg, border } = alertVariants[alert.type as AlertType] || alertVariants.info

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, alert.duration || 5000)
        return () => clearTimeout(timer)
    }, [alert.duration, onClose])

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${bg} ${border} shadow-lg shadow-black/5`}
        >
            <Icon className={`w-5 h-5 shrink-0 ${color}`} />
            <div className="flex-1 min-w-0">
                {alert.title && <p className="text-sm font-semibold text-gray-900 mb-0.5">{alert.title}</p>}
                <p className="text-sm text-gray-700 leading-relaxed">{alert.message}</p>
            </div>
            <button 
                onClick={onClose}
                className="p-1 hover:bg-black/5 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    )
}
