import React, { useState } from 'react';

interface FormData {
    email: string;
    token: string;
    name: string;
    master_password: string;
    confirm_master_password: string;
}

interface FormErrors {
    email?: string;
    token?: string;
    name?: string;
    master_password?: string;
    confirm_master_password?: string;
}

interface StepThreeProps {
    formData: FormData;
    errors: FormErrors;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importing icons


const StepThree: React.FC<StepThreeProps> = ({ formData, errors, onChange }) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    return (
        <>
            <div className="form-control mb-6">
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    placeholder="Name"
                    className="text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"
                    onChange={onChange}
                />
                {errors.name && <small className='mt-2 px-4 text-opred'>{errors.name}</small>}
            </div>
            <div className="form-control mb-6">
                
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="master_password"
                        name="master_password"
                        placeholder="Master Password"
                        value={formData.master_password}
                        onChange={onChange}
                        className="text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"
                    />
                    <span
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center cursor-pointer mx-2 my-auto h-fit p-1.5 rounded-full hover:bg-[#585858]"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                {errors.master_password && <small className='mt-2 px-4 text-opred'>{errors.master_password}</small>}
            </div>
            <div className="form-control mb-6">
                
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="confirm_master_password"
                        name="confirm_master_password"
                        placeholder="Confirm Master Password"
                        value={formData.confirm_master_password}
                        onChange={onChange}
                        className="text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"
                    />
                    <span
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center cursor-pointer mx-2 my-auto h-fit p-1.5 rounded-full hover:bg-[#585858]"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                {errors.confirm_master_password && <small className='mt-2 px-4 text-opred'>{errors.confirm_master_password}</small>}
            </div>
            <input
                type="submit"
                value="Register"
                className="text-white cursor-pointer text-base p-4 rounded-md mb-4 transition-colors duration-300 bg-opred hover:bg-opredHover focus:bg-opredHover active:bg-opredHover w-full text-center block"
            />
        </>
    );
}

export default StepThree;
