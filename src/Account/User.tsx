import React from "react"
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import { clearNotification, showNotification } from '../features/notifications/notificationSlice';
import { logout } from '../features/auth/authSlice'; // Adjust this path
import { Link, useNavigate } from "react-router-dom";
import { MdWavingHand } from "react-icons/md";


const User: React.FC = () => {
    const { firstName, isLoggedIn } = useSelector((state: any) => state.auth);
    const { sessionToken } = useSelector((state: RootState) => state.auth);
    const dispatch: AppDispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();


    // Component or some place where you dispatch the logout thunk
    const handleLogout = () => {

        if (sessionToken) {
            dispatch(logout({ sessionToken }));
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
            {!isLoggedIn && <p className="text-center">Please <Link className="text-opred" to={"login"}>login</Link></p>}
            {isLoggedIn &&
                <>
                    <div className="flex gap-5 items-center">
                        <svg stroke="currentColor" fill="#d71340" stroke-width="0" viewBox="0 0 24 24" height="64px" width="64px" xmlns="http://www.w3.org/2000/svg"><path d="M3.78307 2.82598L12 1L20.2169 2.82598C20.6745 2.92766 21 3.33347 21 3.80217V13.7889C21 15.795 19.9974 17.6684 18.3282 18.7812L12 23L5.6718 18.7812C4.00261 17.6684 3 15.795 3 13.7889V3.80217C3 3.33347 3.32553 2.92766 3.78307 2.82598ZM12 11C13.3807 11 14.5 9.88071 14.5 8.5C14.5 7.11929 13.3807 6 12 6C10.6193 6 9.5 7.11929 9.5 8.5C9.5 9.88071 10.6193 11 12 11ZM7.52746 16H16.4725C16.2238 13.75 14.3163 12 12 12C9.68372 12 7.77619 13.75 7.52746 16Z"></path></svg>

                        <p className="flex gap-1 flex-col"> <span className="flex gap-2">Hi <MdWavingHand size={16} /></span> <span className="text-2xl">{firstName}</span> </p>
                    </div>
                    <div className="content">
                        <div className="bg-transparent text-white font-sans leading-relaxed py-6">
                            <h1 className="text-2xl font-bold mb-4">
                                Introducing My Advanced Password Management Solution
                            </h1>
                            <p className="mb-6">
                                I am excited to unveil my cutting-edge password management solution, designed with the highest standards of security in mind. This project integrates best practices in cryptography to ensure your sensitive information remains safe and secure.
                            </p>

                            <p className="mb-6">
                                In today's digital age, managing passwords effectively is crucial. A password manager helps you generate and store strong, unique passwords for each of your accounts, reducing the risk of breaches and ensuring your online security.
                            </p>

                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold mb-2">
                                    Key Features:
                                </h2>
                                <ul className="list-disc list-inside pl-6">
                                    <li>
                                        <strong className="font-medium">Advanced Encryption:</strong> I use state-of-the-art encryption methods to protect your passwords, ensuring that your data remains confidential and secure from unauthorized access.
                                    </li>
                                    <li>
                                        <strong className="font-medium">PBKDF2 Hashing Algorithm:</strong> The system employs the PBKDF2 (Password-Based Key Derivation Function 2) hashing algorithm, a robust and widely recognized method for securely hashing passwords. This adds a layer of protection, making it extremely difficult for attackers to recover your passwords.
                                    </li>
                                    <li>
                                        <strong className="font-medium">User Data Security:</strong> Security is a top priority. I implement best practices in cryptography and data protection to ensure your information remains safe.
                                    </li>
                                </ul>
                            </div>

                            <p className="mb-6">
                                For more information on the encryption practices I follow, please visit my blog:
                                <a target="_blank" href="https://portfolio-e4ocl.kinsta.page/blogs/topic/cryptography" className="text-red-500 hover:underline">
                                    Understanding Cryptography
                                </a>.
                            </p>

                            <p className="font-semibold text-lg mb-4">
                                I am thrilled to share this project with you and am committed to continually enhancing security measures to keep your data safe.
                            </p>

                            <p className="font-semibold text-lg mb-4">
                                Thank you for signing up! Your trust and security are my top priorities. If you have any questions or need assistance, feel free to reach out.
                            </p>

                            <p className="font-semibold text-lg">
                                Welcome aboard, and enjoy the peace of mind that comes with knowing your passwords are well protected.
                            </p>
                        </div>
                        <hr className="my-4" />
                        <div>
                            <button onClick={handleLogout} className="logout-button text-opred">
                                Logout?
                            </button>
                        </div>
                    </div>
                </>}
        </>
    )
}

export { User }