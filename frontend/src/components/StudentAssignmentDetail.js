import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import '../styles/StudentAssignmentDetail.css'
const StudentAssignmentDetail = () => {
    const { assignmentId } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [submissionFiles, setSubmissionFiles] = useState([]);
    const [submissionText, setSubmissionText] = useState("");
    const [previousSubmissions, setPreviousSubmissions] = useState([]);

    // Fetch assignment details
    useEffect(() => {
        axios.post('http://localhost:8000/get_assignment/', { assignment_id: assignmentId })
            .then(response => {
                setAssignment(response.data.assignment);
            })
            .catch(error => console.error('Error fetching assignment details:', error.message));
    }, [assignmentId]);

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
        const studentId = getCookie('userId');
        axios.post('http://localhost:8000/get_student_submissions/', { assignment_id: assignmentId, student_id: studentId })
            .then(response => {
                setPreviousSubmissions(response.data.submissions);
            })
            .catch(error => console.error('Error fetching previous submissions:', error.message));
    }, [assignmentId]);

    // Handle file input change
    const handleFileChange = (e) => {
        setSubmissionFiles(e.target.files);
    };

    // Handle submission of assignment
    const handleSubmit = () => {
        const studentId = getCookie('userId');
        const formData = new FormData();
        formData.append('assignment_id', assignmentId);
        formData.append('student_id', studentId);
        formData.append('submission_text', submissionText);

        for (let i = 0; i < submissionFiles.length; i++) {
            formData.append('files', submissionFiles[i]);
        }
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
    
        axios.post('http://localhost:8000/submit_assignment/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(response => {
        })
        .catch(error => console.error('Error submitting assignment:', error.message));
    };
    const getFileName = (file) => {
        const parts = file.split('_');
        return parts.length > 1 ? parts.slice(1).join('_') : file;
    };
    // Handle deletion of a previous submission
    const handleDeleteSubmission = (submissionId) => {
        axios.post('http://localhost:8000/delete_submission/', { submission_id: submissionId })
            .then(response => {
                setPreviousSubmissions(prev => prev.filter(submission => submission._id !== submissionId));
            })
            .catch(error => console.error('Error deleting submission:', error.message));
    };

    return (
        <div className="student-assignment-detail">
            <Link to="/student/assignments" className="back-to-teachers-button">Back to Assignments</Link>
            <h1>Assignment</h1>
        {assignment ? (
            <div>
                <div className="assignment-details">
                    <h1>{assignment.title}</h1>
                    <p>{assignment.description}</p>
                    <p>Classroom: {assignment.classroom_name}</p>
                    <p>Deadline: {new Date(assignment.deadline).toLocaleString()}</p>
                    <p>Marks: {assignment.marks}</p>
                    {assignment.file_paths && assignment.file_paths.length > 0 && (
                        <a href={`http://localhost:8000/media/${assignment.file_paths[0]}`} target="_blank" rel="noopener noreferrer">
                            Download Assignment File
                        </a>
                    )}
                </div>

                <div className="submit-assignment">
                    <h3>Submit Assignment</h3>
                    <textarea 
                        value={submissionText}
                        onChange={e => setSubmissionText(e.target.value)}
                        placeholder="Enter optional text for your submission"
                    />
                    <input type="file" multiple onChange={handleFileChange} />
                    <button onClick={handleSubmit}>Submit</button>
                </div>

                <div className="previous-submissions">
                    <h3>Your Previous Submissions</h3>
                    {previousSubmissions.length > 0 ? (
                        previousSubmissions.map(submission => (
                            <div key={submission._id}>
                                <p>Submitted on: {new Date(submission.submitted_at).toLocaleString()}</p>
                                {submission.submission_text && <p>Text: {submission.submission_text}</p>}
                                {submission.file_paths && submission.file_paths.length > 0 && (
                                    <ul>
                                        {submission.file_paths.map((file, index) => (
                                            <li key={index}>
                                                <a href={`http://localhost:8000/media/${file}`} target="_blank" rel="noopener noreferrer">
                                                    {getFileName(file)}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <button className="delete-submission-button" onClick={() => handleDeleteSubmission(submission._id)}>Delete Submission</button>
                            </div>
                        ))
                    ) : (
                        <p>No previous submissions.</p>
                    )}
                </div>
            </div>
        ) : (
            <p>Loading assignment details...</p>
        )}
    </div>
    );
};

export default StudentAssignmentDetail;
