import React from "react"
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import { clearNotification, showNotification } from '../features/notifications/notificationSlice';
import { logout } from '../features/auth/authSlice'; // Adjust this path
import { useNavigate } from "react-router-dom";


const User: React.FC = () => {
    const { firstName } = useSelector((state: any) => state.auth);
    const { sessionToken } = useSelector((state: RootState) => state.auth);
    const dispatch: AppDispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();


    // Component or some place where you dispatch the logout thunk
    const handleLogout = () => {

        if (sessionToken) {
            dispatch(logout({sessionToken }));
            dispatch(showNotification("User loged out"));
            // Redirect to dashboard or wherever necessary
            setTimeout(() => {
                dispatch(clearNotification());
            }, 3000); // Remove notification after 3 seconds
            navigate("/");
        }
    };

    return (
        <>
            <div className="mb-4">
                hi, <br />
                {firstName}
            </div>
            <hr className="border-opred mb-4" />

            <div>
                <button onClick={handleLogout} className="logout-button text-opred">
                    Logout?
                </button>
            </div>
        </>
    )
}

export { User }