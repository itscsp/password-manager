import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../features/auth/authSlice';
import { clearNotification, showNotification } from '../features/notifications/notificationSlice';
import { encryptAndFormatData } from '../utils/encryption';

const Login: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        master_password: '',
    });

    const [errors, setErrors] = useState<{ username?: string; master_password?: string }>({});
    const dispatch = useDispatch();
    const { loading, error, isLoggedIn } = useSelector((state: any) => state.auth);

    useEffect(() => {
        const storedData = sessionStorage.getItem('userToken');
        if (storedData) {
            const [keyHex, iv, encryptedData] = storedData.split('|');
            const lastActive = sessionStorage.getItem('lastActive');
            const currentTime = new Date().getTime();

            if (lastActive && currentTime - parseInt(lastActive) < 10 * 60 * 1000) {
                // User is still active, extract the necessary data
                dispatch(showNotification('User is still logged in.'));
                // Set the state or store with the decrypted data or stored info.
                // For now, we'll assume the user is logged in and proceed.
            } else {
                sessionStorage.clear(); // Clear storage if inactive for more than 10 minutes
            }
        }
    }, [dispatch]);

    // Helper functions for encryption
    const bytesToBase64 = (bytes: Uint8Array) => {
        return btoa(String.fromCharCode(...bytes));
    };

    const bytesToHex = (bytes: Uint8Array) => {
        return Array.from(bytes, (byte) =>
            byte.toString(16).padStart(2, '0')
        ).join('');
    };

    const generateRandomKeyAndIV = async () => {
        const keyBytes = crypto.getRandomValues(new Uint8Array(32)); // 32 bytes = 256 bits
        const ivBytes = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes for AES-CBC IV
        return { keyBytes, ivBytes };
    };

    const encryptData = async (keyBytes: Uint8Array, ivBytes: Uint8Array, plaintext: string) => {
        const key = await crypto.subtle.importKey(
            'raw',
            keyBytes,
            { name: 'AES-CBC' },
            false,
            ['encrypt']
        );

        const encryptedBytes = await crypto.subtle.encrypt(
            { name: 'AES-CBC', iv: ivBytes },
            key,
            new TextEncoder().encode(plaintext)
        );

        return {
            encryptedData: bytesToBase64(new Uint8Array(encryptedBytes)),
            iv: bytesToBase64(ivBytes),
            keyHex: bytesToHex(keyBytes),
        };
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = () => {
        const validationErrors: { username?: string; master_password?: string } = {};
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

                // Store encrypted master password and current timestamp in session storage

                // Dispatch the login action with the encrypted master password
                await dispatch(login({ username: formData.username, master_password: formData.master_password, encryptedData: formattedData })).unwrap();


                dispatch(showNotification('Login successful'));
                // Redirect to dashboard or wherever necessary

                setTimeout(() => {
                    dispatch(clearNotification());
                }, 3000); // Remove notification after 3 seconds

            } catch (err) {
                console.error('Login or Encryption Error:', err);
                dispatch(showNotification('Failed to login'));
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
                            className={`text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker`}
                        />
                        {errors.username && <small className="text-red-500">{errors.username}</small>}
                    </div>
                    <div className="form-control mb-6">
                        <label htmlFor="master_password">Master Password</label>
                        <input
                            type="password"
                            id="master_password"
                            name="master_password"
                            placeholder='Master Password'
                            value={formData.master_password}
                            onChange={handleChange}
                            className={`text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker`}
                        />
                        {errors.master_password && <small className="text-red-500">{errors.master_password}</small>}
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <button type="submit" className="text-white cursor-pointer text-base p-4 rounded-md mb-4 transition-colors duration-300 bg-opred hover:bg-opredHover focus:bg-opredHover active:bg-opredHover w-full text-center block" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export { Login };
