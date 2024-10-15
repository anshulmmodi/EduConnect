import React, { useState, useEffect } from 'react';
import { useParams,Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/StudentTestResult.css'; // Import the CSS file

const StudentTestResult = () => {
    const { testId } = useParams();
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const getCookie = (name) => {
        const cookieName = `${name}=`;
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookies = decodedCookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.startsWith(cookieName)) {
                return cookie.substring(cookieName.length);
            }
        }
        return null;
    };

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const studentId = getCookie('userId');

                const response = await axios.post('http://localhost:8000/get_test_result/', {
                    test_id: testId,
                    student_id: studentId,
                });

                setResult(response.data);
            } catch (error) {
                setError('Error fetching test result');
                console.error(error);
            }
        };

        fetchResult();
    }, [testId]);

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!result) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className='student-test-result'>
            <div className="result-container">
            <Link to="/student" className="back-to-teachers-button">Back to Dashboard</Link>
                <h1 className="test-name">{result.test_name}</h1>
                <div className="score-card">
                    <p className="score">Your Score: <span>{result.score}</span></p>
                    <p className="max-score">Max Score: <span>{result.max_score}</span></p>
                </div>
            </div>
        </div>);
};

export default StudentTestResult;
