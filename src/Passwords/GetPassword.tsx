import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../app/store";
import { useDispatch, useSelector } from "react-redux";
import { deletePassword, fetchIndividualPassword } from "../features/passwords/passwordSlice";
import { clearNotification, showNotification } from "../features/notifications/notificationSlice";
import Loading from "../_components/Loading";

const GetPassword: React.FC = () => {
    const { id } = useParams();
    const dispatch: AppDispatch = useDispatch();
    const { isLoggedIn, sessionToken } = useSelector((state: RootState) => state.auth);
    const { passwords, error, loading } = useSelector((state: RootState) => state.passwords);
    const passwordId = Number(id);

    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn && sessionToken) {
            dispatch(fetchIndividualPassword({ sessionToken, passwordId }));
        }
    }, [isLoggedIn, dispatch, sessionToken, passwordId]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (loading) {
        return <Loading />;
    }

    if (passwords.length === 0) {
        return <div>No passwords found.</div>;
    }

    const currentIndex = passwords.findIndex((p) => Number(p.id) === passwordId);
    const currentPassword = passwords[currentIndex];

    if (!currentPassword) {
        return <div>Password not found.</div>; // Handle case where password is deleted or not found
    }

    const deleteHandler = async () => {
        console.log("From Get Password Page:", passwordId);
        const result = await dispatch(deletePassword({ sessionToken, passwordId }));

        if (result.meta.requestStatus === "fulfilled") {
            dispatch(showNotification(`${currentPassword.url} was deleted successfully`));

            setTimeout(() => {
                dispatch(clearNotification());
            }, 3000); // Clear notification after 3 seconds

            navigate('/passwords'); // Navigate away after deletion to avoid accessing deleted data
        } else {
            dispatch(showNotification("Failed to delete password."));
            setTimeout(() => {
                dispatch(clearNotification());
            }, 3000);
        }
    };

    return (
        <>
            <h1>Get Password: {id}</h1>
            <div>
                <ul>
                    {Object.entries(currentPassword).map(([key, value]) => (
                        value ?
                            <li key={key}>
                                {key.replace('_', ' ')}: {String(value)}
                            </li> : null
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
