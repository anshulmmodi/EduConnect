import React, { useState, useEffect } from 'react';
import { useParams, useNavigate,Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/EditAssignment.css'

const EditAssignment = () => {
    const { assignmentId } = useParams();
    const [assignment, setAssignment] = useState({
        title: '',
        description: '',
        deadline: '',
        marks: '',
        classroom_name: '',  // Display classroom name instead of ID
        file_paths: []  // For existing files
    });
    const [newFiles, setNewFiles] = useState([]);
    const [removeFiles, setRemoveFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios.post('http://localhost:8000/get_assignment/', { assignment_id: assignmentId })
            .then(response => {
                const fetchedAssignment = response.data.assignment;
                setAssignment({
                    title: fetchedAssignment.title || '',
                    description: fetchedAssignment.description || '',
                    deadline: fetchedAssignment.deadline || '',
                    marks: fetchedAssignment.marks || '',
                    classroom_name: fetchedAssignment.classroom_name || 'Unknown',  // Display name
                    file_paths: fetchedAssignment.file_paths || []
                });
                setLoading(false);
            })
            .catch(error => console.error('Error fetching assignment:', error));
    }, [assignmentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAssignment(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setNewFiles([...e.target.files]);
    };

    const handleRemoveFile = (fileUrl) => {
        setRemoveFiles([...removeFiles, fileUrl]);  // Add to the list of files to be removed
        setAssignment(prevState => ({
            ...prevState,
            file_paths: prevState.file_paths.filter(file => file !== fileUrl)  // Remove from UI
        }));
    };
    const getFileName = (file) => {
        const parts = file.split('_');
        return parts.length > 1 ? parts.slice(1).join('_') : file;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();

        formData.append('assignment_id', assignmentId);
        formData.append('updated_data', JSON.stringify({
            title: assignment.title,
            description: assignment.description,
            deadline: assignment.deadline,
            marks: assignment.marks,
        }));
        formData.append('remove_files', JSON.stringify(removeFiles));

        newFiles.forEach(file => {
            formData.append('files', file);  // Append new files
        });

        axios.post('http://localhost:8000/update_assignment/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(() => {
                alert('Assignment updated successfully');
                navigate('/teacher/assignments');  // Redirect after updating
            })
            .catch(error => console.error('Error updating assignment:', error));
    };

    return (
        <div className='edit-assignment'>
            <Link to="/teacher/assignments" className="back-to-teachers-button">Back to Assignments</Link>
            <div className='edit-assignment-container'>
                <h1>Edit Assignment</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Title:</label>
                            <input
                                type="text"
                                name="title"
                                value={assignment.title}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label>Description:</label>
                            <textarea
                                name="description"
                                value={assignment.description}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label>Deadline:</label>
                            <input
                                type="datetime-local"
                                name="deadline"
                                value={assignment.deadline}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label>Marks:</label>
                            <input
                                type="number"
                                name="marks"
                                value={assignment.marks}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label>Classroom:</label>
                            <input
                                type="text"
                                name="classroom_name"
                                value={assignment.classroom_name}
                                disabled
                            />
                        </div>

                        <div>
                            <label>Current Files:</label>
                            <ul>
                                {assignment.file_paths.map(file => (
                                    <li key={file}>
                                        <a href={`http://localhost:8000/media/${file}`} target="_blank" rel="noopener noreferrer">
                                            {getFileName(file)}
                                        </a>
                                        <button type="button" onClick={() => handleRemoveFile(file)}>Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <label>Upload New Files:</label>
                            <input type="file" multiple onChange={handleFileChange} />
                        </div>

                        <button type="submit">Update Assignment</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditAssignment;
