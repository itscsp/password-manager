import React, { useState } from "react"
import validatePassword from "../utils/validatePassword"

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
    const [formData, setFormData] = useState<FormData>({
        url: "",
        username: "",
        password: "",
        note: ""
    })

    const [errors, setErrors] = useState<FormErrors>({});
    const [warnings, setWarnings] = useState<FormErrors>({});


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

    const handlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Submiting...")
        const validationError = validate();
        console.log(validationError)
        console.log(warnings)

        setErrors(validationError)

        if (Object.keys(validationError).length === 0) {
            console.log(errors);
        }
    }
    return (
        <>
            <h1>Add password</h1>
            <form autoComplete="off" onSubmit={handlSubmit}>
                <div className="form-control mb-2">

                    <label htmlFor="url">Enter your website URL
                    </label>
                    <input type="text" name="url" placeholder="url" id="url" onChange={handleInputChange} />
                </div>
                <div className="form-control mb-2">
                    <label htmlFor="username">Enter your website URL</label>
                    <input type="text" name="username" id="username" onChange={handleInputChange} />
                </div>
                <div className="form-control mb-2">
                    <label htmlFor="password">Enter Your Password</label>
                    <input type="text" name="password" id="password" onChange={handleInputChange} />
                </div>

                <div className="form-control mb-2">
                    <label htmlFor="note">Note</label>
                    <textarea id="note" name="note" onChange={handleTextAreaChange}  >
                    </textarea>
                </div>
                <div className="form-control mb-2">
                    <input type="submit" placeholder="Add" />
                </div>
            </form>
        </>
    )
}

export { AddPasswords }