import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/TestEdit.css'
const TestEdit = () => {
    const { testId } = useParams();
    const navigate = useNavigate();

    const [testTitle, setTestTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [classroomId, setClassroomId] = useState('');
    const [timeLimit, setTimeLimit] = useState(30);
    const [shuffleQuestions, setShuffleQuestions] = useState(false);
    const [randomizeOptions, setRandomizeOptions] = useState(false);

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
        axios.post('http://localhost:8000/get_test_details/', { test_id: testId })
            .then(response => {
                const test = response.data.test;
                setTestTitle(test.title || '');
                setQuestions(test.questions || []);
                setClassroomId(test.classroom_id || '');
                setTimeLimit(test.time_limit || 30);
                setShuffleQuestions(test.shuffle_questions || false);
                setRandomizeOptions(test.randomize_options || false);
            })
            .catch(error => console.error('Error fetching test details:', error));
    }, [testId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const teacher_id = getCookie('userId');
        axios.post('http://localhost:8000/edit_test/', {
            test_id: testId,
            testTitle,
            questions,
            classroomId,
            timeLimit,
            shuffleQuestions,
            randomizeOptions,
            teacher_id
        })
            .then(() => {
                navigate('/teacher/tests'); // Redirect to test list or detail page
            })
            .catch(error => console.error('Error updating test:', error));
    };

    const addQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', '', '', ''], correct: '', points: '0' }]);
    };

    return (
        <div className='test-edit'>
            <h1>Edit Test</h1>
            <form onSubmit={handleSubmit}>
                <label>Test Title:</label>
                <input
                    type="text"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    required
                />

                <label>Time Limit (minutes):</label>
                <input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    required
                />

                <label>Shuffle Questions:</label>
                <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                />

                <label>Randomize Options:</label>
                <input
                    type="checkbox"
                    checked={randomizeOptions}
                    onChange={(e) => setRandomizeOptions(e.target.checked)}
                />

                <h2>Questions</h2>
                {questions.map((question, index) => (
                    <div key={index}>
                        <label>Question Text:</label>
                        <input
                            type="text"
                            value={question.text}
                            onChange={(e) => {
                                const newQuestions = [...questions];
                                newQuestions[index].text = e.target.value;
                                setQuestions(newQuestions);
                            }}
                            required
                        />

                        <label>Options:</label>
                        {question.options.map((option, optIndex) => (
                            <input
                                key={optIndex}
                                type="text"
                                value={option}
                                onChange={(e) => {
                                    const newQuestions = [...questions];
                                    newQuestions[index].options[optIndex] = e.target.value;
                                    setQuestions(newQuestions);
                                }}
                                required
                            />
                        ))}

                        <label>Correct Answer:</label>
                        <select
                            value={question.correct}
                            onChange={(e) => {
                                const newQuestions = [...questions];
                                newQuestions[index].correct = e.target.value;
                                setQuestions(newQuestions);
                            }}
                            required
                        >
                            {question.options.map((option, optIndex) => (
                                <option key={optIndex} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>

                    </div>
                ))}
                <button type="button" onClick={addQuestion}>Add Question</button>
                <button type="submit">Update Test</button>
            </form>
        </div>
    );
};

export default TestEdit;
