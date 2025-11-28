import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  messages: []
}

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload)
    },
    clearMessages: (state) => {
      state.messages = []
    }
  }
})

export const { addMessage, clearMessages } = contactSlice.actions

export default contactSlice.reducer
