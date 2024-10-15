import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/TestTaking.css'
const TestTaking = () => {
    const { testId } = useParams();
    const [test, setTest] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

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
        const fetchTest = async () => {
            try {
                const studentId = getCookie('userId');
                const response = await axios.post('http://localhost:8000/get_test/', {
                    test_id: testId,
                    student_id: studentId,
                });
                setTest(response.data);
                setTimeRemaining(response.data.time_limit * 60);

                const savedProgress = JSON.parse(localStorage.getItem(`test_${testId}`));
                if (savedProgress) {
                    setTimeRemaining(savedProgress.timeRemaining || response.data.time_limit * 60);
                }
            } catch (error) {
                console.error('Error fetching test:', error);
            }
        };

        fetchTest();
    }, [testId]);

    useEffect(() => {
        if (isSubmitting) return;

        if (timeRemaining <= 0) {
            handleSubmitTest();
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                localStorage.setItem(`test_${testId}`, JSON.stringify({
                    currentQuestionIndex,
                    answers,
                    timeRemaining: prev - 1
                }));
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, currentQuestionIndex, answers, testId, isSubmitting]);

    const handleOptionSelect = (questionId, option) => {
        // Update the answer for the specific questionId
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: option 
        }));
    }

    const handleNextQuestion = () => {
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const handlePrevQuestion = () => {
        setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
    };

    const handleSubmitTest = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            const studentId = getCookie('userId');
            await axios.post('http://localhost:8000/submit_test/', {
                test_id: testId,
                student_id: studentId,
                answers,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            navigate('/student/test/result/' + testId)
        } catch (error) {
            console.error('Error submitting test:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!test) {
        return <div>Loading...</div>;
    }

    const currentQuestion = test.questions[currentQuestionIndex];

    return (
        <div className="test-taking">
            <h1>{test.title}</h1>
            <div className="question-box">
                <h2>Time Remaining: {Math.floor(timeRemaining / 60)}:{('0' + (timeRemaining % 60)).slice(-2)}</h2>
                <h3>{currentQuestion.text}</h3>
                <div className="options">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleOptionSelect(currentQuestionIndex, index)} // Pass the question ID and index
                            className={answers[currentQuestion._id] === index ? 'selected' : ''} // Check if this option is selected
                        >
                            {option}
                        </button>
                    ))}
                </div>

                <div className="navigation">
                    <button onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0} className="prev-button"><i class="fa-solid fa-chevron-left"></i> Previous</button>
                    <button onClick={handleNextQuestion} disabled={currentQuestionIndex === test.questions.length - 1} className="next-button">Next <i class="fa-solid fa-chevron-right"></i></button>
                </div>

                {currentQuestionIndex === test.questions.length - 1 && (
                    <button onClick={handleSubmitTest} disabled={isSubmitting} className="submit-button">Submit Test</button>
                )}
            </div>
        </div>
    );
};

export default TestTaking;
