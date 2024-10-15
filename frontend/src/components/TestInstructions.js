import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/TestInstructions.css'
const TestInstructions = () => {
    const { testId } = useParams();
    const [test, setTest] = useState(null);
    const navigate = useNavigate();
    
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
        const fetchTest = async () => {
            try {
                const studentId = getCookie('userId'); // Assuming you have this function to get studentId from cookies
                const response = await axios.post('http://localhost:8000/get_test/', {
                    test_id: testId,
                    student_id: studentId
                });
                setTest(response.data);
            } catch (error) {
                console.error('Error fetching test:', error);
            }
        };

        fetchTest();
    }, [testId]);

    const handleStartTest = () => {
        navigate(`/student/test/${testId}/start`);
    };

    if (!test) {
        return <div>Loading...</div>;
    }

    return (
        <div className='test-instructions'>
            <h1>{test.title}</h1>
            <p>Time Limit: {test.time_limit} minutes</p>
            <p>Total Questions: {test.questions.length}</p>
            <h2>Instructions for the Test:</h2>
            <ol>
                <li><b>Test Duration:</b> You have <b>{test.time_limit} minutes </b>to complete the test. Please manage your time wisely.</li>
                <li><b>Questions Format</b>: Each question is followed by multiple options. Choose the best answer by selecting one option.</li>
                <li><b>Navigation: </b>You can navigate between questions using the <b>'Next'</b> and <b>'Previous'</b> buttons.</li>
                <li><b>Answering Questions:</b> Click on the answer to select it. You can change your answer before submitting.</li>
                <li><b>Submitting the Test:</b> Once you have answered all the questions, click the 'Submit Test' button. Ensure you are satisfied with your answers.</li>
                <li><b>Scoring:</b> Your score will be calculated based on the number of correct answers.</li>
                <li><b>Rules:</b> No outside materials are allowed. Please refrain from communicating with other test-takers.</li>
            </ol>
            <button onClick={handleStartTest}>Start Test</button>
        </div>
    );
};

export default TestInstructions;
