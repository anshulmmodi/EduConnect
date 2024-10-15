import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/TestCreation.css'
const TestCreation = () => {
    const [title, setTitle] = useState('');
    const [classroom, setClassroom] = useState('');
    const [classrooms, setClassrooms] = useState([]);
    const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], correct: '', points: '' }]);
    const [timeLimit, setTimeLimit] = useState('');
    const [shuffleQuestions, setShuffleQuestions] = useState(false);
    const [randomizeOptions, setRandomizeOptions] = useState(false);
    const [teacher_id, setTeacher_id] = useState('')
    const navigate = useNavigate();

    const handleBack = () => {
        navigate("/teacher/tests");
    };
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
        // Fetch classrooms for the current teacher
        const fetchClassrooms = async () => {
            const userId = getCookie('userId');
            setTeacher_id(userId)
            try {
                const response = await axios.post('http://localhost:8000/get_teacher_data/', { user_id: userId });
                setClassrooms(response.data.classrooms);
            } catch (error) {
                console.error('Error fetching classrooms:', error);
            }
        };

        fetchClassrooms();
    }, []);

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][field] = value;
        setQuestions(updatedQuestions);
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', '', '', ''], correct: '', points: '' }]);
    };

    const handleRemoveQuestion = (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
    };

    const handleSubmit = async (e) => {
        console.log(classroom)
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/create_test/', {
                title,
                classroom_id: classroom,
                questions,
                time_limit: timeLimit,
                shuffle_questions: shuffleQuestions,
                randomize_options: randomizeOptions,
                teacher_id
            });
            navigate('/teacher/tests'); // Redirect to test list or another appropriate page
        } catch (error) {
            console.error('Error creating test:', error);
        }
    };

    return (
        <div class="test-creation">
            <button className="back-button" onClick={handleBack}>Back to Tests</button>
            <div class="test-creation-container">
                <h1>Create New Test</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Title:</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>

                    <div>
                        <label>Classroom:</label>
                        <select value={classroom} onChange={(e) => setClassroom(e.target.value)} required>
                            <option value="">Select Classroom</option>
                            {classrooms.map((classroom) => (
                                <option key={classroom.classroom_id} value={classroom.classroom_id}>
                                    {classroom.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {questions.map((question, index) => (
                        <div key={index}>
                            <h3 class="question-number">Question {index + 1}</h3>
                            <div>
                                <label>Question Text:</label>
                                <input
                                    type="text"
                                    value={question.text}
                                    onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Options:</label>
                                {question.options.map((option, optIndex) => (
                                    <input
                                        key={optIndex}
                                        type="text"
                                        value={option}
                                        onChange={(e) => {
                                            const updatedOptions = [...question.options];
                                            updatedOptions[optIndex] = e.target.value;
                                            handleQuestionChange(index, 'options', updatedOptions);

                                        }}
                                        placeholder={"Option " + (optIndex + 1)}
                                        required
                                    />
                                ))}
                            </div>
                            <div>
                                <label>Correct Answer:</label>
                                <select
                                    value={question.correct}
                                    onChange={(e) => handleQuestionChange(index, 'correct', e.target.value)}
                                    required
                                >
                                    <option value="">Select Correct Answer</option>
                                    {question.options.map((option, optIndex) => (
                                        <option key={optIndex} value={optIndex}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* <div>
                                <label>Points:</label>
                                <input
                                    type="number"
                                    value={question.points}
                                    onChange={(e) => handleQuestionChange(index, 'points', e.target.value)}
                                    defaultValue="0"
                                />
                            </div> */}
                            <button type="button" class="remove-question-button" onClick={() => handleRemoveQuestion(index)}>
                                Remove Question
                            </button>
                            <div className="line-break"></div>
                        </div>
                    ))}

                    <button type="button" class="add-question-button" onClick={handleAddQuestion}>
                        Add Question
                    </button>

                    <div>
                        <label>Time Limit (in minutes):</label>
                        <input
                            type="number"
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label>Shuffle Questions
                            <input
                                type="checkbox"
                                checked={shuffleQuestions}
                                onChange={(e) => setShuffleQuestions(e.target.checked)}
                            />
                        </label>
                    </div>

                    <div>
                        <label>Randomize Options
                            <input
                                type="checkbox"
                                checked={randomizeOptions}
                                onChange={(e) => setRandomizeOptions(e.target.checked)}
                            />
                        </label>
                    </div>

                    <button className='create-test' type="submit">Create Test</button>
                </form>
            </div>
        </div>
    );
};

export default TestCreation;
