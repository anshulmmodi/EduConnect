import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/CreateClassroom.css'
function CreateClassroom() {
    const [formData, setFormData] = useState({
        name: "",
        roomCode: "",
        description: "",
        teacher: "",
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Function to navigate back to /teacher
    const handleBack = () => {
        navigate("/teacher");
    };

    // Function to get the cookie
    const getCookie = (name) => {
        const cookieName = `${name}=`;
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookies = decodedCookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
        return null;
    };

    useEffect(() => {
        const fetchData = async () => {
            const teacherId = getCookie('userId'); // Adjust the cookie name if necessary
            console.log("Fetched Teacher ID:", teacherId); // Log for debugging

            if (teacherId) {
                setFormData(prevData => ({
                    ...prevData,
                    teacher: teacherId,
                }));
            } else {
                console.error("Teacher ID not found or invalid.");
                setError("Teacher ID not found. Please log in.");
                navigate("/teacher");
            }
        };

        fetchData();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.description.length > 100) {
            setError("Description cannot exceed 100 characters.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post("http://localhost:8000/create_classroom/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.data.success) {
                navigate("/teacher");
            } else {
                setError(response.data.error || "An error occurred while creating the classroom.");
            }
        } catch (err) {
            // Log full error object
            console.error("Error creating classroom:", err);

            // Display detailed error message
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("An error occurred while creating the classroom.");
            }
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="create-classroom">
            <button className="back-button" onClick={handleBack}>Back to Teacher</button>
            <div className="create-classroom-container">
                <h1>Create Classroom</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name">Classroom Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="roomCode">Room Code:</label>
                        <input
                            type="text"
                            id="roomCode"
                            name="roomCode"
                            value={formData.roomCode}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description">Description:</label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            maxLength={100}
                            required
                        />
                    </div>

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Classroom"}
                    </button>
                </form>

            </div>
        </div>
    );
}

export default CreateClassroom;
