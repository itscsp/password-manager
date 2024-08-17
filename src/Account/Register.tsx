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
    const [formData, setFormData] = useState<FormData>({
        email: "",
        token: "***********",
        name: "",
        master_password: "",
        confirm_master_password: "",
    })

    const currentStep = 1;

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
                            placeholder="Enter your email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={currentStep !== 1 ? true : false}
                        />
                        {errors.email && <p>{errors.email}</p>}
                    </div>
                    <div className="form-control mb-6">

                        <input
                            type="text"
                            id="token"
                            name="token"
                            value={formData.token}
                            disabled
                            className="text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"

                        />
                        {errors.token && <p>{errors.token}</p>}
                    </div>
                </form>

            </div>
        </div>
    )
}