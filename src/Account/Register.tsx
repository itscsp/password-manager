import { useState } from "react";

export { Register }

// Define types for the form data and error messages
interface FormData {
    email: string;
    token: string;
    name: string;
    master_password: string;
    confirm_master_password: string
}

interface FormErrors {
    email?: string;
    token?: string;
    name?: string;
    master_password?: string,
    confirm_master_password: string;
}

const Register: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<FormData>({
        email: "",
        token: "***********",
        name: "",
        master_password: "",
        confirm_master_password: "",
    })


    const [errors, setErrors] = useState<FormErrors>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const validate = (): FormErrors => {
        const errors: FormErrors = {};
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email address is invalid';
        }

        return errors;
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Form Submited")
    }

    const StepOneHandler = () => {
        console.log("Step One Handler")
        setCurrentStep(2);
    }
    return (
        <div className="card py-7">
            <h4 className="text-center text-2xl">Create An Account</h4>
            <div className="card-body pt-10">
                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-control mb-6">


                        <input
                            type="email"
                            id="email"
                            className="text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"
                            placeholder="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={currentStep !== 1 ? true : false}
                        />
                        {errors.email && <p>{errors.email}</p>}
                    </div>
                    {currentStep !== 1 &&
                        <>
                            <div className="form-control mb-6">

                                <input
                                    type="text"
                                    id="token"
                                    name="token"
                                    value={formData.token}
                                    disabled
                                    hidden
                                    className="text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"

                                />
                                {errors.token && <p>{errors.token}</p>}
                            </div>

                            <div className="form-control mb-6">

                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    placeholder="Name"
                                    className="text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"

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

                                />
                                {errors.confirm_master_password && <p>{errors.confirm_master_password}</p>}
                            </div>
                        </>
                    }

                    <div className="form-controll">
                        {currentStep === 1 &&
                            <input type="button" value={"Continue"} onClick={StepOneHandler} className="text-white cursor-pointer text-base p-4 rounded-md mb-4 transition-colors duration-300 bg-opred hover:bg-opredHover focus:bg-opredHover active:bg-opredHover  w-full text-center block" />
                        }
                        {currentStep !== 1 &&
                            <input type="submit" value={"Register"} className="text-white cursor-pointer text-base p-4 rounded-md mb-4 transition-colors duration-300 bg-opred hover:bg-opredHover focus:bg-opredHover active:bg-opredHover  w-full text-center block" />
                        }
                    </div>
                </form>

            </div>
        </div>
    )
}