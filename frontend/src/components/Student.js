import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import StudentNavbar from "./StudentNavbar";
import '../styles/Student.css'
import clasroom1 from '../images/classroom1.jpeg'
import clasroom2 from '../images/classroom2.jpeg'
import clasroom3 from '../images/classroom3.jpg'
import classroom4 from '../images/classroom4.jpg'
import classroom5 from '../images/classroom5.jpg'

function Student() {
    const [data, setData] = useState(null);
    const [roomCode, setRoomCode] = useState('');
    const [message, setMessage] = useState('');
    const [joinedClassrooms, setJoinedClassrooms] = useState([]);
    const navigate = useNavigate();

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

    // Fetch user data and joined classrooms when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            const userId = getCookie('userId');
            if (userId) {
                try {
                    // Fetch user data
                    const userResponse = await axios.post("http://localhost:8000/get_user_data/", { user_id: userId });
                    if (userResponse.data.user) {
                        setData(userResponse.data.user);
                    }

                    // Fetch classrooms joined by the student
                    const classroomsResponse = await axios.post("http://localhost:8000/get_joined_classrooms/", { student_id: userId });
                    if (classroomsResponse.data.classrooms) {
                        setJoinedClassrooms(classroomsResponse.data.classrooms);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                    setData(null);
                    setJoinedClassrooms([]);
                    navigate("/sign_in");
                }
            } else {
                setData(null);
                setJoinedClassrooms([]);
                navigate("/sign_in");
            }
        };

        fetchData();
    }, [navigate]);

    // Handle joining a classroom
    const handleJoinClassroom = async () => {
        const userId = getCookie('userId');
        if (userId && roomCode) {
            try {
                const response = await axios.post("http://localhost:8000/join_classroom/", {
                    student_id: userId,
                    room_code: roomCode,
                });
                setMessage(response.data.message);

                if (response.data.message.includes("Successfully")) {
                    // Directly add new classroom to joinedClassrooms after joining
                    setJoinedClassrooms((prevClassrooms) => [
                        ...prevClassrooms,
                        { classroom_id: response.data.classroom_id, name: response.data.classroom_name, description: response.data.classroom_description, joined_at: new Date().toISOString() },
                    ]);
                }
            } catch (error) {
                setMessage(`Error: ${error.response ? error.response.data.error : error.message}`);
            }
        } else {
            setMessage("Please enter a room code.");
        }
    };

    return (
        <>
            <StudentNavbar />
            <div className="student">
                {data ? (
                    <div>
                        <h2 className="title">Welcome, {data.fname}</h2>

                        <div className="input-container">
                            <input
                                type="text"
                                placeholder="Enter Room Code"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                            />
                            <button onClick={handleJoinClassroom}>Join Room</button>
                            {message && <p>{message}</p>}
                        </div>

                        {joinedClassrooms.length > 0 && (
                            <div>
                                <h3>Your Joined Classrooms:</h3>
                                <ul>
                                    {joinedClassrooms.map((classroom, index) => {
                                    const backgroundColors = [ "#4A90E2", "#7F8C8D","#2ECC71" , "#F39C12","#E67E22"];
                                    const classrooms_img = [clasroom1,clasroom2,clasroom3,classroom4,classroom5]
                                    
                                    const bgColor = backgroundColors[index % backgroundColors.length]; 
                                    const clasroom_img = classrooms_img[index % classrooms_img.length]
                                    return (
                                        <li key={classroom.classroom_id}>
                                            <Link to={`/student_classroom/${classroom.classroom_id}`}>
                                                <div className="classroom-partition"style={{ backgroundColor: bgColor }}>
                                                    <h4>{classroom.name}</h4>
                                                </div>
                                                 <img src={clasroom_img} alt="class-img" className="classroom-img"/>
                                                <i className="fas fa-external-link-alt icon-right-bottom"></i>
                                            </Link>
                                        </li>
                                    );
                                })}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div >
        </>
    );
}

export default Student;
