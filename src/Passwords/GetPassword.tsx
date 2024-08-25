import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../app/store";
import { useDispatch, useSelector } from "react-redux";
import { deletePassword, fetchIndividualPassword } from "../features/passwords/passwordSlice";
import { clearNotification, showNotification } from "../features/notifications/notificationSlice";

const GetPassword: React.FC = () => {
    const { id } = useParams();
    const dispatch: AppDispatch = useDispatch();
    const { isLoggedIn, sessionToken } = useSelector((state: RootState) => state.auth);
    const { passwords, error } = useSelector((state: RootState) => state.passwords);
    const passwordId = Number(id);

    useEffect(() => {
        if (isLoggedIn && sessionToken) {
            dispatch(fetchIndividualPassword({ sessionToken, passwordId }));
        }
    }, [isLoggedIn]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (passwords.length === 0) {
        return <div>No passwords found.</div>;
    }

    let currentIndex = passwords.findIndex((p) => Number(p.id) === passwordId);
    const currentPassword = passwords[currentIndex];

    const navigate = useNavigate();


    if (!currentPassword) {
        navigate('/passwords');
    }


    const deleteHandler = async () => {
        console.log("From Get Password Page:", passwordId);
        await dispatch(deletePassword({ sessionToken, passwordId })).then((result) => {

            if (result.meta.requestStatus === "fulfilled") {
                dispatch(showNotification(`${currentPassword.url} is deleted successfully`));

                setTimeout(() => {
                    dispatch(clearNotification());
                }, 3000); // Clear notification after 3 seconds

            }
        });

        console.log("password deleted")
    }

    return (
        <>
            <h1>Get Password: {id}</h1>
            <div>
                <ul>
                    {Object.entries(currentPassword).map(([key, value]) => (
                        value ?
                            <li key={key}>
                                {key.replace('_', ' ')}: {String(value)}
                            </li> : ""
                    ))}
                </ul>
                <hr className="mb-4" />
                <div className="flex justify-between">
                    <Link className="text-opred" to={`/passwords/edit/${id}`}>Edit</Link>
                    <button className="text-opred" onClick={deleteHandler}>Delete</button>
                </div>
            </div>
        </>
    );
};

export { GetPassword };
