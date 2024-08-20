import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Button } from "./";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../app/store';
import { showNotification, clearNotification } from '../features/notifications/notificationSlice';

const GeneratePass: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const [password, setPassword] = useState('');
    const [length, setLength] = useState(15);
    const [strength, setStrength] = useState(6);
    const [copied, setCopied] = useState(false);
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
    });

    const generatePassword = () => {
        if (!isAnyOptionSelected()) return;

        const { uppercase, lowercase, numbers, symbols } = options;
        const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
        const numberChars = '0123456789';
        const symbolChars = '!@$%^()_+?,/';

        let availableChars = '';
        if (uppercase) availableChars += upperChars;
        if (lowercase) availableChars += lowerChars;
        if (numbers) availableChars += numberChars;
        if (symbols) availableChars += symbolChars;

        let generatedPassword = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * availableChars.length);
            generatedPassword += availableChars[randomIndex];
        }

        setPassword(generatedPassword);
        calculateStrength(generatedPassword);
    };

    const calculateStrength = (password: string) => {
        let score = 0;

        if (/[A-Z]/.test(password)) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;

        setStrength(score);
    };

    const isAnyOptionSelected = () => {
     
        if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
            dispatch(showNotification("No options selected."));
            return false;
        }
        return true;
    };

    const handleCopy = () => {
        dispatch(clearNotification());
        navigator.clipboard.writeText(password);
        setCopied(true);
        dispatch(showNotification("Password copied to clipboard!"));

        setTimeout(() => {
            setCopied(false);
            dispatch(clearNotification());
        }, 2500);
    };

    const getStrengthBarColor = () => {
        switch (strength) {
            case 7:
                return 'bg-green-500';
            case 6:
            case 5:
                return 'bg-yellow-500';
            case 4:
            case 3:
                return 'bg-orange-500';
            default:
                return 'bg-red-500';
        }
    };

    const handleOption = (option: string) => {
        dispatch(clearNotification());
        setOptions({ ...options, [option]: !options[option as keyof typeof options] });
    };

    useEffect(() => {
        generatePassword();
    }, [options, length]);

    return (
        <div className="flex items-center justify-center">
            <div className="md:p-6 py-6 px-4 bg-black rounded-lg shadow-lg text-white max-w-lg w-full">
                <h1 className="text-2xl font-bold mb-8 text-center"><span className="text-red-500 font-saira">OnePass</span> Password Generator</h1>
                <div className="bg-gray-900 rounded-tl-lg rounded-tr-lg mb-4">
                    <p className="text-xl font-mono text-center p-4 pb-2">{password || "***************"}</p>
                    <div className="h-1 mt-2 overflow-hidden bg-gray-700">
                        <div className={clsx('h-full', getStrengthBarColor())} style={{ width: `${(strength / 7) * 100}%` }}></div>
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-lg mb-6">Customize Your Password</label>
                    <div className='flex flex-col gap-4'>
                        <div className='flex gap-5'>
                            <div className="text-center mt-2 py-2 px-4 text-2xl bg-[#121212] rounded">{length}</div>
                            <input
                                type="range"
                                min="8"
                                max="20"
                                value={length}
                                onChange={(e) => setLength(Number(e.target.value))}
                                className="w-full mt-2"
                            />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:gap-4 gap-x-2 gap-y-4 mt-8 mb-8 px-4 py-7 bg-[#121212] rounded-xl">
                    {Object.keys(options).map((option) => (
                        <div key={option}>
                            <input
                                type="checkbox"
                                id={`op-pg_${option}`}
                                checked={options[option as keyof typeof options]}
                                onChange={() => handleOption(option)}
                                className="hidden op-checkbox__input"
                            />
                            <label htmlFor={`op-pg_${option}`} className="flex items-center cursor-pointer p-3">
                                <span className="ml-2 uppercase font-inter md:text-base text-sm">{option}</span>
                            </label>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4">
                    <Button
                        text="Generate"
                        url="#"
                        variation="primary"
                        size="block"
                        onClick={generatePassword}
                        disabled={!isAnyOptionSelected()}
                    />
                    <Button
                        text={copied ? "Copied" : "Copy"}
                        url="#"
                        variation="secondary"
                        size="block"
                        onClick={password ? handleCopy : undefined}
                        disabled={!password}
                    />
                </div>
            </div>
        </div>
    );
};

export { GeneratePass };
