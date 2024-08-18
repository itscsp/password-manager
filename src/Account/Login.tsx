import { useDispatch, useSelector } from "react-redux"
import { increment } from "../features/auth/authTypes";

export {Login}

function Login(){
    const dispatch = useDispatch();
    const count = useSelector((state) => state.counter.count)

    const incrementHandler = () => {
        dispatch(increment())
    }
    return(
        <>
            <p>Count: {count}</p>
            <button onClick={incrementHandler}>Increase</button>
        </>
    )
}