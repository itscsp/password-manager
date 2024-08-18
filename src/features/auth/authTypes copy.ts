import { createSlice } from "@reduxjs/toolkit";

const counterSlicer = createSlice(
    {
        name:"counter",
        initialState: {count:0},
        reducers: {
            increment:(state) =>{
                state.count += 1
            },
        }
    }
)

console.log(counterSlicer)

export const {increment} = counterSlicer.actions
export default counterSlicer.reducer;