import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface CurrentJobDoneState {
    value: boolean;
}

const initialState: CurrentJobDoneState = {
    value: false,
}

const currentJobDoneSlice = createSlice({
    name: "currentJobDone",
    initialState,
    reducers: {
        setValue: (state, action: PayloadAction<boolean>) => {
            state.value = action.payload;
        }
    },
});

export const {setValue} = currentJobDoneSlice.actions;

export default currentJobDoneSlice.reducer;