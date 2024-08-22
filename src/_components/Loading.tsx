import React from 'react';
import logo from '../assets/onepass_logo.svg';

const Loading: React.FC = () => {
    return (
        <div className="loading-screen">
            <img src={logo} alt="Loading..." className="w-[125px] h-auto loading-image animate-growShrink" />
        </div>
    );
};

export default Loading;
