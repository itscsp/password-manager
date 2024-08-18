import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  startRegistration,
  verifyEmailToken,
  completeRegistration,
  clearError,
} from '../features/auth/authSlice';
import { clearNotification, showNotification } from '../features/notifications/notificationSlice';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import { Navigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const dispatch = useDispatch();
  const { loading, error, isEmailVerified } = useSelector((state: any) => state.auth);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    token: '',
    name: '',
    master_password: '',
    confirm_master_password: '',
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

  const handleStepOne = async () => {
    const stepOneErrors = validateStepOne();
    setErrors(stepOneErrors);
    if (Object.keys(stepOneErrors).length === 0) {
      dispatch(clearNotification());
      dispatch(startRegistration(formData.email))
        .unwrap()
        .then(() => {
          dispatch(showNotification('Please check your email for the verification link'));
          setCurrentStep(2);
        })
        .catch(() => {
          dispatch(showNotification('Failed to send verification link'));
        });
    }
  };

  const handleStepTwo = async () => {
    const stepTwoErrors = validateStepTwo();
    setErrors(stepTwoErrors);
    if (Object.keys(stepTwoErrors).length === 0) {
      dispatch(clearNotification());
      dispatch(verifyEmailToken({ email: formData.email, token: formData.token }))
        .unwrap()
        .then(() => {
          dispatch(showNotification('Your email is verified'));
          setCurrentStep(3);
        })
        .catch(() => {
          dispatch(showNotification('Invalid verification token'));
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateStepThree();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      dispatch(clearNotification());
      dispatch(completeRegistration(formData))
        .unwrap()
        .then(() => {
          dispatch(showNotification('Registration completed'));
          Navigate("/acoount/login")
        })
        .catch(() => {
          dispatch(showNotification('Failed to complete registration'));
        });
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
              loading={loading}
              error={error}
            />
          )}
          {currentStep >= 2 && (
            <StepTwo
              formData={formData}
              errors={errors}
              onChange={handleChange}
              onNext={handleStepTwo}
              currentStep={currentStep}
              loading={loading}
              error={error}
            />
          )}
          {currentStep === 3 && (
            <StepThree
              formData={formData}
              errors={errors}
              onChange={handleChange}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />
          )}
        </form>
      </div>
    </div>
  );
};

export { Register };
