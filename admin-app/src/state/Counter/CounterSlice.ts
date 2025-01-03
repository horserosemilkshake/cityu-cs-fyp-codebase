import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface CounterState {
    value: number;
}

const initialState: CounterState = {
    value: 0,
}

const counterSlice = createSlice({
    name: "counter",
    initialState,
    reducers: {
        incrementByAmount: (state, action: PayloadAction<number>) => {
            state.value += action.payload;
        },
        setAmount: (state, action: PayloadAction<number>) => {
            state.value = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(incrementAsync.pending, (state) => {
            console.log("pending");
        }).addCase(incrementAsync.fulfilled, (state, action) => {
            state.value += action.payload;
        });
    },
});

export const incrementAsync = createAsyncThunk(
    "counter/incrementAsync",
    async (amount: number) => {
        await new Promise ((resolve) => setTimeout(resolve, 1000));
        return amount;
    }
);

export const {incrementByAmount, setAmount} = counterSlice.actions;

export default counterSlice.reducer;