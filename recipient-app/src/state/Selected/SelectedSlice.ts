import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Package } from "../../view/TrackPage";

interface SelectedState {
    value: Package | undefined;
}

const initialState: SelectedState = {
    value: undefined,
}

const selectedState = createSlice({
    name: "selected",
    initialState,
    reducers: {
        setSelectedPackage: (state, action: PayloadAction<Package | undefined>) => {
            state.value = action.payload;
        }
    },
});

export const {setSelectedPackage} = selectedState.actions;

export default selectedState.reducer;