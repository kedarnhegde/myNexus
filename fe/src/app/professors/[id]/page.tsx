'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProfessorPage() {
  const params = useParams();
  const router = useRouter();
  const [professor, setProfessor] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetchProfessor();
  }, [params.id]);

  const fetchProfessor = async () => {
    try {
      const res = await fetch(`http://localhost:8000/professors/${params.id}`);
      const data = await res.json();
      setProfessor(data.professor);
      setCourses(Array.isArray(data.courses) ? data.courses : []);
    } catch (error) {
      console.error('Error fetching professor:', error);
      setCourses([]);
    }
  };

  if (!professor) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button onClick={() => router.push('/courses')} className="text-gray-400 hover:text-white mb-4">
            ← Back to Search
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white">{professor.name}</h1>
              <p className="text-xl text-gray-400 mt-2">{professor.department}</p>
              {professor.email && (
                <p className="text-gray-400 mt-1">📧 {professor.email}</p>
              )}
            </div>
            {professor.total_reviews > 0 && (
              <div className="text-right">
                <div className="text-5xl font-bold" style={{color: '#A6192E'}}>{professor.avg_rating.toFixed(1)}</div>
                <div className="text-sm text-gray-400 mt-1">{professor.total_reviews} reviews</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg p-5 border border-gray-800 mb-6">
              <h2 className="font-bold text-lg mb-4 text-white">Courses Taught</h2>
              <div className="space-y-3">
                {courses.length === 0 ? (
                  <p className="text-gray-400">No courses found.</p>
                ) : (
                  courses.map((course) => (
                    <div
                      key={course.section_id}
                      className="border border-gray-800 rounded-lg p-4 hover:bg-gray-800 cursor-pointer"
                      onClick={() => router.push(`/courses/${course.course_id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-white">
                            {course.course_code} - {course.course_title}
                          </h3>
                          <div className="text-sm text-gray-400 mt-1">
                            Section {course.section_number} • {course.semester}
                          </div>
                          <div className="text-sm text-gray-400">
                            {course.schedule} • {course.location}
                          </div>
                          <div className="flex gap-2 mt-2">
                            {course.exam_format && (
                              <span className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded">
                                {course.exam_format}
                              </span>
                            )}
                            {course.grading_style && (
                              <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">
                                {course.grading_style}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {professor.total_reviews > 0 && (
              <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
                <h3 className="font-bold text-white mb-4">Professor Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Overall Rating</span>
                      <span className="font-bold" style={{color: '#A6192E'}}>{professor.avg_rating.toFixed(1)}/5.0</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{backgroundColor: '#A6192E', width: `${(professor.avg_rating / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Difficulty</span>
                      <span className="font-bold text-white">{professor.avg_difficulty.toFixed(1)}/5.0</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gray-600 h-2 rounded-full"
                        style={{ width: `${(professor.avg_difficulty / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Would Take Again</span>
                      <span className="font-bold" style={{color: '#A6192E'}}>{professor.would_take_again_percent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{backgroundColor: '#A6192E', width: `${professor.would_take_again_percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-800">
                    <div className="text-sm text-gray-400">Based on {professor.total_reviews} reviews</div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-lg p-5 border" style={{backgroundColor: 'rgba(166, 25, 46, 0.1)', borderColor: 'rgba(166, 25, 46, 0.3)'}}>
              <h3 className="font-bold text-white mb-2">📝 Leave a Review</h3>
              <p className="text-sm text-gray-300">
                Help other students by sharing your experience with this professor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
