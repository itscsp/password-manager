import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { clearNotification, showNotification } from '../features/notifications/notificationSlice';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';

const Register: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<FormData>({
        email: "",
        token: "",
        name: "",
        master_password: "",
        confirm_master_password: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateStepOne = (): FormErrors => {
        const stepOneErrors: FormErrors = {};
        if (!formData.email) {
            stepOneErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            stepOneErrors.email = 'Email address is invalid';
        }
        return stepOneErrors;
    };

    const validateStepTwo = (): FormErrors => {
        const stepTwoErrors: FormErrors = {};
        if (!formData.token) {
            stepTwoErrors.token = 'Token is required';
        }
        return stepTwoErrors;
    };

    const validateStepThree = (): FormErrors => {
        const stepThreeErrors: FormErrors = {};

        if (!formData.name.trim()) {
            stepThreeErrors.name = 'Name is required';
        }

        if (!formData.master_password) {
            stepThreeErrors.master_password = 'Master password is required';
        } else if (formData.master_password.length < 8) {
            stepThreeErrors.master_password = 'Master password must be at least 8 characters';
        }

        if (formData.master_password !== formData.confirm_master_password) {
            stepThreeErrors.confirm_master_password = 'Passwords do not match';
        }

        return stepThreeErrors;
    };

    const handleStepOne = () => {
        const stepOneErrors = validateStepOne();
        setErrors(stepOneErrors);
        if (Object.keys(stepOneErrors).length === 0) {
            dispatch(showNotification("Please check your email for verification link"));
            setCurrentStep(2);
        }
    };

    const handleStepTwo = () => {
        const stepTwoErrors = validateStepTwo();
        setErrors(stepTwoErrors);
        if (Object.keys(stepTwoErrors).length === 0) {
            dispatch(clearNotification());
            dispatch(showNotification("Your email verified"));
            setCurrentStep(3);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validationErrors = validateStepThree();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            console.log("Form Submitted", formData);
            // Continue with registration

            dispatch(clearNotification());
            dispatch(showNotification("Please complete your registration process"));
        }
    };

    return (
        <div className="card py-7">
            <h4 className="text-center text-2xl">Create An Account</h4>
            <div className="card-body pt-10">
                <form onSubmit={handleSubmit} autoComplete="off">

                    {currentStep >= 1 && (
                        <StepOne
                            formData={formData}
                            errors={errors}
                            onChange={handleChange}
                            onNext={handleStepOne}
                            currentStep={currentStep}
                        />
                    )}
                    {currentStep >= 2 && (
                        <StepTwo
                            formData={formData}
                            errors={errors}
                            onChange={handleChange}
                            onNext={handleStepTwo}
                            currentStep={currentStep}

                        />
                    )}
                    {currentStep === 3 && (
                        <StepThree
                            formData={formData}
                            errors={errors}
                            onChange={handleChange}
                            onSubmit={handleSubmit}
                        />
                    )}
                </form >
            </div>
        </div >
    );
};

export { Register };
