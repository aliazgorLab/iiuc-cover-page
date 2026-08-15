import Teacher from '../models/Teacher.js';

export const getTeachers = async (req, res) => {
  try {
    const { query, limit = 50 } = req.query;
    let filter = { status: 'ACTIVE' };

    if (query) {
      const regex = new RegExp(query.trim(), 'i');
      filter.$or = [{ name: regex }, { department: regex }, { designation: regex }];
    }

    const teachers = await Teacher.find(filter).limit(parseInt(limit));
    const formatted = teachers.map((t) => ({
      _id: t._id,
      name: t.name || '',
      designation: t.designation || '',
      department: t.department || '',
      email: t.email || '',
      avatar: t.avatar || t.profileImage || '',
      profileImage: t.profileImage || t.avatar || '',
      faculty: t.faculty || 'FSE',
      status: t.status || 'ACTIVE',
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTeacher = async (req, res) => {
  try {
    const { name, designation, department } = req.body;
    if (!name || !designation || !department) {
      return res.status(400).json({ message: 'Name, designation, and department are required' });
    }

    const teacher = await Teacher.create({ name, designation, department });
    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Teacher.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
