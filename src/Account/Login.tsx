import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { clearNotification, showNotification } from '../features/notifications/notificationSlice';
import { encryptAndFormatData } from '../utils/encryption';
import { AppDispatch, RootState } from '../app/store'; // Adjust imports based on your store setup
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importing icons


interface FormData {
    username: string;
    master_password: string;
}

interface FormErrors {
    username?: string;
    master_password?: string;
}

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        username: '',
        master_password: '',
    });
    const navigate = useNavigate(); // Initialize the navigate function

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const [errors, setErrors] = useState<FormErrors>({});
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const storedData = sessionStorage.getItem('userToken');
        if (storedData) {
            const lastActive = sessionStorage.getItem('lastActive');
            const currentTime = new Date().getTime();

            if (lastActive && currentTime - parseInt(lastActive, 10) < 10 * 60 * 1000) {
                dispatch(showNotification('User is still logged in.'));
            } else {
                sessionStorage.clear(); // Clear storage if inactive for more than 10 minutes
            }
        }
    }, [dispatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = (): FormErrors => {
        const validationErrors: FormErrors = {};
        if (!formData.username) {
            validationErrors.username = 'Username is required';
        }
        if (!formData.master_password) {
            validationErrors.master_password = 'Master password is required';
        }
        return validationErrors;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            dispatch(clearNotification());

            try {
                const formattedData = await encryptAndFormatData(formData.master_password);

                try {
                    await dispatch(login({ username: formData.username, master_password: formData.master_password, encryptedData: formattedData })).unwrap();
                    dispatch(showNotification('Login successful'));


                    setTimeout(() => {
                        dispatch(clearNotification());
                    }, 3000); // Clear notification after 3 seconds

                    // Redirect to the home page
                    navigate('/');

                } catch (err: any) {
                    console.error('Login or Encryption Error:', err.message || err);
                    dispatch(showNotification(err || "Login failed"));
                    setTimeout(() => {
                        dispatch(clearNotification());
                    }, 3000); // Clear notification after 3 seconds

                }
            } catch (err: any) {
                console.error('Login or Encryption Error:', err);
                dispatch(showNotification(err));
            }
        }
    };

    return (
        <div className="card py-7">
            <h4 className="text-center text-2xl">Login to Your Account</h4>
            <div className="card-body pt-10">
                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-control mb-6">
                        <label htmlFor="username">Email</label>
                        <input
                            type="email"
                            id="username"
                            name="username"
                            placeholder='Email'
                            value={formData.username}
                            onChange={handleChange}
                            className="text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"
                        />
                        {errors.username && <small className="text-red-500">{errors.username}</small>}
                    </div>
                    <div className="form-control mb-6">
                        <label htmlFor="master_password">Master Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="master_password"
                                name="master_password"
                                placeholder="Master Password"
                                value={formData.master_password}
                                onChange={handleChange}
                                className="text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"
                            />
                            <span
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 flex items-center cursor-pointer mx-2 my-auto h-fit p-1.5 rounded-full hover:bg-[#585858]"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        {errors.master_password && <small className="text-red-500">{errors.master_password}</small>}
                    </div>

                    <button type="submit" className="text-white cursor-pointer text-base p-4 rounded-md mb-4 transition-colors duration-300 bg-opred hover:bg-opredHover focus:bg-opredHover active:bg-opredHover w-full text-center block" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <Link className='text-opred' to={"/account/register"}>Create a new account</Link>
            </div>
        </div>
    );
};

export { Login };
