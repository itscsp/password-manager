import { useState } from "react";
import RegisterStep1 from "../components/RegisterStep1.tsx";
import RegisterStep2 from "../components/RegisterStep2.tsx";

const RegisterPage = () => {
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div className="container flex items-center justify-center px-4">
      <div className="md:p-6 py-6 px-4 bg-black rounded-lg shadow-lg text-white max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-8 text-center">Create an account</h1>

        <div className="userRegistrationSteps">
          {step === 1 && <RegisterStep1 />}
          {step === 2 && <RegisterStep2 />}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
