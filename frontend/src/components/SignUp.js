import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import '../styles/Auth.css';

function SignUp() {
    const [formErrors, setFormErrors] = useState({});
    const [user, setUserDetails] = useState({
        fname: "",
        lname: "",
        email: "",
        role: "",
        password: "",
        cpassword: "",
    });

    const navigate = useNavigate();

    const handleSignInClick = () => {
        navigate('/sign_in');
    };

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setUserDetails({ ...user, [name]: value });
    };

    const roleChangeHandler = (e) => {
        setUserDetails({ ...user, role: e.target.value });
    };

    const validateEmail = (email) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6; 
    };

    const signupHandler = async (e) => {
        e.preventDefault();
        setFormErrors({}); 
        if (!validateEmail(user.email)) {
            setFormErrors((prev) => ({ ...prev, email: "Invalid email format." }));
            return;
        }

        if (!validatePassword(user.password)) {
            setFormErrors((prev) => ({ ...prev, password: "Password must be at least 6 characters." }));
            return;
        }

        if (user.password !== user.cpassword) {
            setFormErrors((prev) => ({ ...prev, cpassword: "Passwords do not match." }));
            return;
        }

        try {
            const res = await axios.post("http://localhost:8000/sign_up/", user);
            const data = res.data;

            if (data.success) {
                const userId = data.user_id;
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);
                document.cookie = `userId=${userId}; expires=${expiryDate.toUTCString()}; path=/; secure; SameSite=Lax`;
                navigate('/');
            } else {
                setFormErrors(data);
            }
        } catch (error) {
            console.error('Error signing up:', error);
            setFormErrors({ message: 'An error occurred. Please try again.' });
        }
    };

    return (
        <div className="auth-container">
            <div className="container right-panel-active">
                <div className="form-container sign-up-container">
                    <form onSubmit={signupHandler}>
                        <h1>Create Account</h1>
                        <div className="account-input">
                            <i className="far fa-user" />
                            <input
                                type="text"
                                name="fname"
                                placeholder="First Name"
                                value={user.fname}
                                onChange={changeHandler}
                            />
                        </div>
                        <div className="account-input">
                            <i className="far fa-user" />
                            <input
                                type="text"
                                name="lname"
                                placeholder="Last Name"
                                value={user.lname}
                                onChange={changeHandler}
                            />
                        </div>
                        <div className="account-input">
                            <i className="far fa-envelope" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={user.email}
                                onChange={changeHandler}
                            />
                            {formErrors.email && <p className="error">{formErrors.email}</p>}
                        </div>
                        <label>Role</label>
                        <div className="account-input">
                            <input
                                type="radio"
                                name="role"
                                id="teacher"
                                value="Teacher"
                                checked={user.role === 'Teacher'}
                                onChange={roleChangeHandler}
                            />
                            <label htmlFor="teacher">Teacher</label>
                            <input
                                type="radio"
                                name="role"
                                id="student"
                                value="Student"
                                checked={user.role === 'Student'}
                                onChange={roleChangeHandler}
                            />
                            <label htmlFor="student">Student</label>
                        </div>
                        <div className="account-input">
                            <i className="fas fa-lock" />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={user.password}
                                onChange={changeHandler}
                            />
                            {formErrors.password && <p className="error">{formErrors.password}</p>}
                        </div>
                        <div className="account-input">
                            <i className="fas fa-lock" />
                            <input
                                type="password"
                                name="cpassword"
                                placeholder="Confirm Password"
                                value={user.cpassword}
                                onChange={changeHandler}
                            />
                            {formErrors.cpassword && <p className="error">{formErrors.cpassword}</p>}
                        </div>
                        <button className="mt-3">Sign Up</button>
                        {formErrors.message && <p className="error">{formErrors.message}</p>}
                    </form>
                </div>
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="square" />
                        <div className="triangle" />
                        <div className="circle" />
                        <div className="square2" />
                        <div className="triangle2" />
                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login with your personal info</p>
                            <button className="ghost" id="signIn" onClick={handleSignInClick}>
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
