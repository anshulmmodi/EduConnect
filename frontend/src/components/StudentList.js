import React, { useState, useEffect } from 'react';
import { useParams,Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/StudentList.css'

const StudentList = () => {
    const { classroom_id } = useParams();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch students when component mounts
        const fetchStudents = async () => {
            try {
                const response = await axios.post('http://localhost:8000/get_classroom_students/', {classroom_id : classroom_id,});
                setStudents(response.data.students);
                setLoading(false);
            } catch (err) {
                setError('Error fetching student list');
                setLoading(false);
            }
        };

        fetchStudents();
    }, [classroom_id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className='student-list'>
            <Link to='/teacher' className="back-to-teachers-button">Back to Dashboard</Link>
            <h1>Student List</h1>
            {students.length === 0 ? (
                <p>No students have joined this classroom yet.</p>
            ) : (
                <ul>
                    {students.map((student) => (
                        <li key={student.student_id}>
                            {student.student_name} - {student.email}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default StudentList;
