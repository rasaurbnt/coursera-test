"""Tests for course_manager.py"""
import pytest
from course_manager import Course, CourseManager


class TestCourse:
    def test_initial_progress_is_zero(self):
        course = Course("Python Basics", "Alice", 10)
        assert course.progress_percent() == 0.0

    def test_progress_after_lessons(self):
        course = Course("Python Basics", "Alice", 4)
        course.complete_lesson()
        course.complete_lesson()
        assert course.progress_percent() == 50.0

    def test_full_completion(self):
        course = Course("Python Basics", "Alice", 2)
        course.complete_lesson()
        course.complete_lesson()
        assert course.progress_percent() == 100.0
        assert course.is_complete()

    def test_cannot_exceed_total_lessons(self):
        course = Course("Python Basics", "Alice", 1)
        course.complete_lesson()
        course.complete_lesson()  # extra call should be ignored
        assert course.completed_lessons == 1

    def test_zero_lesson_course(self):
        course = Course("Empty Course", "Bob", 0)
        assert course.progress_percent() == 0.0
        assert course.is_complete()

    def test_is_not_complete_when_partial(self):
        course = Course("Python Basics", "Alice", 5)
        course.complete_lesson()
        assert not course.is_complete()


class TestCourseManager:
    def setup_method(self):
        self.manager = CourseManager()

    def test_overall_progress_no_courses(self):
        assert self.manager.overall_progress() == 0.0

    def test_get_completed_courses_empty(self):
        assert self.manager.get_completed_courses() == []

    def test_get_in_progress_courses_empty(self):
        assert self.manager.get_in_progress_courses() == []

    def test_overall_progress_with_courses(self):
        c1 = Course("A", "X", 2)
        c1.complete_lesson()
        c1.complete_lesson()  # 100%

        c2 = Course("B", "Y", 4)
        c2.complete_lesson()  # 25%

        self.manager.add_course(c1)
        self.manager.add_course(c2)
        assert self.manager.overall_progress() == 62.5

    def test_get_completed_courses(self):
        c1 = Course("A", "X", 1)
        c1.complete_lesson()
        c2 = Course("B", "Y", 2)

        self.manager.add_course(c1)
        self.manager.add_course(c2)
        assert self.manager.get_completed_courses() == [c1]

    def test_get_in_progress_courses(self):
        c_done = Course("Done", "X", 1)
        c_done.complete_lesson()

        c_started = Course("Started", "Y", 3)
        c_started.complete_lesson()

        c_not_started = Course("Not Started", "Z", 5)

        for c in [c_done, c_started, c_not_started]:
            self.manager.add_course(c)

        assert self.manager.get_in_progress_courses() == [c_started]
