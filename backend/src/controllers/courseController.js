import Course from '../models/Course.js';

export const getCourses = async (req, res) => {
  try {
    const { query, field, department, limit = 50 } = req.query;
    let filter = {};

    if (department && department !== 'ALL') {
      const deptRegex = new RegExp(department.trim(), 'i');
      filter.$or = [{ departments: { $in: [deptRegex] } }, { department: deptRegex }];
    }

    if (query) {
      const regex = new RegExp(query.trim(), 'i');
      const queryFilter = [
        { code: regex },
        { courseCode: regex },
        { title: regex },
        { courseTitle: regex },
      ];
      if (filter.$or) {
        filter = { $and: [{ $or: filter.$or }, { $or: queryFilter }] };
      } else {
        filter.$or = queryFilter;
      }
    }

    const courses = await Course.find(filter).limit(parseInt(limit));
    const formatted = courses.map((c) => {
      const depts = c.departments && c.departments.length > 0
        ? c.departments
        : [c.department ? c.department.replace(/^Dept\.\s*of\s*/i, '').trim() : 'CSE'];
      return {
        _id: c._id,
        code: c.code || c.courseCode || '',
        title: c.title || c.courseTitle || '',
        courseCode: c.courseCode || c.code || '',
        courseTitle: c.courseTitle || c.title || '',
        credit: c.credit || 3,
        department: c.department || '',
        departments: depts,
        departmentCount: c.departmentCount || depts.length || 1,
        semester: c.semester || '',
        assignedTeacher: c.assignedTeacher || '',
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { code, title, courseCode, courseTitle, department, semester, credit } = req.body;
    const finalCode = (code || courseCode || '').trim();
    const finalTitle = (title || courseTitle || '').trim();

    if (!finalCode || !finalTitle) {
      return res.status(400).json({ message: 'Course code and course title are required' });
    }

    const course = await Course.create({
      code: finalCode,
      title: finalTitle,
      courseCode: finalCode,
      courseTitle: finalTitle,
      department,
      semester,
      credit,
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
