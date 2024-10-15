import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Home from './components/Home';
import Student from './components/Student';
import Teacher from './components/Teacher';
import CreateClassroom from './components/CreateClassroom';
import TeacherClassroom from './components/TeacherClassroom';
import StudentClassroom from './components/StudentClassroom';
import AssignmentDetail from './components/AssignmentDetail';
import AssignmentsList from './components/AssignmentsList'
import CreateAssignment from './components/CreateAssignment';
import EditAssignment from './components/EditAssignment';
import StudentAssignments from './components/StudentAssignments';
import StudentAssignmentDetail from './components/StudentAssignmentDetail';
import StudentList from './components/StudentList';
import TestCreation from './components/TestCreation';
import TestDetail from './components/TestDetail';
import TestList from './components/TestList';
import TestResults from './components/TestResults';
import TestStatistics from './components/TestStatistics';
import TestEdit from './components/TestEdit.js';
import StudentTests from './components/StudentTests.js';
import TestInstructions from './components/TestInstructions.js';
import TestTaking from './components/TestTaking.js';
import StudentTestResult from './components/StudentTestResult.js';
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sign_in" element={<SignIn />} />
                <Route path="/sign_up" element={<SignUp />} />
                <Route path="/student" element={<Student />} />
                <Route path="/teacher" element={<Teacher />} />
                <Route path='/create_classroom' element ={<CreateClassroom/>}/>
                <Route path="/teacher_classroom/:classroom_id" element={<TeacherClassroom />} />
                <Route path="/teacher_classroom/students/:classroom_id" element={<StudentList/>}/>
                <Route path="/student_classroom/:classroom_id" element={<StudentClassroom />} />
                <Route path="/teacher/assignments" element={<AssignmentsList />} />
                <Route path="/teacher/assignments/create" element={<CreateAssignment />} />
                <Route path="/teacher/assignments/:assignmentId" element={<AssignmentDetail />} />
                <Route path="/teacher/assignments/edit/:assignmentId" element={<EditAssignment/>} />
                <Route path="/student/assignments" element={<StudentAssignments  />} />
                <Route path="/student/assignments/:assignmentId" element={<StudentAssignmentDetail />} />
                <Route path="/teacher/test/create" element={<TestCreation />} />
                <Route path="/teacher/tests"  element={<TestList/>} />
                <Route path="/teacher/test/:testId"  element={<TestDetail/>} />
                <Route path="/teacher/test/edit/:testId" element={<TestEdit/>} />
                <Route path="/teacher/test/results/:testId" element={<TestResults/>} />
                <Route path="/teacher/test/statistics/:testId" element={<TestStatistics/>} />
                <Route path="/student/tests" element={<StudentTests/>}/>
                <Route path="/student/test/:testId" element={<TestInstructions/>}/>
                <Route path="/student/test/:testId/start" element={<TestTaking/>}/>
                <Route path="/student/test/result/:testId" element={<StudentTestResult/>}/>
            </Routes>
        </Router>
    );
};

export default App;