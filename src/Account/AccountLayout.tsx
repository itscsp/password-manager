import {  Route, Routes } from "react-router-dom"
import { Login, Register, User } from './';

export { AccountLayout }

function AccountLayout() {

    return (
        <div className="account-wrapper py-6 sm:px-8 px-4 bg-black rounded-lg shadow-lg text-white max-w-lg w-full mx-auto">
            <Routes>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="/:id" element={<User />} />

            </Routes>
        </div>
    )
}

