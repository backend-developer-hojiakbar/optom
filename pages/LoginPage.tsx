import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { Lock, Delete } from 'lucide-react';

const LoginPage = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, currentUser } = useAppContext();

    const from = location.state?.from?.pathname || "/";
    
    useEffect(() => {
        if (currentUser) {
            navigate(from, { replace: true });
        }
    }, [currentUser, navigate, from]);

    const handlePinChange = (value: string) => {
        if (pin.length < 4) {
            setPin(pin + value);
            setError('');
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
        setError('');
    };

    const handleClear = () => {
        setPin('');
        setError('');
    };
    
    useEffect(() => {
        const attemptLogin = async () => {
            if (pin.length === 4) {
                setIsLoggingIn(true);
                const success = await login(pin);
                if (success) {
                    navigate(from, { replace: true });
                } else {
                    setError('Noto\'g\'ri PIN-kod kiritildi.');
                    setTimeout(() => {
                        setPin('');
                        setError('');
                    }, 1000);
                }
                setIsLoggingIn(false);
            }
        };
        attemptLogin();
    }, [pin, login, navigate, from]);
    
    const Key = ({ value, onClick }: { value: string, onClick: (v: string) => void }) => (
        <button disabled={isLoggingIn} onClick={() => onClick(value)} className="w-20 h-20 rounded-full bg-white/10 text-white text-3xl font-light hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50">
            {value}
        </button>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <div className="w-full max-w-sm mx-auto text-center">
                <Lock className="w-16 h-16 mx-auto mb-6 text-blue-400"/>
                <h1 className="text-3xl font-bold mb-2">Xush kelibsiz!</h1>
                <p className="text-gray-400 mb-8">Iltimos, tizimga kirish uchun PIN-kodingizni kiriting.</p>

                <div className={`flex justify-center items-center space-x-4 h-16 mb-4 transition-transform duration-300 ${error ? 'animate-shake' : ''}`}>
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} className={`w-8 h-8 rounded-full transition-colors ${error ? 'bg-red-500' : pin.length > i ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                    ))}
                </div>
                 {error && <p className="text-red-400 h-6 mb-4">{error}</p>}
                 {!error && <div className="h-6 mb-4"></div>}

                <div className="grid grid-cols-3 gap-4">
                    <Key value="1" onClick={handlePinChange} />
                    <Key value="2" onClick={handlePinChange} />
                    <Key value="3" onClick={handlePinChange} />
                    <Key value="4" onClick={handlePinChange} />
                    <Key value="5" onClick={handlePinChange} />
                    <Key value="6" onClick={handlePinChange} />
                    <Key value="7" onClick={handlePinChange} />
                    <Key value="8" onClick={handlePinChange} />
                    <Key value="9" onClick={handlePinChange} />
                    <button disabled={isLoggingIn} onClick={handleClear} className="w-20 h-20 rounded-full bg-white/5 text-white text-xl font-light hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50">
                        AC
                    </button>
                    <Key value="0" onClick={handlePinChange} />
                    <button disabled={isLoggingIn} onClick={handleBackspace} className="w-20 h-20 rounded-full bg-white/5 text-white text-3xl font-light hover:bg-white/20 transition-colors flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50">
                        <Delete className="w-8 h-8"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;