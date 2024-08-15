import { ChangeEvent, FormEvent, useState } from "react"

interface formState {
    email: string,
    isValidEmail: boolean,
    message: string,
}



const RegisterStep2: React.FC = () => {
    const [message, setMessage] = useState("");
    const [formState, setFormState] = useState<formState>({
        email: "",
        isValidEmail: true,
        message: "",
    })

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    const submitHandler = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (formState.email.length === 0) {
            setFormState((prevState) => ({
                ...prevState,
                isValidEmail: false,
                message: "Enter email address.",
            }));

            return;
        }

        const isValid = validateEmail(formState.email);

        if (formState.email.length !== 0 && !isValid) {
            setFormState((prevState) => ({
                ...prevState,
                isValidEmail: false,
                message: "Enter valid email address.",
            }));
        } else {

            setMessage("You will get email")
        }

        setFormState((prevState) => ({
            ...prevState, isValidEmail: isValid,
        }));

    }

    const changeHandler = (event: ChangeEvent<HTMLInputElement>): void => {
        setFormState((prevState) => ({
            ...prevState, email: event.target.value
        }));
    }

    return (
        <div>
            <form action="flex flex-cols gap-3" onSubmit={submitHandler} autoComplete="off">
                <div className="form-control mb-6">
                    <input
                        type="email"
                        id="registration_email"
                        className="text-base outline-none border-b-2 text-gray-500 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"
                        placeholder="Enter your email"
                        onChange={changeHandler}
                        value={"a@a.com"}
                        disabled
                    />
                    {!formState.isValidEmail && (
                        <p className="text-red-500 text-sm mt-1">{formState.message}</p>
                    )}
                </div>
                
                <div className="form-control mb-6">
                    <input
                        type="password"
                        id="registration_email"
                        className="text-base outline-none border-b-2 text-gray-500 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"
                        placeholder="Your token"
                        onChange={changeHandler}
                        value={"58943fjqwfu98sdvfs09"}
                        disabled
                    />
                    {!formState.isValidEmail && (
                        <p className="text-red-500 text-sm mt-1">{formState.message}</p>
                    )}
                </div>

                <div className="form-control mb-6">
                    <input
                        type="text"
                        id="registration_name"
                        className="text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"
                        placeholder="Enter your name"
                        onChange={changeHandler}
                    />
                    {!formState.isValidEmail && (
                        <p className="text-red-500 text-sm mt-1">{formState.message}</p>
                    )}
                </div>
                <div className="form-control mb-6">
                    <input
                        type="password"
                        id="master_password"
                        className="text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"
                        placeholder="Enter master password"
                        onChange={changeHandler}
                    />
                    {!formState.isValidEmail && (
                        <p className="text-red-500 text-sm mt-1">{formState.message}</p>
                    )}
                </div>
                <div className="form-control mb-6">
                    <input
                        type="password"
                        id="confirm_master_password"
                        className="text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"
                        placeholder="Confirm your master password"
                        onChange={changeHandler}
                    />
                    {!formState.isValidEmail && (
                        <p className="text-red-500 text-sm mt-1">{formState.message}</p>
                    )}
                </div>
                <div className="form-controll">
                    <input type="submit" value={"Register"} className="text-white cursor-pointer text-base p-4 rounded-md mb-4 transition-colors duration-300 bg-opred hover:bg-opredHover focus:bg-opredHover active:bg-opredHover  w-full text-center block" />
                    {message.length > 1 &&
                        <p className="flex items-center gap-4"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M5.90909 13.8182L6.09091 8.81818L1.86364 11.5L0.772727 9.59091L5.22727 7.27273L0.772727 4.95454L1.86364 3.04545L6.09091 5.72727L5.90909 0.727272H8.09091L7.90909 5.72727L12.1364 3.04545L13.2273 4.95454L8.77273 7.27273L13.2273 9.59091L12.1364 11.5L7.90909 8.81818L8.09091 13.8182H5.90909Z" fill="#D71340" />
                        </svg>
                            <span>

                                {message}
                            </span>
                        </p>
                    }
                </div>

            </form>
        </div>
    )
}

export default RegisterStep2