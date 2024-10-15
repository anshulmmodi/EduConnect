import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AssignmentDetail.css'
const AssignmentDetail = () => {
    const { assignmentId } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [students, setStudents] = useState([]);  // Students data with all their submissions
    const [expandedStudent, setExpandedStudent] = useState(null);  // To track which student's submissions are expanded
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch assignment details
        axios.post('http://localhost:8000/get_assignment/', { assignment_id: assignmentId })
            .then(response => {
                setAssignment(response.data.assignment);
            })
            .catch(error => console.error('Error fetching assignment details:', error));

        // Fetch students and their submission statuses
        axios.post('http://localhost:8000/get_assignment_submissions/', { assignment_id: assignmentId })
            .then(response => {
                setStudents(response.data.students);  // Grouped student data with all their submissions
            })
            .catch(error => console.error('Error fetching students:', error));
    }, [assignmentId]);

    const handleDelete = () => {
        axios.post('http://localhost:8000/delete_assignment/', { assignment_id: assignmentId })
            .then(() => {
                alert('Assignment deleted successfully!');
                navigate('/teacher/assignments'); // Redirect to assignment list
            })
            .catch(error => console.error('Error deleting assignment:', error));
    };

    // Helper function to extract original file name
    const getFileName = (filePath) => {
        const parts = filePath.split('_');
        return parts.length > 1 ? parts.slice(1).join('_') : filePath;
    };

    // Helper function to format the deadline
    const formatDeadline = (deadline) => {
        const date = new Date(deadline);
        const optionsDate = { month: 'short', day: 'numeric' }; // Example: "Sep 14"
        const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true }; // Example: "11:59 AM"
        return `${date.toLocaleDateString(undefined, optionsDate)}, ${date.toLocaleTimeString(undefined, optionsTime)}`;
    };

    return (
        <div className="assignment-detail-container">
            <Link to="/teacher/assignments" className="back-to-teachers-button">Back to Assignments</Link>
            <h1 className="assignment-header">Assignment Details</h1>
            {assignment && (
                <div className="assignment-section">
                    <h2 className="assignment-title">{assignment.title}</h2>
                    <p className="assignment-description">{assignment.description}</p>
                    <p className="assignment-details">Deadline: {formatDeadline(assignment.deadline)}</p>
                    <p className="assignment-details">Marks: {assignment.marks}</p>
                    <p className="assignment-details">Classroom: {assignment.classroom_name}</p>

                    <h3>Uploaded Files</h3>
                    <ul className="uploaded-files">
                        {assignment.file_paths && assignment.file_paths.map((filePath, index) => (
                            <li key={index}>
                                <a href={`http://localhost:8000/media/${filePath}`} target="_blank" rel="noopener noreferrer">
                                    {getFileName(filePath)}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <button className="button delete-button" onClick={handleDelete}>Delete Assignment</button>
                    <Link className="button" to={`/teacher/assignments/edit/${assignmentId}`}>Edit Assignment</Link>
                </div>
            )}

            <h3>Students and Submission Status</h3>
            <div className="students-section">
                <ul>
                    {students.map(student => (
                        <li key={student.student_id}>
                            <button
                                onClick={() => setExpandedStudent(expandedStudent === student.student_id ? null : student.student_id)}
                                className={student.status === 'completed' ? 'status-completed' : 'status-pending'}
                            >
                                {student.student_name} - {student.status}
                            </button>

                            {expandedStudent === student.student_id && (
                                <div className="submission-details">
                                    {student.submissions.length > 0 ? student.submissions.map((submission, index) => (
                                        <div key={index}>
                                            <h4>Submission {index + 1}:</h4>
                                            <ul>
                                                {submission.files.length > 0 ? submission.files.map((filePath, index) => (
                                                    <li key={index}>
                                                        <a href={`http://localhost:8000/media/${filePath}`} target="_blank" rel="noopener noreferrer">
                                                            {getFileName(filePath)}
                                                        </a>
                                                    </li>
                                                )) : <li>No files submitted</li>}
                                            </ul>

                                            <p>Submitted Text: {submission.text || "No text submitted"}</p>
                                            <p>Submitted on: {new Date(submission.submission_time).toLocaleString()}</p>
                                        </div>
                                    )) : <p className="no-submissions">No submissions</p>}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AssignmentDetail;
