import { Navigate, Route, Routes } from "react-router-dom"
import { Login, Register } from './';
import { useSelector } from "react-redux";

export { AccountLayout }

function AccountLayout() {

    const { isLoggedIn } = useSelector((state: any) => state.auth);

    // redirect to home if already logged in
    if (isLoggedIn) {
        return <Navigate to="/" />;
    }
    return (
        <div className="account-wrapper py-6 sm:px-8 px-4 bg-black rounded-lg shadow-lg text-white max-w-lg w-full mx-auto">
            <Routes>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />

            </Routes>
        </div>
    )
}

