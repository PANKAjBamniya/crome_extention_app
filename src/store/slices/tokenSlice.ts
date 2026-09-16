import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Token } from '../../types/token'

interface TokenState {
    customTokens: Token[]
    isLoading: boolean
}

const initialState: TokenState = {
    customTokens: [],
    isLoading: false,
}

export const tokenSlice = createSlice({
    name: 'tokens',
    initialState,
    reducers: {
        setCustomTokens: (state, action: PayloadAction<Token[]>) => {
            state.customTokens = action.payload
        },
        addCustomToken: (state, action: PayloadAction<Token>) => {
            const index = state.customTokens.findIndex(
                (t) => t.id === action.payload.id
            )
            if (index >= 0) {
                state.customTokens[index] = action.payload
            } else {
                state.customTokens.push(action.payload)
            }
        },
        removeCustomToken: (state, action: PayloadAction<string>) => {
            state.customTokens = state.customTokens.filter(
                (t) => t.id !== action.payload
            )
        },
        setTokensLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        },
    },
})

export const {
    setCustomTokens,
    addCustomToken,
    removeCustomToken,
    setTokensLoading,
} = tokenSlice.actions

export default tokenSlice.reducer

