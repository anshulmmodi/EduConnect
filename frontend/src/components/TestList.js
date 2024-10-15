import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/TestList.css'

const TestList = () => {
    const [tests, setTests] = useState([]);
    const [error, setError] = useState(null);
    
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
        const teacher_id = getCookie('userId');
        console.log('Teacher ID:', teacher_id); // Debug: Log teacher ID

        axios.post('http://localhost:8000/get_teacher_tests/', { 'teacher_id': teacher_id })
            .then(response => {
                console.log('API Response:', response.data); // Debug: Log API response
                if (response.data.tests) {
                    setTests(response.data.tests);
                } else {
                    setError('Unexpected response format.');
                }
            })
            .catch(error => {
                console.error('Error fetching tests:', error);
                setError('Error fetching tests.');
            });
    }, []);

    const handleDelete = (testId) => {
        axios.post('http://localhost:8000/delete_test/', { test_id: testId })
            .then(() => setTests(tests.filter(test => test.test_id !== testId)))
            .catch(error => console.error('Error deleting test:', error));
    };

    return (
        <div className='test-list'>
            <Link to="/teacher" className="back-to-teachers-button">Back to Dashboard</Link>
            <h1>All Tests</h1>
            <Link className='create-test' to="/teacher/test/create">Create Test</Link>
            {error && <p>{error}</p>}
            <ul>
                {tests.length > 0 ? (
                    tests.map((test) => (
                        <li key={test.test_id}>
                            <Link to={`/teacher/test/${test.test_id}`}>{test.title}</Link>
                            <button className="delete-test"onClick={() => handleDelete(test.test_id)}>Delete</button>
                            <Link to={`/teacher/test/edit/${test.test_id}`}>Edit</Link>
                            <Link to={`/teacher/test/results/${test.test_id}`}>View Results</Link>
                        </li>
                    ))
                ) : (
                    <p>No tests available.</p>
                )}
            </ul>
        </div>
    );
};

export default TestList;
