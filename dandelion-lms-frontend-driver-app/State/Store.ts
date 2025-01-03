import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./Counter/CounterSlice";
import listReducer from "./List/ListSlice";
import profileReducer from "./Profile/ProfileSlice";
import positionReducer from "./Position/PositionSlice";
import routeReducer from "./Route/RouteSlice";
import pickupReducer from "./PickedUp/PickedUpSlice";
import deliveredReducer from "./Delivered/DeliveredSlice";
import currentJobDoneReducer from "./CurrentJobDone/CurrentJobDone";
import taskListPointerReducer from "./TaskListPointer/TaskListPointerSlice";
import priceReducer from "./Prices/PriceSlice";

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        list: listReducer,
        profile: profileReducer,
        position: positionReducer,
        route: routeReducer,
        pickup: pickupReducer,
        delivered: deliveredReducer,
        currentJobDone: currentJobDoneReducer,
        taskListPointer: taskListPointerReducer,
        price: priceReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;