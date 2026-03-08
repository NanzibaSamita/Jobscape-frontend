import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type AlertType = 'success' | 'error' | 'info' | 'warning'

export interface AppAlert {
    id: string
    title?: string
    message: string
    type: AlertType
    duration?: number
}

interface NotificationState {
    alerts: AppAlert[]
}

const initialState: NotificationState = {
    alerts: []
}

export const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        showAlert: (state, action: PayloadAction<Omit<AppAlert, 'id'>>) => {
            const id = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)
            state.alerts.push({ ...action.payload, id })
        },
        removeAlert: (state, action: PayloadAction<string>) => {
            state.alerts = state.alerts.filter(alert => alert.id !== action.payload)
        }
    }
})

export const { showAlert, removeAlert } = notificationSlice.actions
export default notificationSlice.reducer
