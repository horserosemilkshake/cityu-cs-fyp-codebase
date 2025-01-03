import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface ProfileState {
    usernameGlobal: string;
    maticBalance: number;
    warehouseNeededInThisRound: number;
    speed: number;
    currentCoordinate: string;
    lastCoordinate: string;
    trunkLength: number,
    trunkWidth: number,
    trunkHeight: number,
    cryptowallet_address: string,
    nickname: string,
    password: string,
    phone: string,
}

const initialState: ProfileState = {
    usernameGlobal: "",
    maticBalance: -1,
    warehouseNeededInThisRound: 0,
    speed: -1,
    currentCoordinate: "",
    lastCoordinate: "",
    trunkLength: 0,
    trunkWidth: 0,
    trunkHeight: 0,
    cryptowallet_address: "",
    nickname: "",
    password: "",
    phone: "",
}

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        setUsernameGlobal: (state, action: PayloadAction<string>) => {
            state.usernameGlobal = action.payload;
        },
        setMaticBalance: (state, action: PayloadAction<number>) => {
            state.maticBalance = action.payload;
        },
        setWarehouseNeededInThisRound: (state, action: PayloadAction<number>) => {
            state.warehouseNeededInThisRound = action.payload;
        },
        setSpeed: (state, action: PayloadAction<number>) => {
            state.speed = action.payload;
        },
        setCurrentCoordinate: (state, action: PayloadAction<string>) => {
            state.currentCoordinate = action.payload;
        },
        setLastCoordinate: (state, action: PayloadAction<string>) => {
            state.lastCoordinate = action.payload;
        },
        setTrunkLength: (state, action: PayloadAction<number>) => {
            state.trunkLength = action.payload;
        },
        setTrunkWidth: (state, action: PayloadAction<number>) => {
            state.trunkWidth = action.payload;
        },
        setTrunkHeight: (state, action: PayloadAction<number>) => {
            state.trunkHeight = action.payload;
        },
        setCryptoWalletAddress: (state, action: PayloadAction<string>) => {
            state.cryptowallet_address = action.payload;
        },
        setNickname:  (state, action: PayloadAction<string>) => {
            state.nickname = action.payload;
        },
        setPassword:  (state, action: PayloadAction<string>) => {
            state.password = action.payload;
        },
        setPhone:  (state, action: PayloadAction<string>) => {
            state.phone = action.payload;
        },
    },
});

export const { setUsernameGlobal, setMaticBalance, setWarehouseNeededInThisRound, setSpeed, setCurrentCoordinate, setLastCoordinate, setTrunkLength, setTrunkWidth, setTrunkHeight, setCryptoWalletAddress, setNickname, setPassword, setPhone } = profileSlice.actions;

export default profileSlice.reducer;

