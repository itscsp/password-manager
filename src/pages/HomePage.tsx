import React from 'react';
import Button from '../components/Button';

const HomePage: React.FC = () => {
    return (
        <div className="container">
            <div className="shadow-lg ">
                <div className="bg-black rounded-lg  p-6  flex flex-col items-center justify-center h-full w-96 m-auto">
                    {/* Login Button */}
                    <Button
                        text="Login"
                        url="/login"
                        variation="primary"
                        size="block"
                    />

                    {/* Create An Account Button */}
                    <Button
                        text="Create An Account"
                        url="/signup"
                        variation="secondary"
                        size="block"
                    />

                    {/* Generate Password Button */}
                    <Button
                        text="Generate Password"
                        url="/generate-password"
                        variation="primary"
                        size="block"
                    />
                </div>
            </div>
        </div>
    );
}

export default HomePage;
