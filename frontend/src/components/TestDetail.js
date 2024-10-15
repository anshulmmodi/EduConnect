// TestDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/TestDetail.css'
const TestDetail = () => {
    const { testId } = useParams();
    const [testDetails, setTestDetails] = useState(null);

    useEffect(() => {
        axios.post('http://localhost:8000/get_test_details/', { test_id: testId })
            .then(response => setTestDetails(response.data.test))
            .catch(error => console.error('Error fetching test details', error));
    }, [testId]);

    return (
        <div className='test-detail'>
            <h1>Test Details</h1>
            {testDetails && (
                <div>
                    <h2>{testDetails.title}</h2>
                    <h3>Time Limit: {testDetails.time_limit} minutes</h3>
                    <h4>Questions</h4>
                    <ul>
                        {testDetails.questions.map((question, index) => (
                            <li key={index}>
                                <p>{question.text}</p>
                                <ul>
                                    {question.options.map((option, i) => (
                                        <li key={i}>{option}</li>
                                    ))}
                                </ul>
                                <p>Correct Answer: {question.options[question.correct]}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TestDetail;
