// TestStatistics.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const TestStatistics = () => {
    const { testId } = useParams();
    const [statistics, setStatistics] = useState(null);

    useEffect(() => {
        axios.post('http://localhost:8000/get_test_statistics/', { test_id: testId })
            .then(response => setStatistics(response.data.statistics))
            .catch(error => console.error('Error fetching test statistics', error));
    }, [testId]);

    return (
        <div>
            <h1>Test Statistics</h1>
            {statistics && (
                <div>
                    <p>Average Score: {statistics.average_score}</p>
                    <p>Highest Score: {statistics.highest_score}</p>
                    <p>Lowest Score: {statistics.lowest_score}</p>
                    <p>Question Difficulty:</p>
                    <ul>
                        {statistics.question_difficulty.map((question, index) => (
                            <li key={index}>
                                <p>Question {index + 1}: {question.correct_percentage}% students answered correctly</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TestStatistics;
