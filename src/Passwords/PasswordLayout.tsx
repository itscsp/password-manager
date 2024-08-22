import { useSelector } from 'react-redux';
import { GetPasswords, AddPasswords } from './';
import { Link, Route, Routes } from 'react-router-dom';
import { RootState } from '../app/store';
export function PasswordLayout() {
    const { isLoggedIn, loading } = useSelector((state: RootState) => state.auth);

   

    if (!loading && !isLoggedIn) {
        return (
            <div className="account-wrapper py-6 sm:px-8 px-4 bg-black rounded-lg shadow-lg text-white max-w-lg w-full mx-auto">
                <p className='text-center'><Link to={"/account/login"} className='text-opred'>Login</Link> to view password </p>
            </div>
        )
    }

    return (
        <>
            <div className="account-wrapper py-6 sm:px-8 px-4 bg-black rounded-lg shadow-lg text-white max-w-lg w-full mx-auto">
                <Routes>
                    <Route path="/" element={<GetPasswords />} />
                    <Route path="/add" element={<AddPasswords />} />
                </Routes>
            </div>

        </>
    );
}
