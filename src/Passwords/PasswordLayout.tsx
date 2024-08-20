import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../app/store'; // Adjust the path accordingly
import { fetchPasswords } from '../features/passwords/passwordSlice'; // Adjust the path accordingly

export function PasswordLayout() {
    const dispatch: AppDispatch = useDispatch();
    const { isLoggedIn, token, sessionToken } = useSelector((state: RootState) => state.auth);
    const { passwords, loading, error } = useSelector((state: RootState) => state.passwords);

    useEffect(() => {
        if (isLoggedIn && token && sessionToken) {
            dispatch(fetchPasswords({ token, sessionToken }));
        }
    }, [isLoggedIn, token, sessionToken, dispatch]);


    // Redirect to home if not logged in
    if (!isLoggedIn) {
        return <Navigate to="/" />;
    }

    // Show loading state
    if (loading) {
        return <div>Loading passwords...</div>;
    }

    // Show error message if there's an error
    if (error) {
        return <div>Error: {error}</div>;
    }

    // Check if passwords array is empty
    if (passwords.length === 0) {
        return <div>No passwords found.</div>;
    }

    return (
        <>
            <h1>Your Passwords</h1>
            <ul>
                {passwords.map((password:any) => (
                    <li key={password.id}>{password.name}</li>
                ))}
            </ul>
        </>
    );
}
