import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ChefHat, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface KitchenAuthProps {
    onAuthenticated: () => void;
}

// PIN de acceso - puedes cambiarlo aquí
const KITCHEN_PIN = '1234';

// Clave para localStorage
const AUTH_KEY = 'kitchen_authenticated';
const AUTH_EXPIRY_KEY = 'kitchen_auth_expiry';
const AUTH_DURATION = 8 * 60 * 60 * 1000; // 8 horas en milisegundos

export const KitchenAuth = ({ onAuthenticated }: KitchenAuthProps) => {
    const [pin, setPin] = useState(['', '', '', '']);
    const [showPin, setShowPin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    // Check if already authenticated
    useEffect(() => {
        const isAuth = localStorage.getItem(AUTH_KEY);
        const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);

        if (isAuth === 'true' && expiry) {
            const expiryTime = parseInt(expiry, 10);
            if (Date.now() < expiryTime) {
                onAuthenticated();
            } else {
                // Expired, clear auth
                localStorage.removeItem(AUTH_KEY);
                localStorage.removeItem(AUTH_EXPIRY_KEY);
            }
        }
    }, [onAuthenticated]);

    const handlePinChange = (index: number, value: string) => {
        if (value.length > 1) return;
        if (value && !/^\d$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        setError('');

        // Move to next input
        if (value && index < 3) {
            inputRefs[index + 1].current?.focus();
        }

        // Auto-submit when all digits are entered
        if (value && index === 3) {
            const fullPin = newPin.join('');
            validatePin(fullPin);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const validatePin = (enteredPin: string) => {
        setIsLoading(true);

        // Simular delay para seguridad
        setTimeout(() => {
            if (enteredPin === KITCHEN_PIN) {
                // Save auth to localStorage
                localStorage.setItem(AUTH_KEY, 'true');
                localStorage.setItem(AUTH_EXPIRY_KEY, (Date.now() + AUTH_DURATION).toString());

                toast.success('¡Acceso concedido! 👨‍🍳');
                onAuthenticated();
            } else {
                setError('PIN incorrecto');
                setPin(['', '', '', '']);
                inputRefs[0].current?.focus();
                toast.error('PIN incorrecto');
            }
            setIsLoading(false);
        }, 500);
    };

    const handleSubmit = () => {
        const fullPin = pin.join('');
        if (fullPin.length === 4) {
            validatePin(fullPin);
        } else {
            setError('Ingresa los 4 dígitos');
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm"
            >
                <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                            <ChefHat className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                            Panel de Cocina
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Ingresa el PIN de acceso
                        </p>
                    </div>

                    {/* PIN Input */}
                    <div className="flex justify-center gap-3 mb-6">
                        {pin.map((digit, index) => (
                            <div key={index} className="relative">
                                <Input
                                    ref={inputRefs[index]}
                                    type={showPin ? 'text' : 'password'}
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handlePinChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    disabled={isLoading}
                                    className={`w-14 h-14 text-center text-2xl font-bold rounded-xl ${error ? 'border-destructive' : ''
                                        }`}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Show/Hide PIN */}
                    <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        {showPin ? (
                            <>
                                <EyeOff className="w-4 h-4" />
                                Ocultar PIN
                            </>
                        ) : (
                            <>
                                <Eye className="w-4 h-4" />
                                Mostrar PIN
                            </>
                        )}
                    </button>

                    {/* Error Message */}
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-destructive text-sm text-center mb-4"
                        >
                            {error}
                        </motion.p>
                    )}

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || pin.some((d) => !d)}
                        className="w-full h-12 text-base font-semibold"
                    >
                        {isLoading ? (
                            <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                            />
                        ) : (
                            <>
                                <Lock className="w-4 h-4 mr-2" />
                                Ingresar
                            </>
                        )}
                    </Button>

                    {/* Security Note */}
                    <p className="text-xs text-muted-foreground text-center mt-6">
                        🔒 Acceso restringido solo para personal autorizado
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
