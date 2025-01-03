import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface PositionState {
    lat: number;
    lon: number;
}

const initialState: PositionState = {
    lat: 0,
    lon: 0,
}

const positionSlice = createSlice({
    name: "position",
    initialState,
    reducers: {
        setLat: (state, action: PayloadAction<number>) => {
            state.lat = action.payload;
        },
        setLon: (state, action: PayloadAction<number>) => {
            state.lon = action.payload;
        }
    },
});

export const {setLat, setLon} = positionSlice.actions;

export default positionSlice.reducer;