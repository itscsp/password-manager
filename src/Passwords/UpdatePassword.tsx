import React, { useState, useEffect } from "react";
import validatePassword from "../utils/validatePassword";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { updatePassword, fetchIndividualPassword } from "../features/passwords/passwordSlice";
import { clearNotification, showNotification } from "../features/notifications/notificationSlice";
import { useNavigate, useParams } from "react-router-dom";

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

const UpdatePassword: React.FC = () => {
    const { sessionToken } = useSelector((state: RootState) => state.auth);
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<FormData>({
        url: "",
        username: "",
        password: "",
        note: ""
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [warnings, setWarnings] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const passwordId = Number(id)

    useEffect(() => {
        if (sessionToken && id) {
            dispatch(fetchIndividualPassword({ sessionToken, passwordId }))
                .unwrap()
                .then((data) => {
                    setFormData({
                        url: data.url || "",
                        username: data.username || "",
                        password: data.password || "",
                        note: data.note || ""
                    });
                })
                .catch((error: any) => {
                    console.log(error)
                    dispatch(showNotification('Failed to load password data'));
                });
        }
    }, [sessionToken, id, dispatch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === "password") {
            const newWarnings: FormErrors = {};
            const passwordWarning = validatePassword(e.target.value);
            if (passwordWarning) {
                newWarnings.password = passwordWarning;
            }
            setWarnings(newWarnings); // Set warnings
        }



        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};

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
        }

        if (formData.note.length > 500) {
            newErrors.note = "Note must be 250 characters or less";
        }

        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();



        // Validate form data
        const validationError = validate();
        setErrors(validationError);

        if (Object.keys(validationError).length === 0) {
            setLoading(true);
            try {
                await dispatch(updatePassword({ sessionToken, passwordId, passwordData: formData })).unwrap();
                dispatch(showNotification('Password updated successfully'));
                setWarnings({});
                setTimeout(() => {
                    dispatch(clearNotification());
                }, 3000); // Clear notification after 3 seconds

                // Redirect to the password list page
                navigate('/passwords');
            } catch (error) {
                dispatch(showNotification('Failed to update password'));
            } finally {
                setLoading(false);
            }
        }
    };

    const classes = "text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker";

    return (
        <>
            <h4 className="text-center text-2xl mb-5 ">Update Password</h4>
            <form autoComplete="off" onSubmit={handleSubmit}>
                <div className="form-control mb-4">
                    <label htmlFor="url">Enter your website URL</label>
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
                    <textarea id="note" name="note" onChange={handleTextAreaChange} value={formData.note} className={classes}></textarea>
                    {errors.note && <small className="text-red-500">{errors.note}</small>}
                </div>
                <div className="form-control mb-4">
                    <input
                        type="submit"
                        value={warnings.password ? loading ? "Updating..." : "Ignore suggestion" : loading ? "Updating..." : "Update"}
                        className="text-white cursor-pointer text-base p-4 rounded-md mb-4 transition-colors duration-300 bg-opred hover:bg-opredHover focus:bg-opredHover active:bg-opredHover w-full text-center block"
                    />
                </div>
            </form>
        </>
    );
};

export { UpdatePassword };
