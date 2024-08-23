import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store'; // Adjust the path accordingly
import { fetchPasswords } from '../features/passwords/passwordSlice'; // Adjust the path accordingly
import { Link, useNavigate } from 'react-router-dom';


export { GetPasswords };


const GetPasswords: React.FC = () => {


    const dispatch: AppDispatch = useDispatch();
    const { isLoggedIn, sessionToken } = useSelector((state: RootState) => state.auth);
    const { passwords } = useSelector((state: RootState) => state.passwords);
    // debugger;
    useEffect(() => {
        if (isLoggedIn && sessionToken) {
            dispatch(fetchPasswords({ sessionToken }));
        }
    }, [isLoggedIn]); // Add dependencies here

    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);





    return (
        <>

            <h1>Your Passwords</h1>
            <ul>
                {passwords.map((password: any) => (
                    <li key={password.id}>
                        <Link to={`./${password.id}`}>
                            {password.url}
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    )
}

