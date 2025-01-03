import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface ListState {
    value: String[];
}

const initialState: ListState = {
    value: [],
}

const listSlice = createSlice({
    name: "list",
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

export const {add, remove, clear} = listSlice.actions;

export default listSlice.reducer;