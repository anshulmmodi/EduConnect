import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams,Link } from "react-router-dom"; 
import '../styles/TeacherClassroom.css'
function TeacherClassroom() {
    const { classroom_id } = useParams(); // Get classroom ID from URL
    const [classroom, setClassroom] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]); // State for multiple file uploads
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClassroomDetails = async () => {
            try {
                const response = await axios.post("http://localhost:8000/get_classroom_details_by_id/", { classroom_id });
                if (response.data.classroom) {
                    setClassroom(response.data.classroom);
                } else {
                    console.error('Classroom not found');
                }
            } catch (error) {
                console.error('Error fetching classroom details:', error);
            }
            setLoading(false);
        };

        const fetchAnnouncements = async () => {
            try {
                const response = await axios.post("http://localhost:8000/get_announcements/", { classroom_id });
                if (response.data.announcements) {
                    setAnnouncements(response.data.announcements);
                }
            } catch (error) {
                console.error('Error fetching announcements:', error);
            }
        };

        fetchClassroomDetails();
        fetchAnnouncements();
    }, [classroom_id]);

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        const teacherId = document.cookie.split('; ').find(row => row.startsWith('userId')).split('=')[1]; // Assuming userId is stored in cookies
        if (!newAnnouncement && selectedFiles.length === 0) return;

        const formData = new FormData();
        formData.append("classroom_id", classroom_id);
        formData.append("announcement_text", newAnnouncement);
        formData.append("teacher_id", teacherId);

        selectedFiles.forEach(file => {
            formData.append("files", file); // Append each selected file
        });

        try {
            const response = await axios.post("http://localhost:8000/create_announcement/", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (response.data.message) {
                // Add the new announcement to the list at the top
                setAnnouncements([{
                    announcement_id: response.data.announcement_id,
                    announcement_text: newAnnouncement,
                    file_paths: response.data.file_paths || [], // Ensure file paths are included
                    created_at: new Date()
                }, ...announcements]);
                setNewAnnouncement("");
                setSelectedFiles([]); // Clear file input
            }
        } catch (error) {
            console.error('Error creating announcement:', error);
        }
    };

    const handleDeleteAnnouncement = async (announcement_id) => {
        try {
            const response = await axios.post("http://localhost:8000/delete_announcement/", { announcement_id });
            if (response.data.success) {
                // Filter out the deleted announcement
                setAnnouncements(announcements.filter(announcement => announcement.announcement_id !== announcement_id));
            } else {
                console.error('Error deleting announcement:', response.data.error);
            }
        } catch (error) {
            console.error('Error deleting announcement:', error);
        }
    };

    // Function to format date and time in dd/mm/yyyy hh:mm:ss AM/PM format
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert to 12-hour format
        hours = String(hours).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    };

    const handleFileChange = (e) => {
        setSelectedFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files)]);
    };

    const removeSelectedFile = (index) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const getOriginalFileName = (fileName) => {
        const parts = fileName.split('_');
        return parts.length > 1 ? parts.slice(1).join('_') : fileName;
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="teacher-classroom">
            <Link to="/teacher" className="back-to-teachers-button">Back to Dashboard</Link>
            {classroom ? (
                <div class="teacher-classroom-container">
                    <h2>{classroom.name}</h2>
                    <p>{classroom.description}</p>
                    <p>Created At: {formatDateTime(classroom.created_at)}</p>
                    <button className="view-students"><Link  to={`/teacher_classroom/students/${classroom.classroom_id}`}>View Students</Link></button>
                    <div className="break-line"></div>
                    <h3>Announcements</h3>
                    <form onSubmit={handleCreateAnnouncement}>
                        <textarea
                            value={newAnnouncement}
                            onChange={(e) => setNewAnnouncement(e.target.value)}
                            placeholder="Write a new announcement..."
                            required
                        ></textarea>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.docx"
                            multiple
                        />
                        <div>
                            {selectedFiles.map((file, index) => (
                                <div key={index}>
                                    {getOriginalFileName(file.name)} {/* Display trimmed file name */}
                                    <button type="button" onClick={() => removeSelectedFile(index)}>x</button>
                                </div>
                            ))}
                        </div>
                        <button type="submit">Post Announcement</button>
                    </form>

                    {announcements.length > 0 ? (
                        <ul>
                            {announcements.map((announcement) => (
                                <li key={announcement.announcement_id}>
                                    <p className="announcement-text">{announcement.announcement_text}</p>
                                    {announcement.file_paths && announcement.file_paths.length > 0 && (
                                        <ul class="announcent-files">
                                            {announcement.file_paths.map((filePath, index) => (
                                                <li key={index}>
                                                    {/* Use the correct MEDIA_URL for the link */}
                                                    <a href={`http://localhost:8000/media/${filePath}`} target="_blank" rel="noopener noreferrer" download>
                                                        {filePath.split('_')[1]}  {/* Display original file name */}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <p>{formatDateTime(announcement.created_at)}</p>
                                    <button onClick={() => handleDeleteAnnouncement(announcement.announcement_id)}>Delete</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No announcements yet.</p>
                    )}

                </div>
            ) : (
                <p>Classroom not found.</p>
            )}
        </div>
    );
}

export default TeacherClassroom;
