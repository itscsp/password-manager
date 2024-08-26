import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store'; // Adjust the path accordingly
import { fetchPasswords } from '../features/passwords/passwordSlice'; // Adjust the path accordingly
import { Link, useNavigate } from 'react-router-dom';
import Loading from '../_components/Loading';


export { GetPasswords };


const GetPasswords: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const { isLoggedIn, sessionToken } = useSelector((state: RootState) => state.auth);
    const { passwords, loading } = useSelector((state: RootState) => state.passwords);
    const elementkey = Math.random();
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
            <div className="flex justify-between mb-8">
                <h1 className='text-[20px]'>Passwords</h1>
                <Link to={"/passwords/add"} aria-label='add password' className='hover:bg-gray-600 p-3 rounded-full'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <path d="M8.65385 1.15385C8.65385 0.515625 8.13822 0 7.5 0C6.86178 0 6.34615 0.515625 6.34615 1.15385V6.34615H1.15385C0.515625 6.34615 0 6.86178 0 7.5C0 8.13822 0.515625 8.65385 1.15385 8.65385H6.34615V13.8462C6.34615 14.4844 6.86178 15 7.5 15C8.13822 15 8.65385 14.4844 8.65385 13.8462V8.65385H13.8462C14.4844 8.65385 15 8.13822 15 7.5C15 6.86178 14.4844 6.34615 13.8462 6.34615H8.65385V1.15385Z" fill="white" />
                    </svg>
                </Link>
            </div>
            {loading && <Loading />}
            {!loading &&
                <ul key={elementkey}>

                    {passwords.map((password: any) => (
                        <li key={password.id} className='bg-opblack400 mb-4 rounded-md'>
                            <Link to={`./${password.id}`} className='p-[10px] block'>
                                <div className="card flex gap-4">
                                    <div className="thumbnail bg-black p-1.5 rounded-full">
                                        <svg stroke="currentColor" fill="#000" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="28px" width="28px" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 7a9 9 0 0 0 -7.5 -4a8.991 8.991 0 0 0 -7.484 4"></path><path d="M11.5 3a16.989 16.989 0 0 0 -1.826 4"></path><path d="M12.5 3a16.989 16.989 0 0 1 1.828 4"></path><path d="M19.5 17a9 9 0 0 1 -7.5 4a8.991 8.991 0 0 1 -7.484 -4"></path><path d="M11.5 21a16.989 16.989 0 0 1 -1.826 -4"></path><path d="M12.5 21a16.989 16.989 0 0 0 1.828 -4"></path><path d="M2 10l1 4l1.5 -4l1.5 4l1 -4"></path><path d="M17 10l1 4l1.5 -4l1.5 4l1 -4"></path><path d="M9.5 10l1 4l1.5 -4l1.5 4l1 -4"></path></svg>
                                    </div>
                                    <div className="flex-1  content flex justify-between align-middle">
                                        <div>

                                            <p>{password.url}</p>
                                            <small className='block text-gray-400'>{password.username}</small>
                                        </div>
                                        <div>

                                            <div className='hover:bg-gray-600 p-3 rounded-full'>
                                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="15px" width="15px" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            }
        </>
    )
}

