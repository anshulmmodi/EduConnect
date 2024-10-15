import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/AssignmentsList.css'; // Import the CSS file

const AssignmentsList = () => {
    const [assignments, setAssignments] = useState([]);

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

    const userId = getCookie('userId');

    useEffect(() => {
        axios.post('http://localhost:8000/get_assignments/', { user_id: userId })
            .then(response => {
                setAssignments(response.data.assignments);
            })
            .catch(error => console.error('Error fetching assignments:', error));
    }, [userId]);

    return (
        <div>
            {/* Back to Teachers button */}
            <Link to="/teacher" className="back-to-teachers-button">Back to Teachers</Link>

            {/* Assignments container */}
            <div className="assignments-container">
                <h1 className="assignments-header">Assignments</h1>
                <Link to="/teacher/assignments/create" className="create-assignment-button">
                    Create New Assignment
                </Link>
                <ul className="assignments-list">
                    {assignments.length > 0 ? (
                        assignments.map(assignment => (
                            <Link to={`/teacher/assignments/${assignment.assignment_id}`} className="assignment-link">
                                <li key={assignment.assignment_id} className="assignment-item">
                                    {assignment.title}
                                </li>
                            </Link>
                        ))
                    ) : (
                        <p className="no-assignments-message">No assignments found.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AssignmentsList;
