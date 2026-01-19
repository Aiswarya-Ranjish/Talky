import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/common/Authservices";

interface Errors {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errors, setErrors] = useState<Errors>({ email: "", password: "" });
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateEmail = (value: string): string => {
        if (!value) return "* Email is required";
        if (!emailRegex.test(value)) return "* Please enter a valid email address";
        return "";
    };

    const validatePassword = (value: string): string => {
        if (!value) return "* Password is required";
        return "";
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        setEmail(value);
        if (submitted) setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        setPassword(value);
        if (submitted) setErrors(prev => ({ ...prev, password: validatePassword(value) }));
    };

    const handleSubmit = async (e: FormEvent): Promise<void> => {
        e.preventDefault();
        setSubmitted(true);

        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);
        setErrors({ email: emailError, password: passwordError });

        if (!emailError && !passwordError) {
            setIsLoading(true);
            
            try {
                // Call the actual API through AuthService
                const response = await AuthService.login({
                    email: email,
                    password: password
                });

                console.log('Login response:', response);

                // Check if login was successful
                if (response.isSucess && response.value) {
                    toast.success(response.customMessage || "Login successful!");
                    
                    // Clear form
                    setEmail("");
                    setPassword("");
                    setSubmitted(false);
                    
                    // Navigate to dashboard (Dashboard component will handle user data refresh)
                    navigate("/dashboard");
                } else {
                    // Handle unsuccessful login
                    const errorMessage = response.customMessage || response.error || "Invalid email or password";
                    toast.error(errorMessage);
                }
                
            } catch (error: any) {
                console.error('Login error:', error);
                
                // Handle different error scenarios
                let errorMessage = "An error occurred during login. Please try again.";
                
                if (error?.response?.data) {
                    // API returned an error response
                    errorMessage = error.response.data.customMessage 
                        || error.response.data.error 
                        || error.response.data.message
                        || errorMessage;
                } else if (error?.message) {
                    // Network or other error
                    errorMessage = error.message;
                }
                
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const togglePassword = (): void => setShowPassword(!showPassword);

    return (
        <>
            <Container
                fluid
                className="background"
                style={{
                    minHeight: "100vh",
                    background: "linear-gradient(135deg, #882626 0%, #B84C4C 50%, #F2B6B6 100%)",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    paddingTop: "80px"
                }}
            >
                <Row style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <Col xs={12} sm={10} md={6} lg={4}>
                        <form className="form" onSubmit={handleSubmit}>
                            <div className="container shadow border px-5 py-4" style={{ borderRadius: "24px", background: "#FFFFFF", border: "1px solid #E6E6E6" }}>
                                <h1 className="fw-medium text-center fs-3" style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: "30px", color: "#882626" }}>
                                    Welcome Back
                                </h1>
                                <p className="text-center mt-1" style={{ color: "#555", fontFamily: "Urbanist", fontSize: "14px" }}>
                                    Sign in to continue
                                </p>

                                {/* Email Field */}
                                <div className="d-grid gap-2 mb-2 mt-4">
                                    <label style={{ fontFamily: "Urbanist", color: "#A6A6A6", fontSize: "15px" }}>
                                        Email
                                    </label>
                                </div>

                                <div className="d-grid gap-2 mb-2">
                                    <input 
                                        type="text" 
                                        className={`p-2 rounded-2 border ${errors.email ? "border-danger" : ""}`} 
                                        value={email} 
                                        onChange={handleEmailChange}
                                        placeholder="Enter your email"
                                        disabled={isLoading}
                                        autoComplete="email"
                                    />
                                    {submitted && errors.email && (
                                        <span className="text-danger" style={{ fontFamily: "Urbanist", fontSize: "13px" }}>
                                            {errors.email}
                                        </span>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className="d-grid gap-2 mb-2">
                                    <label style={{ fontFamily: "Urbanist", color: "#A6A6A6", fontSize: "15px" }}>
                                        Password
                                    </label>
                                </div>

                                <div className="d-grid gap-2 mb-2">
                                    <div className="d-grid gap-2 mb-1" style={{ position: "relative" }}>
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            className={`p-2 rounded-2 border ${errors.password ? "border-danger" : ""}`} 
                                            value={password} 
                                            onChange={handlePasswordChange}
                                            placeholder="Enter your password"
                                            disabled={isLoading}
                                            autoComplete="current-password"
                                        />
                                        <span 
                                            onClick={togglePassword} 
                                            style={{ 
                                                position: "absolute", 
                                                right: "10px", 
                                                top: "50%", 
                                                transform: "translateY(-50%)", 
                                                cursor: isLoading ? "not-allowed" : "pointer", 
                                                fontSize: "20px", 
                                                color: "#882626",
                                                pointerEvents: isLoading ? "none" : "auto"
                                            }}
                                        >
                                            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                                        </span>
                                    </div>
                                    {submitted && errors.password && (
                                        <span className="text-danger" style={{ fontFamily: "Urbanist", fontSize: "13px" }}>
                                            {errors.password}
                                        </span>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="d-grid gap-2">
                                    <button 
                                        className="rounded-3 p-2 border-0" 
                                        type="submit" 
                                        disabled={isLoading} 
                                        style={{ 
                                            backgroundColor: "#882626", 
                                            fontFamily: "Urbanist", 
                                            fontSize: "16px", 
                                            color: "#FFFFFF", 
                                            fontWeight: 800, 
                                            opacity: isLoading ? 0.7 : 1, 
                                            cursor: isLoading ? "not-allowed" : "pointer", 
                                            transition: "all 0.3s ease" 
                                        }}
                                    >
                                        {isLoading ? "Logging in..." : "Log in"}
                                    </button>
                                </div>

                                {/* Terms and Conditions */}
                                <div className="d-grid gap-2">
                                    <p className="text-dark fw-medium mt-2 mb-0" style={{ fontFamily: "Urbanist", fontSize: "10px" }}>
                                        By continuing you agree to the{" "}
                                        <span className="text-decoration-underline" style={{ cursor: "pointer" }}>
                                            Terms of use
                                        </span>{" "}
                                        and{" "}
                                        <span className="text-decoration-underline" style={{ cursor: "pointer" }}>
                                            Privacy Policy
                                        </span>.
                                    </p>
                                </div>

                                {/* Forgot Password Link */}
                                <div className="d-grid gap-2">
                                    <p className="text-end mb-0">
                                        <span 
                                            onClick={() => !isLoading && navigate("/forgot-password")} 
                                            className="fw-bold text-end text-decoration-underline" 
                                            style={{ 
                                                fontFamily: "Urbanist", 
                                                fontSize: "12px", 
                                                cursor: isLoading ? "not-allowed" : "pointer", 
                                                color: "#882626",
                                                opacity: isLoading ? 0.6 : 1
                                            }}
                                        >
                                            Forgot your password?
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </form>
                    </Col>
                </Row>
                <Toaster position="top-right" reverseOrder={false} />
            </Container>
        </>
    );
};

export default Login;