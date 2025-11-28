import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { register } = useAuth(); // Use global auth context

    const { username, email, password, confirmPassword } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            await register(formData);
            toast.success('Account created successfully!');
            // Successful registration updates global state via context
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full space-y-8 bg-surface p-8 rounded-xl border border-secondary/20 shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
                            Sign in
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-secondary/30 bg-background placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                                placeholder="Username"
                                value={username}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-secondary/30 bg-background placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={onChange}
                            />
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-secondary/30 bg-background placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm pr-10"
                                placeholder="Password"
                                value={password}
                                onChange={onChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="relative">
                            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-secondary/30 bg-background placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm pr-10"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={onChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                                    Creating account...
                                </>
                            ) : (
                                'Sign up'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;