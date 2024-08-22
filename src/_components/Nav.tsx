// _components/Nav.tsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice'; // Adjust this path
import logo from '../assets/onepass_logo.svg';
import { Notification } from './Notification';
import { AppDispatch, RootState } from '../app/store';
import { clearNotification, showNotification } from '../features/notifications/notificationSlice';

const Nav: React.FC = () => {
    const { token, sessionToken } = useSelector((state: RootState) => state.auth);
    const { isLoggedIn, firstName  } = useSelector((state: any) => state.auth);
    const dispatch: AppDispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();

    const isHome = location.pathname === '/';

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };
    // Component or some place where you dispatch the logout thunk
    const handleLogout = () => {

        if (sessionToken && token) {
            dispatch(logout({ token, sessionToken }));
            dispatch(showNotification("User loged out"));
            // Redirect to dashboard or wherever necessary
            setTimeout(() => {
                dispatch(clearNotification());
            }, 3000); // Remove notification after 3 seconds

            navigate('/');
        }
    };

    return (
        <header>
            <nav className="flex justify-between items-center">
                <button
                    className={`w-24 back-btn ${isHome ? 'home-btn' : ''}`}
                    onClick={handleBack}
                >
                    {!isHome && (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                        >
                            <path
                                d="M20.625 2.75C20.625 2.38533 20.4801 2.03559 20.2223 1.77773C19.9644 1.51987 19.6147 1.375 19.25 1.375H2.75C2.38533 1.375 2.03559 1.51987 1.77773 1.77773C1.51987 2.03559 1.375 2.38533 1.375 2.75V19.25C1.375 19.6147 1.51987 19.9644 1.77773 20.2223C2.03559 20.4801 2.38533 20.625 2.75 20.625H19.25C19.6147 20.625 19.9644 20.4801 20.2223 20.2223C20.4801 19.9644 20.625 19.6147 20.625 19.25V2.75ZM0 2.75C0 2.02065 0.289731 1.32118 0.805456 0.805456C1.32118 0.289731 2.02065 0 2.75 0L19.25 0C19.9793 0 20.6788 0.289731 21.1945 0.805456C21.7103 1.32118 22 2.02065 22 2.75V19.25C22 19.9793 21.7103 20.6788 21.1945 21.1945C20.6788 21.7103 19.9793 22 19.25 22H2.75C2.02065 22 1.32118 21.7103 0.805456 21.1945C0.289731 20.6788 0 19.9793 0 19.25V2.75ZM15.8125 10.3125C15.9948 10.3125 16.1697 10.3849 16.2986 10.5139C16.4276 10.6428 16.5 10.8177 16.5 11C16.5 11.1823 16.4276 11.3572 16.2986 11.4861C16.1697 11.6151 15.9948 11.6875 15.8125 11.6875H7.84712L10.7992 14.6383C10.8632 14.7022 10.9139 14.7781 10.9485 14.8616C10.9831 14.9451 11.0009 15.0346 11.0009 15.125C11.0009 15.2154 10.9831 15.3049 10.9485 15.3884C10.9139 15.4719 10.8632 15.5478 10.7992 15.6117C10.7353 15.6757 10.6594 15.7264 10.5759 15.761C10.4924 15.7956 10.4029 15.8134 10.3125 15.8134C10.2221 15.8134 10.1326 15.7956 10.0491 15.761C9.96556 15.7264 9.88967 15.6757 9.82575 15.6117L5.70075 11.4867C5.63673 11.4229 5.58593 11.347 5.55127 11.2635C5.51661 11.18 5.49877 11.0904 5.49877 11C5.49877 10.9096 5.51661 10.82 5.55127 10.7365C5.58593 10.653 5.63673 10.5771 5.70075 10.5133L9.82575 6.38825C9.95484 6.25916 10.1299 6.18663 10.3125 6.18663C10.4951 6.18663 10.6702 6.25916 10.7992 6.38825C10.9283 6.51734 11.0009 6.69243 11.0009 6.875C11.0009 7.05757 10.9283 7.23266 10.7992 7.36175L7.84712 10.3125H15.8125Z"
                                fill="#D71340"
                            />
                        </svg>
                    )}
                </button>
                <Link to="/" className="flex justify-center items-center my-4">
                    <img className="w-[125px] h-auto" src={logo} alt="Logo" />
                </Link>
                <div className="w-24 flex justify-end items-center">
                    {isLoggedIn && `Hi, ${firstName}`}

                    {isLoggedIn && (
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    )}

                </div>
            </nav>
            <Notification />
        </header>
    );
};

export { Nav };
