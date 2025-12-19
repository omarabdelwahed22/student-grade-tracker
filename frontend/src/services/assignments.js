import api from './api';

export const createAssignment = async (title, description, courseId, dueDate, category, maxScore, weight) => {
  const response = await api.post('/assignments', {
    title,
    description,
    courseId,
    dueDate,
    category,
    maxScore,
    weight
  });
  return response.data;
};

export const getAssignmentsByCourse = async (courseId) => {
  const response = await api.get(`/assignments/course/${courseId}`);
  return response.data;
};

export const getUpcomingAssignments = async () => {
  const response = await api.get('/assignments/upcoming');
  return response.data;
};

export const updateAssignment = async (id, data) => {
  const response = await api.put(`/assignments/${id}`, data);
  return response.data;
};

export const deleteAssignment = async (id) => {
  const response = await api.delete(`/assignments/${id}`);
  return response.data;
};
