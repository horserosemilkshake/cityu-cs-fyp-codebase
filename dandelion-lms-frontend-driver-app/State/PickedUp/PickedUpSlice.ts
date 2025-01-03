import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface pickupState {
    value: String[];
}

const initialState: pickupState = {
    value: [],
}

const pickupSlice = createSlice({
    name: "pickedup",
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

export const {add, remove, clear} = pickupSlice.actions;

export default pickupSlice.reducer;