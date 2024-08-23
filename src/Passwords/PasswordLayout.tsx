import { useDispatch, useSelector } from 'react-redux';
import { GetPasswords, AddPasswords, UpdatePassword, GetPassword } from './';
import { Route, Routes } from 'react-router-dom';
import { RootState } from '../app/store';
import { useEffect } from 'react';

export function PasswordLayout() {
    const dispatch = useDispatch(); // Assign useDispatch to a variable
    const { isLoggedIn } = useSelector((state: RootState) => state.auth); // Use RootState type for useSelector

    useEffect(() => {

       
    }, [isLoggedIn, dispatch]); // Add dispatch to the dependencies array

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
