import { GetPasswords, AddPasswords, UpdatePassword, GetPassword } from './';
import { Route, Routes } from 'react-router-dom';


export function PasswordLayout() {

    return (
        <>
            <div className="account-wrapper py-6 sm:px-8 px-4 bg-black rounded-lg shadow-lg text-white max-w-lg w-full mx-auto">
                <Routes>
                    <Route path="/" element={<GetPasswords />} />
                    <Route path="/add" element={<AddPasswords />} />
                    <Route path="/edit/:id" element={<UpdatePassword />} />
                    <Route path="/:id" element={<GetPassword />} />
                </Routes>
            </div>
        </>
    );
}
