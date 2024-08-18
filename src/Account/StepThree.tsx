import React from 'react';

interface StepThreeProps {
    formData: FormData;
    errors: FormErrors;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const StepThree: React.FC<StepThreeProps> = ({ formData, errors, onChange, onSubmit }) => {
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
                {errors.name && <p>{errors.name}</p>}
            </div>
            <div className="form-control mb-6">
                <input
                    type="password"
                    id="master_password"
                    name="master_password"
                    value={formData.master_password}
                    placeholder="Master Password"
                    className="text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"
                    onChange={onChange}
                />
                {errors.master_password && <p>{errors.master_password}</p>}
            </div>
            <div className="form-control mb-6">
                <input
                    type="password"
                    id="confirm_master_password"
                    name="confirm_master_password"
                    value={formData.confirm_master_password}
                    placeholder="Confirm Master Password"
                    className="text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"
                    onChange={onChange}
                />
                {errors.confirm_master_password && <p>{errors.confirm_master_password}</p>}
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
