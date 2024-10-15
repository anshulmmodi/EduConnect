import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/StudentTests.css'

const StudentTests = () => {
    const [tests, setTests] = useState([]);
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
    const studentId = getCookie('userId'); // Assuming you have student ID in cookies

    useEffect(() => {
        const fetchPendingTests = async () => {
            try {
                const response = await axios.post('http://localhost:8000/get_pending_tests/', { student_id: studentId });
                setTests(response.data.pending_tests);
            } catch (error) {
                console.error('Error fetching tests:', error);
            }
        };

        fetchPendingTests();
    }, []);

    return (
        <div className="student-tests">
            <Link to="/student" className="back-to-teachers-button">Back to Dashboard</Link>
            <div className='student-tests-container'>
            <h1>Your Pending Tests</h1>
                <ul>
                    {tests.map(test => (
                        <li key={test._id}>
                            <Link to={`/student/test/${test._id}`}>{test.title}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default StudentTests;
