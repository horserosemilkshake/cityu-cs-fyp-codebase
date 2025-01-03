import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface directionState {
    value: boolean; // false - track income packages, true - track outgoing packages 
}

const initialState: directionState = {
    value: false,
}

const directionSlice = createSlice({
    name: "direction",
    initialState,
    reducers: {
        setDirection: (state, action: PayloadAction<boolean>) => {
            state.value = action.payload;
        },
    },
});

export const {setDirection} = directionSlice.actions;

export default directionSlice.reducer;