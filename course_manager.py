"""Simple course manager utility for tracking courses and progress."""


class Course:
    def __init__(self, title, instructor, total_lessons):
        self.title = title
        self.instructor = instructor
        self.total_lessons = total_lessons
        self.completed_lessons = 0

    def complete_lesson(self):
        if self.completed_lessons < self.total_lessons:
            self.completed_lessons += 1

    def progress_percent(self):
        if self.total_lessons == 0:
            return 0.0
        return (self.completed_lessons / self.total_lessons) * 100.0

    def is_complete(self):
        return self.completed_lessons >= self.total_lessons

    def __repr__(self):
        return f"Course(title={self.title!r}, progress={self.progress_percent()}%)"


class CourseManager:
    def __init__(self):
        self.courses = []

    def add_course(self, course):
        self.courses.append(course)

    def get_completed_courses(self):
        return [c for c in self.courses if c.is_complete()]

    def get_in_progress_courses(self):
        return [c for c in self.courses if 0 < c.completed_lessons and not c.is_complete()]

    def overall_progress(self):
        if not self.courses:
            return 0.0
        return sum(c.progress_percent() for c in self.courses) / len(self.courses)
