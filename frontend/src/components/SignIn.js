import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import '../styles/Auth.css'; // Ensure you create this CSS file to style the components

function SignIn() {
  const [user, setUserDetails] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUserDetails({ ...user, [name]: value });
  };

  const loginHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8000/sign_in/", user);
      const data = res.data;

      if (data.success) {
        const userId = data.user_id;
        const userRole = data.role; // Assuming your backend sends the role in the response

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        // Setting cookie with userId
        document.cookie = `userId=${userId}; expires=${expiryDate.toUTCString()}; path=/; secure; SameSite=Lax`;

        // Conditional navigation based on user role
        if (userRole === "Teacher") {
          navigate('/teacher');
        } else if (userRole === "Student") {
          navigate('/student');
        } else {
          console.error("Unknown role:", userRole);
        }
      } else {
        setFormErrors(data);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setFormErrors({ message: 'Incorrect Email or Password. Try Again!' });
    }
  };

  const handleSignUp = () => {
    navigate('/sign_up');
  };

  return (
    <div className="auth-container">
      <div className="container ">
        <div className="form-container sign-in-container">
          <form>
            <h1>Sign In</h1>
            <div className="account-input">
              <i className="far fa-envelope" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={changeHandler}
                value={user.email}
              />
            </div>
            <div className="account-input">
              <i className="fas fa-lock" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={changeHandler}
                value={user.password}
              />
            </div>
            <button
              type="submit"
              className="signIn-form-button"
              onClick={loginHandler}
            >
              Sign In
            </button>
            {formErrors.message && <p className="error">{formErrors.message}</p>}
          </form>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div class="square"></div>
            <div class="triangle"></div>
            <div class="circle"></div>
            <div class="square2"></div>
            <div class="triangle2"></div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start your journey with us</p>
              <button className="ghost" onClick={handleSignUp}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
