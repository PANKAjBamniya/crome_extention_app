import { configureStore } from '@reduxjs/toolkit'
import walletReducer from './slices/walletSlice'
import tokenReducer from './slices/tokenSlice'

export const store = configureStore({
    reducer: {
        wallet: walletReducer,
        tokens: tokenReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
