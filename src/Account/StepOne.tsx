import React from 'react';

interface StepOneProps {
    formData: FormData;
    errors: FormErrors;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNext: () => void;
}

const StepOne: React.FC<StepOneProps> = ({ formData, errors, onChange, onNext, currentStep }) => {
    return (
        <div>
            <div className="form-control mb-6">

                <input
                    type="email"
                    id="email"
                    className={` ${currentStep !== 1 ? "opacity-55" : ""} text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker`}
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    disabled={currentStep !== 1}

                />
                {errors.email && <p>{errors.email}</p>}
            </div>
            {currentStep === 1 &&

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

export default StepOne;
