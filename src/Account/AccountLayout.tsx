import {  Route, Routes } from "react-router-dom"
import { Login, Register, User } from './';

import Loading from "../_components/Loading";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";


export { AccountLayout }

function AccountLayout() {
    const { loading } = useSelector((state: RootState) => state.auth); // Use RootState type for useSelector


    return (
        <>
            {loading && <Loading />}

            <div className="account-wrapper py-6 sm:px-8 px-4 bg-black rounded-lg shadow-lg text-white max-w-lg w-full mx-auto">
                <Routes>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    
                        <Route path="/" element={<User />} />
                    
                </Routes>
            </div>
        </>
    )
}

