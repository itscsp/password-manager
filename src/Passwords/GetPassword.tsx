import React, { useEffect } from "react"
import { Link, useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../app/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchIndividualPassword } from "../features/passwords/passwordSlice";

const GetPassword: React.FC = () => {
    const { id } = useParams();

    const dispatch: AppDispatch = useDispatch()
    const { isLoggedIn, token, sessionToken } = useSelector((state: RootState) => state.auth);
    const { passwords, error } = useSelector((state: RootState) => state.passwords);
    const passwordId = Number(id)
    // debugger;
    useEffect(() => {
        if (isLoggedIn && token && sessionToken) {
            dispatch(fetchIndividualPassword({ sessionToken, passwordId }));
        }
    }, [isLoggedIn]);

    if (error) {
        return <div>Error: {error}</div>
    }

    if (passwords.length === 0) {
        return <div>No passwords found.</div>;
    }

    console.log(passwords)

    let currentIndex = passwords.findIndex((p) => Number(p.id) === passwordId)

    return (
        <>
            <h1>Get Password: {id}</h1>
            <div>
                <ul>
                    <li>URL:   {passwords[currentIndex].url}</li>
                    <li>Usern ame:   {passwords[currentIndex].username}</li>
                    <li>Password:   {passwords[currentIndex].password}</li>
                    <li>Note:   {passwords[currentIndex].note}</li>
                    <li>Created Date: {passwords[currentIndex].created_at}</li>
                    <li>Updated Date: {passwords[currentIndex].updated_at}</li>
                </ul>
                <hr className="mb-4" />
                <div className="flex justify-between">
                    <Link className="text-opred" to={`/passwords/edit/${id}`}>Edit</Link>
                    <Link className="text-opred" to={`/delete/${id}`}>Delete</Link>
                </div>

            </div>
        </>
    )
}

export { GetPassword }