import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface TaskListPointerState {
    taskListPointer: number;
}

const initialState: TaskListPointerState = {
    taskListPointer: 0,
}

const taskListPointerSlice = createSlice({
    name: "taskListPointerState",
    initialState,
    reducers: {
        incrementPointerBy: (state, action: PayloadAction<number>) => {
            state.taskListPointer += action.payload;
        },
        setPointer: (state, action: PayloadAction<number>) => {
            state.taskListPointer = action.payload;
        }
    },
});

export const {incrementPointerBy, setPointer} = taskListPointerSlice.actions;

export default taskListPointerSlice.reducer;