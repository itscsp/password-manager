import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../app/store";
import { useDispatch, useSelector } from "react-redux";
import { deletePassword, fetchIndividualPassword } from "../features/passwords/passwordSlice";
import { clearNotification, showNotification } from "../features/notifications/notificationSlice";
import Loading from "../_components/Loading";
import { MdArrowOutward } from "react-icons/md";
import { FaEye, FaEyeSlash, FaCopy } from "react-icons/fa";
import DeleteModal from "../_components/deleteModal";

const GetPassword: React.FC = () => {
    const { id } = useParams();
    const dispatch: AppDispatch = useDispatch();
    const { isLoggedIn, sessionToken } = useSelector((state: RootState) => state.auth);
    const { passwords, error, loading } = useSelector((state: RootState) => state.passwords);
    const passwordId = Number(id);
    const [showPassword, setShowPassword] = useState(false);
    const [copyStatus, setCopyStatus] = useState({ username: false, password: false });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                setCopyStatus({ ...copyStatus, [field]: true });
                setTimeout(() => setCopyStatus({ ...copyStatus, [field]: false }), 2000);
            })
            .catch(err => console.error("Failed to copy text: ", err));
    };

    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn && sessionToken) {
            dispatch(fetchIndividualPassword({ sessionToken, passwordId }));
        }
    }, [isLoggedIn, dispatch, sessionToken, passwordId]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (loading) {
        return <Loading />;
    }

    if (passwords.length === 0) {
        return <div>No passwords found.</div>;
    }

    const currentIndex = passwords.findIndex((p) => Number(p.id) === passwordId);
    const currentPassword = passwords[currentIndex];

    if (!currentPassword) {
        return <div>Password not found.</div>; // Handle case where password is deleted or not found.
    }

    const deleteHandler = async () => {
        console.log("From Get Password Page:", passwordId);
        const result = await dispatch(deletePassword({ sessionToken, passwordId }));

        if (result.meta.requestStatus === "fulfilled") {
            dispatch(showNotification(`${currentPassword.url} was deleted successfully`));
            setTimeout(() => {
                dispatch(clearNotification());
            }, 3000); // Clear notification after 3 seconds
            navigate('/passwords'); // Navigate away after deletion to avoid accessing deleted data
        } else {
            dispatch(showNotification("Failed to delete password."));
            setTimeout(() => {
                dispatch(clearNotification());
            }, 3000);
        }
    };

    const inputClasses = "text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker";
    
    const isSameTimestamp = currentPassword.created_at === currentPassword.updated_at;

    return (
        <>
            <div className="password-content">
                <div className="flex align-middle">
                    <div className="flex items-center min-w-[60px]">
                        <Link to={"/passwords"} className='hover:bg-gray-600 p-1 rounded-full inline-block'>
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="15px" width="15px" xmlns="http://www.w3.org/2000/svg"><path d="M217.9 256L345 129c9.4-9.4 9.4-24.6 0-33.9-9.4-9.4-24.6-9.3-34 0L167 239c-9.1 9.1-9.3 23.7-.7 33.1L310.9 417c4.7 4.7 10.9 7 17 7s12.3-2.3 17-7c9.4-9.4 9.4-24.6 0-33.9L217.9 256z"></path></svg>
                        </Link>
                        <div className="thumbnail bg-black p-1.5 rounded-full">
                            <svg stroke="currentColor" fill="#000" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="28px" width="28px" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 7a9 9 0 0 0 -7.5 -4a8.991 8.991 0 0 0 -7.484 4"></path><path d="M11.5 3a16.989 16.989 0 0 0 -1.826 4"></path><path d="M12.5 3a16.989 16.989 0 0 1 1.828 4"></path><path d="M19.5 17a9 9 0 0 1 -7.5 4a8.991 8.991 0 0 1 -7.484 -4"></path><path d="M11.5 21a16.989 16.989 0 0 1 -1.826 -4"></path><path d="M12.5 21a16.989 16.989 0 0 0 1.828 -4"></path><path d="M2 10l1 4l1.5 -4l1.5 4l1 -4"></path><path d="M17 10l1 4l1.5 -4l1.5 4l1 -4"></path><path d="M9.5 10l1 4l1.5 -4l1.5 4l1 -4"></path></svg>
                        </div>
                    </div>

                    <Link className="flex-1 flex justify-between items-center" to={currentPassword.url} target="_blank">
                        <span>
                            {currentPassword.url}
                        </span>
                        <div className='hover:bg-gray-600 p-1 rounded-full inline-block'>
                            <MdArrowOutward size={16} />
                        </div>
                    </Link>
                </div>
            </div>
            <div>
                <hr className="mt-5 mb-4 border-gray-700" />
                <div className="main mb-9">
                    <div className="form-control mb-4">
                        <label htmlFor="username" className="text-gray-300">Username</label>
                        <div className="relative">
                            <input
                                disabled
                                value={currentPassword.username}
                                className={inputClasses}
                            />
                            <span
                                onClick={() => handleCopy(currentPassword.username, 'username')}
                                className="absolute inset-y-0 right-0 flex items-center cursor-pointer mx-2 my-auto h-fit p-1.5 rounded-full hover:bg-gray-600"
                            >
                                <FaCopy />
                                {copyStatus.username && <span className="absolute text-red-500 right-12 inset-y-0">Copied!</span>}
                            </span>
                        </div>
                    </div>
                    <div className="form-control mb-4">
                        <label htmlFor="password" className="text-gray-300">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                id="password"
                                value={currentPassword.password}
                                disabled
                                className={inputClasses}
                            />
                            <span
                                onClick={() => handleCopy(currentPassword.password, 'password')}
                                className="absolute inset-y-0 right-8 flex items-center cursor-pointer mx-2 my-auto h-fit p-1.5 rounded-full hover:bg-gray-600"
                            >
                                <FaCopy />
                                {copyStatus.password && <span className="absolute text-red-500 right-12 inset-y-0 z-10">Copied!</span>}
                            </span>
                            <span
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 flex items-center cursor-pointer mx-2 my-auto h-fit p-1.5 rounded-full hover:bg-gray-600"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>
                    {currentPassword.note &&
                        <div className="form-control mb-4">
                            <label className="text-gray-300">Notes</label>
                            <div className="relative">
                                <p className={inputClasses}>{currentPassword.note}</p>
                            </div>
                        </div>
                    }
                    <div className="form-control mb-4">
                        <label className="text-gray-300">Created On</label>
                        <div className="relative">
                            <p className={inputClasses}>{currentPassword.created_at}</p>
                        </div>
                    </div>
                    {!isSameTimestamp &&
                        <div className="form-control mb-4">
                            <label className="text-gray-300">Updated On</label>
                            <div className="relative">
                                <p className={inputClasses}>{currentPassword.updated_at}</p>
                            </div>
                        </div>
                    }
                </div>
                <div className="flex justify-between gap-4">
                    <Link to={`/passwords/edit/${id}`} className="text-white cursor-pointer text-base p-4 rounded-md mb-4 transition-colors duration-300 bg-opred hover:bg-opredHover focus:bg-opredHover active:bg-opredHover w-full text-center block">Edit</Link>

                    <DeleteModal onDelete={deleteHandler} username={currentPassword.username} />
                </div>
            </div>
        </>
    );
};

export { GetPassword };
