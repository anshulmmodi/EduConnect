import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/StudentAssignments.css'

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const navigate = useNavigate();

    // Function to get the cookie
    const getCookie = (name) => {
        const cookieName = `${name}=`;
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookies = decodedCookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
        return null;
    };

    useEffect(() => {
        const userId = getCookie('userId');
        
        if (userId) {
            axios.post('http://localhost:8000/get_student_assignments/', { student_id: userId })
                .then(response => {
                    setAssignments(response.data.assignments);
                })
                .catch(error => console.error('Error fetching assignments:', error));
        } else {
            navigate('/sign_in'); 
        }
    }, [navigate]);

    return (
        <div className='student-assignments'>
            <Link to="/student" className="back-to-teachers-button">Back to Dashboard</Link>
            <h1>Your Assignments</h1>
            <ul>
                {assignments.length > 0 ? (
                    assignments.map(assignment => (
                        <Link to={`/student/assignments/${assignment.assignment_id}`}>
                        <li key={assignment._id}>
                                <h2>{assignment.title}</h2>
                            <p>Classroom: {assignment.classroom_name}</p>
                        </li>
                        </Link>
                    ))
                ) : (
                    <p>No assignments found for your classrooms.</p>
                )}
            </ul>
        </div>
    );
};

export default StudentAssignments;
