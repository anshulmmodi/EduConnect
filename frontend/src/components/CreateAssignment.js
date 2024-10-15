import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/CreateAssignment.css'

function CreateAssignment() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [classroomId, setClassroomId] = useState("");
    const [deadline, setDeadline] = useState("");
    const [marks, setMarks] = useState(0);
    const [files, setFiles] = useState([]);
    const [teacherId, setTeacherId] = useState("");
    const [classrooms, setClassrooms] = useState([]);
    const navigate = useNavigate();

    // Function to get the cookie (if you need the teacher ID from a cookie)
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
        // Fetch the teacher ID from cookies if necessary
        const userId = getCookie("userId");
        if (userId) {
            setTeacherId(userId);
        }

        // Fetch classrooms created by the teacher
        const fetchClassrooms = async () => {
            try {
                const response = await axios.post("http://localhost:8000/get_teacher_data/", {
                    user_id: userId,
                });
                if (response.data.classrooms) {
                    setClassrooms(response.data.classrooms);
                }
            } catch (error) {
                console.error("Error fetching classrooms:", error);
            }
        };

        fetchClassrooms();
    }, []);

    const handleFileChange = (event) => {
        setFiles(event.target.files);
    };
    const handleBack = () => {
        navigate("/teacher/assignments");
    };

    const handleCreateAssignment = async () => {
        if (!title || !classroomId || !teacherId || !deadline) {
            alert("All fields are required.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("classroom_id", classroomId);
        formData.append("deadline", deadline);
        formData.append("marks", marks);
        formData.append("teacher_id", teacherId);

        // Append files to the FormData object
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        try {
            const response = await axios.post("http://localhost:8000/create_assignment/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 201) {
                alert("Assignment created successfully!");
                navigate("/teacher/assignments");
            } else {
                alert("Failed to create assignment. Please try again.");
            }
        } catch (error) {
            console.error("Error creating assignment:", error);
            if (error.response) {
                console.error("Server Response:", error.response.data); // Log server response for detailed error
            }
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div class="create-assignment">
            <button className="back-button" onClick={handleBack}>Back to Assignments</button>
            <div className="create-assignment-container">
                <h1>Create Assignment</h1>
                <div>
                    <label>Title:</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                </div>
                <div>
                    <label>Classroom:</label>
                    <select value={classroomId} onChange={(e) => setClassroomId(e.target.value)}>
                        <option value="">Select a Classroom</option>
                        {classrooms.map((classroom) => (
                            <option key={classroom.classroom_id} value={classroom.classroom_id}>
                                {classroom.name}
                            </option>
                        ))}
                    </select>

                </div>
                <div>
                    <label>Deadline:</label>
                    <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
                <div>
                    <label>Marks:</label>
                    <input type="number" value={marks} onChange={(e) => setMarks(e.target.value)} />
                </div>
                <div>
                    <label>Upload Files:</label>
                    <input type="file"   multiple onChange={handleFileChange} />
                </div>
                <button onClick={handleCreateAssignment}>Create Assignment</button>
            </div>
        </div>
    );
}

export default CreateAssignment;
