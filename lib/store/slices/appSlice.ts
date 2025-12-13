import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface AppState {
  theme: "light" | "dark"
  sidebarOpen: boolean
  notifications: Array<{
    id: string
    message: string
    type: "success" | "error" | "warning" | "info"
  }>
}

const initialState: AppState = {
  theme: "light",
  sidebarOpen: false,
  notifications: [],
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    addNotification: (state, action: PayloadAction<Omit<AppState["notifications"][0], "id">>) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload)
    },
  },
})

export const { setTheme, toggleSidebar, setSidebarOpen, addNotification, removeNotification } = appSlice.actions
export default appSlice.reducer
