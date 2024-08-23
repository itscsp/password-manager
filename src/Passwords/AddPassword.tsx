import React, { useEffect, useState } from "react"
import validatePassword from "../utils/validatePassword"
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { addPassword } from "../features/passwords/passwordSlice";

/**
 * Step 1: Create for design
 * Step 2: Create needed types for store data
 * Step 3: Get data to these data by user
 * Step 4: Validate user data and show error message
 * Step 5: If all data are valid hit API to add password
 * Step 6: Show response of the AP
 * Step 7: Manager loading and error state
 */

interface FormData {
    url: string,
    username: string,
    password: string,
    note: string,
}

interface FormErrors {
    url?: string,
    username?: string,
    password?: string,
    note?: string,
}

const AddPasswords: React.FC = () => {
    const { sessionToken } = useSelector((state: RootState) => state.auth);


    console.log(sessionToken);

    const [formData, setFormData] = useState<FormData>({
        url: "",
        username: "",
        password: "",
        note: ""
    })

    const [errors, setErrors] = useState<FormErrors>({});
    const [warnings, setWarnings] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState<string | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {

        console.log("loading: ", loading)
        console.log("API Response: ", apiResponse)

    }, [loading, setApiResponse])


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        console.log(formData);
    }

    const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        console.log(formData);
    }

    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};
        const newWarnings: FormErrors = {};

        if (!formData.url) {
            newErrors.url = "URL is required";
        } else if (!/^https?:\/\/[^\s$.?#].[^\s]*$/.test(formData.url)) {
            newErrors.url = "Invalid URL format (Follow this format: https://example.com)";
        }

        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        } else {
            const passwordWarning = validatePassword(formData.password);
            if (passwordWarning) {
                newWarnings.password = passwordWarning;
            }

            setWarnings(newWarnings); // Set warnings

        }

        if (formData.note.length > 500) {
            newErrors.note = "Note must be 250 characters or less";
        }

        return newErrors
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Submitting...");

        // Validate form data
        const validationError = validate();
        setErrors(validationError);

        if (Object.keys(validationError).length === 0) {
            setLoading(true);
            setApiResponse(null);

            try {

                debugger;
                await dispatch(addPassword({ sessionToken, passwordData: formData })).unwrap();
                setApiResponse("Password added successfully");
            } catch (error) {
                // Handle different types of errors if possible
                setApiResponse("Failed to add password");
            } finally {
                setLoading(false);
            }
        }
    };


    const classes = "text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker";

    return (
        <>
            <h4 className="text-center text-2xl mb-5">Add New Password</h4>
            <form autoComplete="off" onSubmit={handleSubmit}>
                <div className="form-control mb-4">

                    <label htmlFor="url">Enter your website URL
                    </label>
                    <input type="text" name="url" placeholder="http://google.com" id="url" onChange={handleInputChange} value={formData.url} className={classes} />
                    {errors.url && <small className="text-red-500">{errors.url}</small>}

                </div>
                <div className="form-control mb-4">
                    <label htmlFor="username">Enter your username</label>
                    <input type="text" name="username" id="username" onChange={handleInputChange} value={formData.username} className={classes} />
                    {errors.username && <small className="text-red-500">{errors.username}</small>}

                </div>
                <div className="form-control mb-4">
                    <label htmlFor="password">Enter Your Password</label>
                    <input type="text" name="password" id="password" onChange={handleInputChange} value={formData.password} className={classes} />
                    {errors.password && <small className="text-red-500">{errors.password}</small>}
                    <br />
                    {warnings.password && <small className="text-yellow-500">Suggestion: {warnings.password}</small>}
                </div>

                <div className="form-control mb-4">
                    <label htmlFor="note">Note</label>
                    <textarea id="note" name="note" onChange={handleTextAreaChange} value={formData.note} className={classes} >
                    </textarea>
                    {errors.note && <small className="text-red-500">{errors.note}</small>}
                </div>
                <div className="form-control mb-4">

                    <input
                        type="submit"
                        value="Add"
                        className="text-white cursor-pointer text-base p-4 rounded-md mb-4 transition-colors duration-300 bg-opred hover:bg-opredHover focus:bg-opredHover active:bg-opredHover w-full text-center block"
                    />

                </div>
            </form>
        </>
    )
}

export { AddPasswords }