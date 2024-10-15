from django.urls import path
from .views import sign_in, sign_up, get_user_data, create_classroom, get_teacher_data, join_classroom 
from .views import get_classroom_details,get_joined_classrooms, get_classroom_details_by_id, get_student_joined_classrooms
from .views import create_announcement, get_announcements, delete_announcement
from .views import create_assignment, get_assignments, get_assignment, delete_assignment, update_assignment
from .views import get_student_assignments, submit_assignment, get_student_submissions, delete_submission
from .views import get_classroom_students, get_assignment_submissions
from .views import create_test,get_teacher_tests,get_test_details,edit_test,delete_test,get_test_results,get_test_statistics
from .views import get_pending_tests,get_test,submit_test,check_submission,get_test_result
urlpatterns = [
    path('sign_in/', sign_in, name="sign_in"),
    path('sign_up/', sign_up, name="sign_up"),
    path('get_user_data/', get_user_data, name="get_user_data"),
    path('create_classroom/', create_classroom, name="create_classroom"),
    path('get_teacher_data/',get_teacher_data, name="get_teacher_data"),
    path('join_classroom/',join_classroom, name="join_classroom"),
    path('get_classroom_details/',get_classroom_details, name="get_classroom_details"),
    path('get_joined_classrooms/',get_joined_classrooms, name="get_joined_classrooms"),
    path('get_classroom_details_by_id/',get_classroom_details_by_id, name="get_classroom_details_by_id"),
    path('get_student_joined_classrooms/',get_student_joined_classrooms, name="get_student_joined_classrooms"),
    path('create_announcement/',create_announcement, name="create_announcement"),
    path('get_announcements/',get_announcements, name="get_announcements"),
    path('delete_announcement/', delete_announcement, name='delete_announcement'),
    path('create_assignment/',create_assignment,name="create_assignment"),
    path('get_assignments/',get_assignments,name="get_assignments"),
    path('get_assignments/', get_assignments, name='get_assignments'),
    path('get_assignment/',get_assignment,name="get_assignment"),
    path('delete_assignment/',delete_assignment,name="delete_assignment"),
    path('update_assignment/',update_assignment,name="update_assignment"),
    path('get_student_assignments/',get_student_assignments,name="get_student_assignments"),
    path('submit_assignment/',submit_assignment,name="submit_assignment"),
    path('get_student_submissions/',get_student_submissions,name="get_student_submissions"),
    path('delete_submission/',delete_submission,name="delete_submission"),
    path('get_classroom_students/',get_classroom_students,name="get_classroom_students"),
    path('get_assignment_submissions/',get_assignment_submissions,name="get_assignment_submissions"),
    path('create_test/', create_test, name='create_test'),
    path('get_teacher_tests/', get_teacher_tests, name='get_teacher_tests'),
    path('get_test_details/', get_test_details, name='get_test_details'),
    path('edit_test/', edit_test, name='edit_test'),
    path('delete_test/', delete_test, name='delete_test'),
    path('get_test_results/', get_test_results, name='get_test_results'),
    path('get_test_statistics/', get_test_statistics, name='get_test_statistics'),
    path('get_pending_tests/',get_pending_tests,name="get_pending_tests"),
    path('get_test/',get_test,name="get_test"),
    path('submit_test/',submit_test,name="submit_test"),
    path('check_submission/',check_submission,name="check_submission"),
    path('get_test_result/',get_test_result,name="get_test_result")
]