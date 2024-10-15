import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams,Link } from "react-router-dom";
import '../styles/StudentClassroom.css'
function StudentClassroom() {
    const { classroom_id } = useParams(); // Get classroom_id from URL params
    const [classroomDetails, setClassroomDetails] = useState(null);
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        const fetchClassroomDetails = async () => {
            try {
                const response = await axios.post("http://localhost:8000/get_classroom_details/", {
                    classroom_id: classroom_id,
                });

                if (response.data.classroom) {
                    setClassroomDetails(response.data.classroom);
                }
            } catch (error) {
                console.error("Error fetching classroom details:", error);
            }
        };

        const fetchAnnouncements = async () => {
            try {
                const response = await axios.post("http://localhost:8000/get_announcements/", {
                    classroom_id: classroom_id,
                });

                if (response.data.announcements) {
                    setAnnouncements(response.data.announcements);
                }
            } catch (error) {
                console.error("Error fetching announcements:", error);
            }
        };

        fetchClassroomDetails();
        fetchAnnouncements();
    }, [classroom_id]);

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

    // Function to extract and display original file name from the file path
    const getOriginalFileName = (filePath) => {
        const splitFileName = filePath.split('_');
        return splitFileName.length > 1 ? splitFileName.slice(1).join('_') : filePath;
    };

    return (
        <div className="teacher-classroom">
            <Link to="/student" className="back-to-teachers-button">Back to Dashboard</Link>
            {classroomDetails ? (
                <div className="teacher-classroom-container">
                    <h2>Classroom: {classroomDetails.name}</h2>
                    <p><strong>Description:</strong> {classroomDetails.description}</p>
                    <p>
                        <strong>Created At:</strong> {new Date(classroomDetails.created_at).toLocaleDateString('en-GB')}{" "}
                        {new Date(classroomDetails.created_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric',
                            hour12: true
                        })}
                    </p>
                    <h3>Announcements</h3>
                    {announcements.length > 0 ? (
                        <ul>
                            {announcements.map((announcement) => (
                                <li key={announcement._id}>
                                    <p className="announcement-text">{announcement.announcement_text}</p>
                                    {announcement.file_paths && announcement.file_paths.length > 0 && (
                                        <ul>
                                            {announcement.file_paths.map((filePath, index) => (
                                                <li key={index}>
                                                    <a 
                                                        href={`http://localhost:8000/media/${filePath}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        download
                                                    >
                                                        {getOriginalFileName(filePath)}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <p>{formatDateTime(announcement.created_at)}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No announcements available for this classroom.</p>
                    )}
                </div>
            ) : (
                <p>Loading classroom details...</p>
            )}
        </div>
    );
}

export default StudentClassroom;
