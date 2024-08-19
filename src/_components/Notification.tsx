import { useSelector } from 'react-redux';
import { RootState } from '../app/store';


export { Notification };

const Notification: React.FC = () => {


    const notifications = useSelector((state: RootState) => state.notifications.message);


    if (!notifications) return (<div className="min-h-6"></div>);
    return (
        <div className="min-h-6">

            <p className="flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5.90909 13.8182L6.09091 8.81818L1.86364 11.5L0.772727 9.59091L5.22727 7.27273L0.772727 4.95454L1.86364 3.04545L6.09091 5.72727L5.90909 0.727272H8.09091L7.90909 5.72727L12.1364 3.04545L13.2273 4.95454L8.77273 7.27273L13.2273 9.59091L12.1364 11.5L7.90909 8.81818L8.09091 13.8182H5.90909Z" fill="#D71340" />
            </svg>
                <span>
                    {notifications}
                </span>
            </p>

        </div>
    );
}
