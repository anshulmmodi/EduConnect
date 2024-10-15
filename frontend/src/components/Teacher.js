import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import TeacherNavbar from "./TeacherNavbar";
import '../styles/Teacher.css'; // Import the CSS file for styling
import clasroom1 from '../images/classroom1.jpeg'
import clasroom2 from '../images/classroom2.jpeg'
import clasroom3 from '../images/classroom3.jpg'
import classroom4 from '../images/classroom4.jpg'
import classroom5 from '../images/classroom5.jpg'

function Teacher() {
    const[user_id,setuser] = useState("")
    const [data, setData] = useState(null);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        const fetchData = async () => {
            const userId = getCookie('userId');
            setuser(userId)
            if (userId) {
                try {
                    // Fetch user data
                    const userResponse = await axios.post("http://localhost:8000/get_user_data/", { user_id: userId });
                    if (userResponse.data.user) {
                        setData(userResponse.data.user);
                    }

                    // Fetch classrooms created by the teacher
                    const classroomsResponse = await axios.post("http://localhost:8000/get_teacher_data/", { user_id: userId });
                    if (classroomsResponse.data.classrooms) {
                        setClassrooms(classroomsResponse.data.classrooms);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                    setData(null);
                    setClassrooms([]);
                }
            } else {
                setData(null);
                setClassrooms([]);
            }
            setLoading(false);  // Data fetching is complete
        };

        fetchData();
    }, [navigate]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <TeacherNavbar />
            <div className="teacher">
                {data ? (
                    <>
                        <h2 className="title">Welcome, {data.fname}</h2>
                        <h3 class="your-classrooms">Your Classrooms</h3>
                        {classrooms.length > 0 ? (
                            <ul>
                                {classrooms.map((classroom, index) => {
                                    const backgroundColors = [ "#4A90E2", "#7F8C8D ","#2ECC71" , "#F39C12 ","#E67E22"];
                                    const classrooms_img = [clasroom1,clasroom2,clasroom3,classroom4,classroom5]
                                    
                                    const bgColor = backgroundColors[index % backgroundColors.length]; 
                                    const clasroom_img = classrooms_img[index % classrooms_img.length]
                                    return (
                                        <li key={classroom.classroom_id}>
                                            <Link to={`/teacher_classroom/${classroom.classroom_id}`}>
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
                        ) : (
                            <p>You haven't created any classrooms yet.</p>
                        )}
                    </>
                ) : (
                    <p>No user data found.</p>
                )}
            </div>
        </>
    );
}

export default Teacher;