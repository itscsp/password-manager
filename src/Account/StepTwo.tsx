import React from 'react';

interface StepTwoProps {
    formData: FormData;
    errors: FormErrors;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNext: () => void;
}

const StepTwo: React.FC<StepTwoProps> = ({ formData, errors, onChange, onNext, currentStep }) => {
    return (
        <div>
            <div className="form-control mb-6">
                <input
                    type="text"
                    id="token"
                    name="token"
                    value={formData.token}
                    placeholder='Verification token'
                    onChange={onChange}
                    disabled={currentStep !== 2}
                    className={` ${currentStep !== 2 ? "opacity-55" : ""} text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker`}
                />
                {errors.token && <p className='mt-2 px-4'>{errors.token}</p>}
            </div>
            {currentStep === 2 &&
                <input
                    type="button"
                    value="Continue"
                    onClick={onNext}
                    className="text-white cursor-pointer text-base p-4 rounded-md mb-4 transition-colors duration-300 bg-opred hover:bg-opredHover focus:bg-opredHover active:bg-opredHover w-full text-center block"
                />
            }
        </div>
    );
}

export default StepTwo;
