import React from 'react';
import Button from '../components/Button';

const HomePage: React.FC = () => {
    return (
        <div className="container">
                <div className="bg-[#181818] p-6 rounded-lg shadow-lg">
            <div className="flex flex-col items-center justify-center h-full w-96">
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
