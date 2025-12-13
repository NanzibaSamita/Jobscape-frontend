import { createSlice, type PayloadAction } from "@reduxjs/toolkit"


interface Role {
  name: string,
  role_weight: string,
  pivot: {
    model_type: string,
    model_id: number,
    role_id: number
  }
}
interface User {
  id: string
  email: string
  user_first_name: string,
  user_last_name: string,
  user_name: string,
  user_birth_date?: string | null,
  user_gender?: string | "Unknown",
  user_mobile?: string | null,
  user_phone?: string | null,
  user_image?: string | null,
  user_street_address: string | null,
  user_police_station: string | null,
  user_city: string | null,
  user_zip: string | null,
  user_state: string | null,
  user_country: string | null,
  is_active: boolean | number,
  otp_expire_at?: string | null,
  roles?: Role[],
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean,
  roleWeight?: string | null | number,
  token?: string | null,
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  roleWeight: null,
  token: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<{ user: User; token: string, roleWeight: null | number | string }>) => {
      state.user = action.payload.user
      state.isAuthenticated = true
      state.loading = false
      state.roleWeight = action.payload.roleWeight || null
      state.token = action.payload.token || null
    },
    logoutUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.loading = false
      state.roleWeight = null
      state.token = null
    },
    setLoadingUser: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { loginUser, logoutUser, setLoadingUser } = authSlice.actions
export default authSlice.reducer
