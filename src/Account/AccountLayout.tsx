import { Route, Routes } from "react-router-dom"
import { Login, Register } from './';

export {AccountLayout}

function AccountLayout() {
    return (
        <div className="account-wrapper">
            <Routes>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />

            </Routes>
        </div>
    )
}

    