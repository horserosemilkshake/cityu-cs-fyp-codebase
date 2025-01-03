import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface routeState {
    route: String[];
}

const initialState: routeState = {
    route: [],
}

const routeSlice = createSlice({
    name: "route",
    initialState,
    reducers: {
        add: (state, action: PayloadAction<string>) => {
            state.route = [...state.route, action.payload];
        },
        remove: (state, action: PayloadAction<string>) => {
            state.route = state.route.filter(obj => obj !== action.payload);
        },
        clear: (state) => {
            state.route = [];
        }
    },
});

export const {add, remove, clear} = routeSlice.actions;

export default routeSlice.reducer;