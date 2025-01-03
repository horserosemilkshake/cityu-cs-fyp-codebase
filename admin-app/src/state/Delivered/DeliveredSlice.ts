import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface deliveredState {
    value: String[];
}

const initialState: deliveredState = {
    value: [],
}

const deliveredSlice = createSlice({
    name: "delivered",
    initialState,
    reducers: {
        add: (state, action: PayloadAction<string>) => {
            state.value = [...state.value, action.payload];
        },
        remove: (state, action: PayloadAction<string>) => {
            state.value = state.value.filter(obj => obj !== action.payload);
        },
        clear: (state) => {
            state.value = [];
        }
    },
});

export const {add, remove, clear} = deliveredSlice.actions;

export default deliveredSlice.reducer;