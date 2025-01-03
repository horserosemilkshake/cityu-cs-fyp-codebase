import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface priceState {
    value: [string, number][];
}

const initialState: priceState = {
    value: [],
}

const priceSlice = createSlice({
    name: "price",
    initialState,
    reducers: {
        add: (state, action: PayloadAction<[string, number]>) => {
            state.value = [...state.value, action.payload];
        },
        remove: (state, action: PayloadAction<[string, number]>) => {
            state.value = state.value.filter(obj => obj !== action.payload);
        },
        clear: (state) => {
            state.value = [];
        }
    },
});

export const {add, remove, clear} = priceSlice.actions;

export default priceSlice.reducer;