import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../app/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchIndividualPassword } from "../features/passwords/passwordSlice";

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

    if (!currentPassword) {
        return <div>Password not found.</div>;
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
                    <Link className="text-opred" to={`/delete/${id}`}>Delete</Link>
                </div>
            </div>
        </>
    );
};

export { GetPassword };
