# EduConnect

## Overview

**EduConnect** is a full-stack web platform built using Django for the backend and React for the frontend. It provides a collaborative environment for teachers and students to connect through virtual classrooms. Teachers can create classrooms, post assignments and announcements, conduct MCQ-based tests, and invite students to participate. Students can join classrooms, view and submit assignments, and complete tests. The platform supports file attachments, deadlines, and MCQ tests with MongoDB as the database for data storage, and CORS is enabled for cross-origin requests between the frontend and backend.

## Features

### 1. Classroom Management:
   - Teachers can create classrooms and generate a room code to invite students.
   - Students can join classrooms by entering the room code.

### 2. Announcements:
   - Teachers can post announcements with file attachments in the classroom.
   - Students can access announcements and download attached files.

### 3. Assignments:
   - Teachers can upload assignments with file attachments and set a deadline.
   - Students can submit their assignments by uploading the required files before the deadline.

### 4. MCQ-Based Tests:
   - Teachers can create MCQ-based tests for students.
   - Students can submit their answers through the platform.

### 5. File Management:
   - Files such as assignment submissions and announcement attachments are stored in the **media** folder on the server.

### 6. MongoDB Data Storage:
   - MongoDB is used for storing data such as classroom information, assignments, announcements, and test results.

### 7. CORS (Cross-Origin Resource Sharing):
   - CORS is enabled to allow communication between the React frontend and Django backend.

## Technologies Used

- **Backend**: Django (Python) with MongoDB for data storage
  - **Django app**: `myapp` handles all the core functionality like managing classrooms, assignments, tests, and file handling.
- **Frontend**: React (JavaScript)
  - The frontend provides a dynamic and interactive user experience.
- **Database**: MongoDB
  - Used to store classroom data, announcements, assignments, test information, and user details.
- **File Storage**: Media files (such as assignment submissions, announcements, etc.) are stored in the `media/` folder.
- **CORS**: CORS is enabled for smooth communication between the frontend and backend.

## Project Structure

EduConnect/ 
├── .vscode/ # VSCode workspace settings and configurations 
├── educonnect/ # Django project folder (backend) 
├── env/ # Virtual environment for Python dependencies 
├── frontend/ # React frontend application 
├── myapp/ # Django app containing backend logic 
├── media/ # Folder storing media files (assignments, announcements, etc.) 
├── node_modules/ # Node.js dependencies for the frontend
├── db.sqlite3 # SQLite database file ├── manage.py # Django management script 
├── package.json # Node.js project metadata and scripts for the frontend 
├── package-lock.json # Locks the versions of Node.js packages installed 
└── README.md # Project documentation (this file)


## Features Breakdown

### Teacher Features:

1. **Create Classrooms**:
   - Teachers can create classrooms with a unique room code.
   - The room code is shared with students to join the classroom.

2. **Post Announcements**:
   - Teachers can post announcements in classrooms with file attachments.
   - Announcements are visible to all students in the classroom.

3. **Upload Assignments**:
   - Teachers can upload assignments with file attachments.
   - Teachers can set deadlines for assignments.

4. **Create MCQ Tests**:
   - Teachers can create MCQ-based tests with multiple questions.
   - Questions can have multiple options, and students need to choose the correct answer.

### Student Features:

1. **Join Classrooms**:
   - Students can join a classroom using the room code provided by the teacher.

2. **Access Announcements**:
   - Students can view announcements and download attachments.

3. **Submit Assignments**:
   - Students can upload assignment submissions before the deadline.

4. **Take MCQ Tests**:
   - Students can participate in MCQ-based tests and submit their answers.


### 1. Clone the Repository

Clone this repository to your local machine:

```bash
git clone https://github.com/anshulmmodi/EduConnect.git
cd EduConnect
