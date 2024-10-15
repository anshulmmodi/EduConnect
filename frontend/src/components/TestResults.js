import React, { useState, useEffect } from 'react';
import { useParams,Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/TestResults.css'; 

const TestResults = () => {
    const { testId } = useParams();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null); // Add error state

    useEffect(() => {
        axios.post('http://localhost:8000/get_test_results/', { test_id: testId })
            .then(response => {
                setResults(response.data.results);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching test results', error);
                setError('Error fetching test results');
                setLoading(false);
            });
    }, [testId]);

    if (loading) {
        return <div className="test-results"><p>Loading...</p></div>;
    }

    if (error) {
        return <div className="test-results"><p>{error}</p></div>;
    }

    return (
        <div className="test-results">
            <h1>Test Results</h1>
            <Link to="/teacher" className="back-to-teachers-button">Back to Dashboard</Link>
            {results.length === 0 ? (
                <p>No results available for this test. Please check back later</p>
            ) : (
                <ul>
                    {results.map((result, index) => (
                        <li key={index}>
                            <p><strong>Student:</strong> {result.student_name}</p>
                            <p><strong>Score:</strong> <span className="score">{result.score}</span> / {result.total_questions}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TestResults;
