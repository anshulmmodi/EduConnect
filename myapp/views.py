from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
import re, os
from pymongo import MongoClient
import uuid
from django.core.files.storage import default_storage 
from django.core.files.base import ContentFile
from datetime import datetime
from pymongo import DESCENDING
from django.conf import settings
from bson import ObjectId

client = MongoClient("mongodb://localhost:27017/")

UPLOAD_DIR = 'uploads/announcements/'

db = client.EduConnectDatabase
user_collection = db.users
classroom_collection=db.classroom
studentclassroom_collection = db.studentclassroom
announcements_collection = db.announcements
assignments_collection = db.assignments
submissions_collection = db.submissions
test_collection = db.test
questions_collection = db.questions
testsubmission_collection = db.testsubmissions

@csrf_exempt
def sign_in(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        regex = r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$"

        # Validate email format
        if not re.match(regex, email):
            return JsonResponse({"message": "Invalid Email!"}, status=400)

        user = user_collection.find_one({"email": email})
        # Check if user exists
        if user is None:
            return JsonResponse({"message": "No user found with this email!"}, status=404)

        # Check if password matches
        if password != user.get("password"):
            return JsonResponse({"message": "Invalid password"}, status=401)

        # If everything is correct, return success response
        return JsonResponse(
            {
                "message": f"Welcome {email}",
                "user_id": user["user_id"],
                "role": user["role"],
                "success": True,
            },
            status=200,
        )

@csrf_exempt
def sign_up(request):
    if request.method == "POST":

        data = json.loads(request.body)
        email = data["email"]
        password = data["password"]
        cpass = data["cpassword"]

        re_email = r"^[^\s+@]+@[^\s@]+\.[^\s@]{2,}$"

        if not re.match(re_email, email):
            return JsonResponse(
                {"email": "Invalid Email"}
            )

        re_password = r'^(?=.*[\W_]).{6,}$'

        if not re.match(re_password, password):
            return JsonResponse(
                {
                    "password": "Invalid Password! please enter a password with 6 or more characters having at least 1 special symbol."
                }
            )

        if password != cpass:
            return JsonResponse({"cpassword": "Invalid Password! "})

        user_id = str(uuid.uuid4())

        data["user_id"] = user_id

        user_collection.insert_one(data)

        return JsonResponse(
            {
                "message": f"Welcome {email}",
                "user_id": data["user_id"],
                "success": True,
            },
            status=200,
        )

@csrf_exempt
def get_user_data(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user_id = data.get("user_id")
        user = user_collection.find_one({"user_id": user_id})
        if user:
            user["_id"] = str(user["_id"])
            return JsonResponse({"user": user})
        return JsonResponse({"message": "User not found"}, status=404)

@csrf_exempt
def create_classroom(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            name = data.get("name")
            room_code = data.get("roomCode")
            description = data.get("description")
            teacher = data.get("teacher")

            if not name or not room_code or not teacher:
                return JsonResponse({"error": "Missing required fields."}, status=400)

            if len(description) > 100:
                return JsonResponse({"error": "Description cannot exceed 100 characters."}, status=400)

            # Check if roomCode is unique
            if classroom_collection.find_one({"room_code": room_code}):
                return JsonResponse({"error": "Room code already exists. Please choose a different code."}, status=400)

            classroom_id = str(uuid.uuid4())

            classroom_data = {
                "classroom_id": classroom_id,
                "name": name,
                "room_code": room_code,
                "description": description,
                "teacher": teacher,
                "created_at": datetime.now(),
            }

            classroom_collection.insert_one(classroom_data)

            return JsonResponse(
                {
                    "message": "Classroom created successfully!",
                    "classroom_id": classroom_id,
                    "success": True,
                },
                status=201,
            )
        
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500) 
        

@csrf_exempt
def get_teacher_data(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_id = data.get("user_id")
            if not user_id:
                return JsonResponse({"error": "User ID is required."}, status=400)

            # Fetch all classrooms created by this teacher
            classrooms = list(classroom_collection.find({"teacher": user_id}))

            # Convert ObjectId to string
            for classroom in classrooms:
                classroom["_id"] = str(classroom["_id"])

            return JsonResponse({"classrooms": classrooms}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        


@csrf_exempt
def join_classroom(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            student_id = data.get("student_id")
            room_code = data.get("room_code")

            if not student_id or not room_code:
                return JsonResponse({"error": "Missing required fields."}, status=400)

            # Check if student exists
            student = user_collection.find_one({"user_id": student_id})
            if not student:
                return JsonResponse({"error": "Student not found."}, status=404)

            # Check if classroom exists by room code
            classroom = classroom_collection.find_one({"room_code": room_code})
            if not classroom:
                return JsonResponse({"error": "Classroom not found."}, status=404)

            # Check if the student is already in the classroom
            existing_entry = studentclassroom_collection.find_one({"student_id": student_id, "classroom_id": classroom["classroom_id"]})
            if existing_entry:
                return JsonResponse({"error": "Student already joined this classroom."}, status=400)

            # Add the student to the classroom
            studentclassroom_data = {
                "student_id": student_id,
                "classroom_id": classroom["classroom_id"],
                "joined_at": datetime.now()
            }
            studentclassroom_collection.insert_one(studentclassroom_data)

            return JsonResponse({"message": "Successfully joined the classroom."}, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def get_classroom_details(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            classroom_id = data.get("classroom_id")

            if not classroom_id:
                return JsonResponse({"error": "Missing classroom ID."}, status=400)

            # Fetch classroom details
            classroom = classroom_collection.find_one({"classroom_id": classroom_id})

            if not classroom:
                return JsonResponse({"error": "Classroom not found."}, status=404)

            # Convert ObjectId to string
            classroom["_id"] = str(classroom["_id"])

            return JsonResponse({"classroom": classroom}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def get_joined_classrooms(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            student_id = data.get("student_id")

            if not student_id:
                return JsonResponse({"error": "Missing student ID."}, status=400)

            # Find all classrooms the student has joined
            joined_classrooms = list(studentclassroom_collection.find({"student_id": student_id}))

            # Convert ObjectId to string and fetch classroom details
            classrooms = []
            for entry in joined_classrooms:
                classroom = classroom_collection.find_one({"classroom_id": entry["classroom_id"]})
                if classroom:
                    classroom["_id"] = str(classroom["_id"])  # Convert ObjectId to string
                    classroom["joined_at"] = entry["joined_at"]
                    classrooms.append(classroom)

            return JsonResponse({"classrooms": classrooms}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def get_classroom_details_by_id(request):
    """
    Fetch the details of a classroom by its ID.
    This view will be used for navigating to the TeacherClassroom page.
    """
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            classroom_id = data.get("classroom_id")

            if not classroom_id:
                return JsonResponse({"error": "Missing classroom ID."}, status=400)

            classroom = classroom_collection.find_one({"classroom_id": classroom_id})
            if not classroom:
                return JsonResponse({"error": "Classroom not found."}, status=404)

            # Convert ObjectId to string
            classroom["_id"] = str(classroom["_id"])

            # Return classroom details
            return JsonResponse({"classroom": classroom}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def get_student_joined_classrooms(request):
    """
    Fetch all classrooms joined by a specific student by their user ID.
    This view will be used on the student's dashboard.
    """
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            student_id = data.get("student_id")

            if not student_id:
                return JsonResponse({"error": "Missing student ID."}, status=400)

            # Fetch all classrooms joined by this student
            joined_entries = list(studentclassroom_collection.find({"student_id": student_id}))

            if not joined_entries:
                return JsonResponse({"message": "No classrooms joined by the student."}, status=404)

            classrooms = []
            for entry in joined_entries:
                classroom = classroom_collection.find_one({"classroom_id": entry["classroom_id"]})
                if classroom:
                    classroom["_id"] = str(classroom["_id"])  # Convert ObjectId to string
                    classroom["joined_at"] = entry["joined_at"]
                    classrooms.append(classroom)

            return JsonResponse({"classrooms": classrooms}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


# views.py
@csrf_exempt
def create_announcement(request):
    if request.method == "POST":
        try:
            classroom_id = request.POST.get("classroom_id")
            announcement_text = request.POST.get("announcement_text")
            teacher_id = request.POST.get("teacher_id")

            if not classroom_id or not announcement_text or not teacher_id:
                return JsonResponse({"error": "Missing required fields."}, status=400)

            # Create a new announcement
            announcement_id = str(uuid.uuid4())
            announcement_data = {
                "announcement_id": announcement_id,
                "classroom_id": classroom_id,
                "teacher_id": teacher_id,
                "announcement_text": announcement_text,
                "created_at": datetime.now(),
                "file_paths": []  # Initialize an empty list for file paths
            }

            # Handle multiple file uploads
            if 'files' in request.FILES:
                files = request.FILES.getlist('files')
                for file in files:
                    # Save the file to the MEDIA_ROOT path
                    file_name = f"{announcement_id}_{file.name}"
                    file_path = os.path.join('announcements', file_name)
                    full_path = os.path.join(settings.MEDIA_ROOT, file_path)
                    default_storage.save(full_path, ContentFile(file.read()))
                    # Save relative file path (relative to MEDIA_ROOT)
                    announcement_data["file_paths"].append(file_path) 

            # Insert the announcement data into MongoDB
            announcements_collection.insert_one(announcement_data)

            return JsonResponse({
                "message": "Announcement created successfully!", 
                "announcement_id": announcement_id, 
                "file_paths": announcement_data["file_paths"]
            }, status=201)
        
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)



@csrf_exempt
def get_announcements(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            classroom_id = data.get("classroom_id")

            if not classroom_id:
                return JsonResponse({"error": "Missing classroom ID."}, status=400)

            # Fetch announcements for the classroom sorted by created_at descending
            announcements = list(announcements_collection.find({"classroom_id": classroom_id}).sort("created_at", -1))

            # Convert ObjectId to string and include file paths
            for announcement in announcements:
                announcement["_id"] = str(announcement["_id"])
                if 'file_paths' not in announcement:
                    announcement["file_paths"] = []

            return JsonResponse({"announcements": announcements}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def delete_announcement(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            announcement_id = data.get("announcement_id")

            if not announcement_id:
                return JsonResponse({"error": "Missing announcement ID."}, status=400)

            # Delete the announcement from MongoDB
            result = announcements_collection.delete_one({"announcement_id": announcement_id})

            if result.deleted_count == 1:
                return JsonResponse({"success": True}, status=200)
            else:
                return JsonResponse({"error": "Announcement not found."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        
@csrf_exempt
def create_assignment(request):
    if request.method == "POST":
        try:
            # Ensure we can handle both `request.POST` and `request.FILES`
            title = request.POST.get("title")
            description = request.POST.get("description", "")
            classroom_id = request.POST.get("classroom_id")
            deadline = request.POST.get("deadline")
            marks = request.POST.get("marks", 0)
            teacher_id = request.POST.get("teacher_id")
            files = request.FILES.getlist("files")

            # Validate required fields
            if not title or not classroom_id or not teacher_id or not deadline:
                return JsonResponse({"error": "Missing required fields."}, status=400)

            # Prepare data to be inserted
            assignment_id = str(uuid.uuid4())
            assignment_data = {
                "assignment_id": assignment_id,
                "title": title,
                "description": description,
                "classroom_id": classroom_id,
                "deadline": deadline,
                "marks": marks,
                "teacher_id": teacher_id,
                "created_at": datetime.now(),
                "file_paths": []  # Initialize an empty list for file paths
            }

            # Save files
            for file in files:
                file_name = f"{assignment_id}_{file.name}"
                file_path = os.path.join('assignments', file_name)
                full_path = os.path.join(settings.MEDIA_ROOT, file_path)
                default_storage.save(full_path, ContentFile(file.read()))
                assignment_data["file_paths"].append(file_path)

            # Insert assignment into the database
            assignments_collection.insert_one(assignment_data)

            return JsonResponse({
                "message": "Assignment created successfully!",
                "assignment_id": assignment_id,
                "file_paths": assignment_data["file_paths"]
            }, status=201)
        
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=405)

@csrf_exempt
def get_assignments(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            teacher_id = data.get("user_id")

            if not teacher_id:
                return JsonResponse({"error": "Missing teacher ID."}, status=400)

            # Fetch all assignments created by the teacher
            assignments = list(assignments_collection.find({"teacher_id": teacher_id}).sort("created_at", -1))
            for assignment in assignments:
                assignment["_id"] = str(assignment["_id"])

            return JsonResponse({"assignments": assignments}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        

@csrf_exempt
def get_assignment(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            assignment_id = data.get("assignment_id")

            if not assignment_id:
                return JsonResponse({"error": "Missing assignment ID."}, status=400)

            # Log the assignment_id for debugging
            print(f"Fetching assignment with ID: {assignment_id}")

            # Query for assignment_id which is a UUID, not ObjectId
            assignment = assignments_collection.find_one({"assignment_id": assignment_id})

            if not assignment:
                return JsonResponse({"error": "Assignment not found."}, status=404)

            # Convert ObjectId to string
            assignment["_id"] = str(assignment["_id"])

            # Fetch the classroom name using the classroom_id
            classroom = classroom_collection.find_one({"classroom_id": assignment["classroom_id"]})
            if classroom:
                assignment["classroom_name"] = classroom["name"]
            else:
                assignment["classroom_name"] = "Unknown Classroom"

            return JsonResponse({"assignment": assignment}, status=200)

        except Exception as e:
            # Log the error for debugging
            print(f"Error occurred: {str(e)}")
            return JsonResponse({"error": str(e)}, status=500)



@csrf_exempt
def delete_assignment(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            assignment_id = data.get("assignment_id")

            if not assignment_id:
                return JsonResponse({"error": "Missing assignment ID."}, status=400)

            result = assignments_collection.delete_one({"assignment_id": assignment_id})

            if result.deleted_count == 1:
                return JsonResponse({"success": True}, status=200)
            else:
                return JsonResponse({"error": "Assignment not found."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def update_assignment(request):
    if request.method == "POST":
        try:
            data = request.POST.get("updated_data")  # Get form data
            assignment_id = request.POST.get("assignment_id")

            if not assignment_id or not data:
                return JsonResponse({"error": "Missing assignment ID or update data."}, status=400)

            updated_data = json.loads(data)
            remove_files = json.loads(request.POST.get("remove_files", "[]"))

            # Handle file uploads
            new_files = []
            if request.FILES:
                for file in request.FILES.getlist("files"):
                    file_url = handle_uploaded_file(file)
                    new_files.append(file_url)

            # Update assignment in MongoDB
            assignment = assignments_collection.find_one({"assignment_id": assignment_id})
            if not assignment:
                return JsonResponse({"error": "Assignment not found."}, status=404)

            # Remove files if specified
            if remove_files:
                for file_url in remove_files:
                    if file_url in assignment.get("files", []):
                        assignment["files"].remove(file_url)
                        # Remove the physical file
                        file_path = os.path.join(settings.MEDIA_ROOT, file_url.replace(settings.MEDIA_URL, ""))
                        if os.path.exists(file_path):
                            os.remove(file_path)

            # Add new files to the list
            updated_data["files"] = assignment.get("files", []) + new_files

            # Update assignment
            assignments_collection.update_one(
                {"assignment_id": assignment_id},
                {"$set": updated_data}
            )

            return JsonResponse({"message": "Assignment updated successfully."}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

def handle_uploaded_file(file, assignment_id):
    # Define the directory where files will be stored, creating the path if necessary
    upload_dir = os.path.join(settings.MEDIA_ROOT, 'assignments', assignment_id)
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    # Save the file with its original name
    file_path = os.path.join(upload_dir, file.name)
    
    # Write the file in chunks to avoid memory issues with large files
    with open(file_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    
    # Return the relative file path for storing in the database
    return os.path.join('assignments', assignment_id, file.name)

@csrf_exempt
def get_student_assignments(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            student_id = data.get("student_id")

            if not student_id:
                return JsonResponse({"error": "Missing student ID."}, status=400)

            # Fetch classrooms the student has joined
            student_classrooms = studentclassroom_collection.find({"student_id": student_id})

            classroom_ids = [sc['classroom_id'] for sc in student_classrooms]

            # Fetch assignments for those classrooms
            assignments = list(assignments_collection.find({"classroom_id": {"$in": classroom_ids}}))
            classrooms = {classroom['classroom_id']: classroom['name'] for classroom in classroom_collection.find({"classroom_id": {"$in": classroom_ids}})}
            for assignment in assignments:
                assignment["_id"] = str(assignment["_id"])
                assignment["classroom_name"] = classrooms.get(str(assignment["classroom_id"]), "Unknown")
                
            
            return JsonResponse({"assignments": assignments}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        
@csrf_exempt
def submit_assignment(request):
    if request.method == "POST":
        print("POST data:", request.POST)  # Log POST data
        print("FILES data:", request.FILES) 
        try:
            student_id = request.POST.get("student_id")
            assignment_id = request.POST.get("assignment_id")
            submission_text = request.POST.get("submission_text", "")
            files = request.FILES.getlist("files")
            

            # Fetch the assignment to check the deadline
            assignment = assignments_collection.find_one({"assignment_id": assignment_id})
            # if not assignment:
            #     return JsonResponse({"error": "Assignment not found"}, status=404)

            # Process and save files
            file_paths = []
            for file in files:
                file_name = f"{assignment_id}_{file.name}"
                file_path = os.path.join('submissions', student_id, file_name)
                full_path = os.path.join(settings.MEDIA_ROOT, file_path)
                default_storage.save(full_path, ContentFile(file.read()))
                file_paths.append(file_path)

            # Save the submission in the database
            submission = {
                "student_id": student_id,
                "assignment_id": assignment_id,
                "submission_text": submission_text,
                "file_paths": file_paths,
                "submitted_at": datetime.now(),
                "is_late": datetime.now()
            }
            submission_id = submissions_collection.insert_one(submission).inserted_id
            updated_submissions = list(submissions_collection.find({"student_id": student_id, "assignment_id": assignment_id}))
            return JsonResponse({"message": "Submission successful"}, status=200)

        except Exception as e:
            print(e)
            return JsonResponse({"error": str(e)}, status=500)
        
@csrf_exempt
def get_student_submissions(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            student_id = data.get("student_id")
            assignment_id = data.get("assignment_id")

            submissions = list(submissions_collection.find({"student_id": student_id, "assignment_id": assignment_id}))
            for submission in submissions:
                submission["_id"] = str(submission["_id"])

            return JsonResponse({"submissions": submissions}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def delete_submission(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            submission_id = data.get("submission_id")

            # Find and delete the submission
            submission = submissions_collection.find_one({"_id": ObjectId(submission_id)})
            if submission:
                submissions_collection.delete_one({"_id": ObjectId(submission_id)})

                # Optionally, delete associated files
                for file_path in submission.get('file_paths', []):
                    if os.path.exists(file_path):
                        os.remove(file_path)

                return JsonResponse({"message": "Submission deleted successfully"}, status=200)
            else:
                return JsonResponse({"error": "Submission not found"}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def get_classroom_students(request):
    if request.method == "POST":
        data = json.loads(request.body)
        classroom_id = data.get("classroom_id")
        
        # Fetch students who joined this classroom
        students_in_classroom = studentclassroom_collection.find({"classroom_id": classroom_id})
        

        # List students' details
        student_list = []
        for student_classroom in students_in_classroom:
            
            student_id = student_classroom["student_id"]
            
            # Fetch student details from the students collection
            student = user_collection.find_one({"user_id": student_id})
            if student:
                student_info = {
                    "student_id": student["user_id"],
                    "student_name": f"{student.get('fname', '')} {student.get('lname', '')}",
                    "email": student.get("email", ""),
                }
                student_list.append(student_info)

        return JsonResponse({"students": student_list}, status=200)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=400)
    
@csrf_exempt
def get_assignment_submissions(request):
    if request.method == "POST":
        try:
            # Parse the request body for the assignment ID
            body = json.loads(request.body)
            assignment_id = body.get("assignment_id")
            
            # Ensure assignment_id is provided
            if not assignment_id:
                return JsonResponse({"error": "Assignment ID is required"}, status=400)

            # Fetch the classroom ID based on the assignment (assuming classroom_id is stored in assignment)
            assignment = assignments_collection.find_one({"assignment_id": assignment_id})
            
            if not assignment:
                return JsonResponse({"error": "Assignment not found"}, status=404)
            
            classroom_id = assignment["classroom_id"]
            
            # Fetch students who joined the classroom
            students_in_classroom = studentclassroom_collection.find({"classroom_id": classroom_id})
            
            
            student_list = []
            for student_classroom in students_in_classroom:
                student_id = student_classroom["student_id"]

                # Fetch student details
                student = user_collection.find_one({"user_id": student_id})
                
                if student:
                    student_info = {
                        "student_id": student["user_id"],
                        "student_name": f"{student.get('fname', '')} {student.get('lname', '')}",
                        "status": "Pending",  
                        "submissions": []
                    }

                    # Fetch all submissions for this assignment by this student
                    submissions = list(submissions_collection.find({
                        "assignment_id": assignment_id,
                        "student_id": student_id
                    }))
                    print("Submissions for student:", student_id, submissions,"#"*40)
                    
                    submission_list = []
                    if len(submissions) > 0:  
                        student_info["status"] = "Completed"  # Update status to completed if any submission exists
                        for submission in submissions:
                            submission_info = {
                                "files": submission.get("file_paths", []),
                                "text": submission.get("submission_text", ""),
                                "submission_time": submission.get("submitted_at", datetime.utcnow())
                            }
                            submission_list.append(submission_info)
                    # Add submissions to the student info
                    student_info["submissions"] = submission_list
                    student_list.append(student_info)

            # Return the data in the required format
            return JsonResponse({"students": student_list}, status=200)
        except Exception as e:
            print(e)
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)

@csrf_exempt
def create_test(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            # Extract test data from request
            test_title = data.get('title')
            classroom_id = data.get('classroom_id')
            questions = data.get('questions')  # List of questions
            time_limit = data.get('time_limit')
            shuffle_questions = data.get('shuffle_questions', False)
            randomize_options = data.get('randomize_options', False)
            teacher_id = data.get('teacher_id')  # Added teacher_id

            if not teacher_id:
                return JsonResponse({"error": "Teacher ID is required."}, status=400)

            # Insert the new test document
            test = {
                "title": test_title,
                "classroom_id": classroom_id,
                "questions": questions,
                "time_limit": time_limit,
                "shuffle_questions": shuffle_questions,
                "randomize_options": randomize_options,
                "teacher_id": teacher_id  # Include teacher_id
            }
            test_id = test_collection.insert_one(test).inserted_id

            return JsonResponse({"message": "Test created successfully", "test_id": str(test_id)}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=400)

@csrf_exempt
def get_teacher_tests(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            teacher_id = data.get('teacher_id')

            # Fetch tests created by this teacher
            tests = test_collection.find({"teacher_id": teacher_id})
            test_list = []
            for test in tests:
                test_info = {
                    "test_id": str(test['_id']),
                    "title": test.get('title'),
                    "classroom_id": test.get('classroom_id')
                }
                test_list.append(test_info)

            return JsonResponse({"tests": test_list}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=400)

@csrf_exempt
def get_test_details(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            test_id = data.get('test_id')

            # Fetch the test document from MongoDB
            test = test_collection.find_one({"_id": ObjectId(test_id)})
            if not test:
                return JsonResponse({"error": "Test not found"}, status=404)

            test_info = {
                "test_id": str(test['_id']),
                "title": test.get('title'),
                "classroom_id": test.get('classroom_id'),
                "questions": test.get('questions'),
                "time_limit": test.get('time_limit'),
                "shuffle_questions": test.get('shuffle_questions'),
                "randomize_options": test.get('randomize_options')
            }

            return JsonResponse({"test": test_info}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=400)

@csrf_exempt
def edit_test(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            test_id = data.get('test_id')
            test_title = data.get('testTitle')
            questions = data.get('questions')
            classroom_id = data.get('classroomId')
            time_limit = data.get('timeLimit')
            shuffle_questions = data.get('shuffleQuestions', False)
            randomize_options = data.get('randomizeOptions', False)
            teacher_id = data.get('teacher_id')
            print(test_id)
            # Prepare update data
            updated_data = {
                "title": test_title,
                "classroom_id": classroom_id,
                "questions": questions,
                "time_limit": time_limit,
                "shuffle_questions": shuffle_questions,
                "randomize_options": randomize_options,
                "teacher_id": teacher_id
            }
            print(updated_data,"*"*40)

            # Remove any keys with None values
            updated_data = {k: v for k, v in updated_data.items() if v is not None}

            # Update the test document
            result = test_collection.update_one(
                {"_id": ObjectId(test_id)},
                {"$set": updated_data}
            )

            if result.matched_count > 0:
                return JsonResponse({"message": "Test updated successfully"}, status=200)
            else:
                return JsonResponse({"error": "Test not found"}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)


@csrf_exempt
def delete_test(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            test_id = data.get('test_id')

            # Delete the test document from MongoDB
            result = test_collection.delete_one({"_id": ObjectId(test_id)})

            if result.deleted_count == 0:
                return JsonResponse({"error": "Test not found"}, status=404)

            return JsonResponse({"message": "Test deleted successfully"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=400)

@csrf_exempt
def get_test_results(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            test_id = data.get('test_id')

            # Fetch submissions for the specific test
            submissions = testsubmission_collection.find({"test_id": ObjectId(test_id)})
            results = []
            for submission in submissions:
                print(submission)
                student_id = submission.get("student_id")
                student = user_collection.find_one({"user_id": student_id})
                
                result_info = {
                    "student_name": student.get("fname")+" "+student.get("lname"),
                    "score": submission.get("score"),
                    "total_questions": submission.get("max_score"),
                }
                results.append(result_info)

            return JsonResponse({"results": results}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=400)
@csrf_exempt
def get_test_statistics(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            test_id = data.get('test_id')

            # Calculate test statistics
            submissions = db['submissions'].find({"test_id": test_id})
            scores = [sub.get('score', 0) for sub in submissions]

            if not scores:
                return JsonResponse({"message": "No submissions yet"}, status=200)

            avg_score = sum(scores) / len(scores)
            highest_score = max(scores)
            lowest_score = min(scores)

            # Fetch question difficulty (i.e., how many students got it right)
            test = test_collection.find_one({"_id": ObjectId(test_id)})
            questions = test.get("questions", [])
            question_stats = []
            for question in questions:
                correct_count = db['submissions'].count_documents({
                    "test_id": test_id,
                    "answers": {"$elemMatch": {"question_id": question['id'], "correct": True}}
                })
                total_students = db['submissions'].count_documents({"test_id": test_id})
                difficulty = correct_count / total_students if total_students else 0
                question_stats.append({"question_text": question['text'], "difficulty": difficulty})

            return JsonResponse({
                "average_score": avg_score,
                "highest_score": highest_score,
                "lowest_score": lowest_score,
                "question_stats": question_stats
            }, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=400)


@csrf_exempt
def get_pending_tests(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            student_id = data.get('student_id')

            if not student_id:
                return JsonResponse({"error": "Student ID is required."}, status=400)

            # Fetch the tests assigned to the classrooms the student belongs to
            # Assuming you have a student_classroom table or similar structure
            student_classrooms = studentclassroom_collection.find({"student_id": student_id})
            classroom_ids = [str(sc['classroom_id']) for sc in student_classrooms]
            
            # Fetch all tests that belong to the classrooms and are pending
            tests = test_collection.find({"classroom_id": {"$in": classroom_ids}})
            
            pending_tests = []
            
            for test in tests:
                # Check if the student has already completed this test
                if not testsubmission_collection.find_one({"test_id": test["_id"], "student_id": student_id}):
                    test['_id'] = str(test['_id'])
                    test['classroom_id'] = str(test['classroom_id'])
                    pending_tests.append(test)
            
            
            return JsonResponse({"pending_tests": pending_tests}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=400)

@csrf_exempt
def get_test(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            test_id = data.get('test_id')

            if not test_id:
                return JsonResponse({"error": "Test ID is required."}, status=400)

            # Fetch the test based on the test_id
            test = test_collection.find_one({"_id": ObjectId(test_id)})

            if not test:
                return JsonResponse({"error": "Test not found."}, status=404)

            # Convert ObjectId fields to strings for JSON serialization
            test['_id'] = str(test['_id'])
            test['classroom_id'] = str(test['classroom_id'])
            test['teacher_id'] = str(test['teacher_id'])

            # Generate a unique id for each question if it doesn't have one
            for question in test['questions']:
                if '_id' not in question:
                    question['_id'] = str(uuid.uuid4())  # Generate a unique ID using UUID

            return JsonResponse(test, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def submit_test(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            test_id = data.get('test_id')
            student_id = data.get('student_id')
            answers = data.get('answers')
            max
            print(answers)
            if not test_id or not student_id or not answers:
                return JsonResponse({"error": "Test ID, Student ID, and answers are required."}, status=400)
                
            # Fetch the test details
            test = test_collection.find_one({"_id": ObjectId(test_id)})
            
            if not test:
                return JsonResponse({"error": "Test not found."}, status=404)

            existing_submission = testsubmission_collection.find_one({
                "test_id": ObjectId(test_id),
                "student_id": student_id
            })
            
            score = 0
            max_score = len(test['questions'])

            for index, question in enumerate(test['questions']):
                if str(answers[str(index)]) == question['correct']:
                    score += 1
            print(score)


            testsubmission_collection.insert_one({
                "test_id": ObjectId(test_id),
                "student_id": student_id,
                "score": score,
                "max_score": max_score
            })

            return JsonResponse({"message": "Test submitted successfully!", "score": score, "max_score": max_score}, status=200)

        except Exception as e:
            print("Error:", str(e))  # Debugging line
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def check_submission(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            test_id = data.get('test_id')
            student_id = data.get('student_id')

            if not test_id or not student_id:
                return JsonResponse({"error": "Test ID and Student ID are required."}, status=400)

            # Check for existing submission
            existing_submission = testsubmission_collection.find_one({
                "test_id": ObjectId(test_id),
                "student_id": student_id
            })

            if existing_submission:
                return JsonResponse({"submitted": True}, status=200)

            return JsonResponse({"submitted": False}, status=200)

        except Exception as e:
            print("Error:", str(e))
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def get_test_result(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            test_id = data.get('test_id')
            student_id = data.get('student_id')
            print(data)

            # Fetch the test from the 'test' collection
            test = test_collection.find_one({"_id": ObjectId(test_id)})
            if not test:
                return JsonResponse({'error': 'Test not found'}, status=404)

            # Fetch the test submission from 'testsubmissions' collection
            submission = testsubmission_collection.find_one({
                "test_id": ObjectId(test_id),
                "student_id": student_id
            })
            print(submission)

            if not submission:
                return JsonResponse({'error': 'Test submission not found'}, status=404)

            # Prepare the result
            result = {
                "test_name": test.get("title"),
                "score": submission.get("score"),
                "max_score": submission.get("max_score")
            }

            return JsonResponse(result, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)