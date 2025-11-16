'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CoursesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [courses, setCourses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [popularProfs, setPopularProfs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState<'courses' | 'professors'>('courses');

  useEffect(() => {
    fetchDepartments();
    fetchPopularProfessors();
    searchCourses();
  }, []);

  useEffect(() => {
    if (activeTab === 'courses') {
      searchCourses();
    } else {
      searchProfessors();
    }
  }, [searchQuery, selectedDept, activeTab]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('http://localhost:8000/departments');
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchPopularProfessors = async () => {
    try {
      const res = await fetch('http://localhost:8000/professors/popular');
      const data = await res.json();
      setPopularProfs(data);
    } catch (error) {
      console.error('Error fetching popular professors:', error);
    }
  };

  const searchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedDept) params.append('department', selectedDept);
      
      const res = await fetch(`http://localhost:8000/courses/search?${params}`);
      const data = await res.json();
      console.log('Courses fetched:', data);
      setCourses(data);
    } catch (error) {
      console.error('Error searching courses:', error);
    }
  };

  const searchProfessors = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedDept) params.append('department', selectedDept);
      
      const res = await fetch(`http://localhost:8000/professors/search?${params}`);
      const data = await res.json();
      setProfessors(data);
    } catch (error) {
      console.error('Error searching professors:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">CourseCompass</h1>
              <p className="text-gray-400 mt-1">SDSU Course & Professor Reviews</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              ← Back
            </button>
          </div>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder={activeTab === 'courses' ? 'Search courses (e.g., CS-160, Data Structures)' : 'Search professors'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('courses')}
              className={`pb-3 px-2 font-medium ${
                activeTab === 'courses'
                  ? 'border-b-2 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              style={activeTab === 'courses' ? {borderColor: '#A6192E'} : {}}
            >
              Courses
            </button>
            <button
              onClick={() => setActiveTab('professors')}
              className={`pb-3 px-2 font-medium ${
                activeTab === 'professors'
                  ? 'border-b-2 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              style={activeTab === 'professors' ? {borderColor: '#A6192E'} : {}}
            >
              Professors
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'courses' ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-400 mb-2">Found {courses.length} courses</div>
                {courses.length === 0 ? (
                  <div className="bg-gray-900 rounded-lg p-8 text-center text-gray-400">
                    Loading courses...
                  </div>
                ) : (
                  courses.map((course: any) => (
                    <div
                      key={course.id}
                      onClick={() => router.push(`/courses/${course.id}`)}
                      className="bg-gray-900 rounded-lg p-5 hover:bg-gray-800 transition cursor-pointer border border-gray-800"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-white">{course.code}</h3>
                          <p className="text-gray-300 mt-1">{course.title}</p>
                          <p className="text-sm text-gray-400 mt-2">{course.description}</p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full" style={{backgroundColor: 'rgba(166, 25, 46, 0.2)', color: '#A6192E'}}>
                          {course.department}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {professors.length === 0 ? (
                  <div className="bg-gray-900 rounded-lg p-8 text-center text-gray-400">
                    No professors found. Try a different search.
                  </div>
                ) : (
                  professors.map((prof: any) => (
                    <div
                      key={prof.id}
                      onClick={() => router.push(`/professors/${prof.id}`)}
                      className="bg-gray-900 rounded-lg p-5 hover:bg-gray-800 transition cursor-pointer border border-gray-800"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-white">{prof.name}</h3>
                          <p className="text-sm text-gray-400 mt-1">{prof.department}</p>
                          {prof.total_reviews > 0 && (
                            <div className="flex gap-4 mt-3 text-sm">
                              <div>
                                <span className="text-gray-500">Rating: </span>
                                <span className="font-semibold" style={{color: '#A6192E'}}>{prof.avg_rating.toFixed(1)}/5.0</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Difficulty: </span>
                                <span className="font-semibold text-white">{prof.avg_difficulty.toFixed(1)}/5.0</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Would take again: </span>
                                <span className="font-semibold" style={{color: '#A6192E'}}>{prof.would_take_again_percent.toFixed(0)}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{prof.avg_rating.toFixed(1)}</div>
                          <div className="text-xs text-gray-400">{prof.total_reviews} reviews</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
              <h3 className="font-bold text-white mb-3">🔥 Popular Professors</h3>
              <div className="space-y-3">
                {popularProfs.length > 0 ? popularProfs.slice(0, 5).map((prof: any) => (
                  <div
                    key={prof.id}
                    onClick={() => router.push(`/professors/${prof.id}`)}
                    className="cursor-pointer hover:bg-gray-800 p-2 rounded"
                  >
                    <div className="font-medium text-sm text-white">{prof.name}</div>
                    <div className="text-xs text-gray-400">{prof.department}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold" style={{color: '#A6192E'}}>{prof.avg_rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-400">{prof.total_reviews} reviews</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-400">No professors yet</p>
                )}
              </div>
            </div>

            <div className="rounded-lg p-5 border" style={{backgroundColor: 'rgba(166, 25, 46, 0.1)', borderColor: 'rgba(166, 25, 46, 0.3)'}}>
              <h3 className="font-bold text-white mb-2">💡 Tips</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Read multiple reviews for balanced perspective</li>
                <li>• Check syllabus for exam format</li>
                <li>• Compare sections by different professors</li>
                <li>• Ask questions in the Q&A forum</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
