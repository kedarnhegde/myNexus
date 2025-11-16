'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'reviews' | 'qa'>('reviews');

  useEffect(() => {
    fetchCourse();
  }, [params.id]);

  useEffect(() => {
    if (selectedSection) {
      fetchReviews();
      fetchQuestions();
    }
  }, [selectedSection]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`http://localhost:8000/courses/${params.id}`);
      const data = await res.json();
      setCourse(data.course);
      setSections(data.sections);
      if (data.sections.length > 0) {
        setSelectedSection(data.sections[0]);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:8000/sections/${selectedSection.section_id}/reviews`);
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`http://localhost:8000/sections/${selectedSection.section_id}/questions`);
      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  if (!course) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 'N/A';
  const avgDifficulty = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.difficulty, 0) / reviews.length).toFixed(1) : 'N/A';
  const wouldTakeAgain = reviews.length > 0 ? Math.round((reviews.filter(r => r.would_take_again).length / reviews.length) * 100) : 0;
  const attendanceMandatory = reviews.length > 0 ? Math.round((reviews.filter(r => r.attendance_mandatory).length / reviews.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button onClick={() => router.push('/courses')} className="text-gray-400 hover:text-white mb-4">
            ← Back to Courses
          </button>
          <h1 className="text-3xl font-bold text-white">{course.code}</h1>
          <p className="text-xl text-gray-300 mt-2">{course.title}</p>
          <p className="text-gray-400 mt-2">{course.description}</p>
          <div className="flex gap-2 mt-3">
            <span className="text-sm px-3 py-1 rounded-full" style={{backgroundColor: 'rgba(166, 25, 46, 0.2)', color: '#A6192E'}}>{course.department}</span>
            <span className="text-sm bg-gray-800 text-gray-300 px-3 py-1 rounded-full">{course.credits} Credits</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg p-5 border border-gray-800 mb-6">
              <h2 className="font-bold text-lg mb-3 text-white">Select Section</h2>
              <div className="space-y-2">
                {sections.map((section) => (
                  <div
                    key={section.section_id}
                    onClick={() => setSelectedSection(section)}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      selectedSection?.section_id === section.section_id
                        ? 'bg-gray-800 border-gray-700'
                        : 'border-gray-800 hover:bg-gray-800'
                    }`}
                    style={selectedSection?.section_id === section.section_id ? {borderColor: '#A6192E'} : {}}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-white">
                          Section {section.section_number} - {section.professor_name}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">{section.semester}</div>
                        <div className="text-sm text-gray-400">{section.schedule} • {section.location}</div>
                        <div className="flex gap-2 mt-2">
                          {section.exam_format && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{section.exam_format}</span>
                          )}
                          {section.grading_style && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{section.grading_style}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">{section.professor_rating.toFixed(1)}</div>
                        <div className="text-xs text-gray-400">Prof Rating</div>
                      </div>
                    </div>
                    {section.syllabus_url && (
                      <a
                        href={section.syllabus_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline mt-2 inline-block"
                        style={{color: '#A6192E'}}
                        onClick={(e) => e.stopPropagation()}
                      >
                        📄 View Syllabus
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedSection && (
              <>
                <div className="flex gap-4 border-b border-gray-800 bg-gray-900 px-5 rounded-t-lg">
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-3 px-2 font-medium ${
                      activeTab === 'reviews'
                        ? 'text-white border-b-2'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                    style={activeTab === 'reviews' ? {borderColor: '#A6192E'} : {}}
                  >
                    Reviews ({reviews.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('qa')}
                    className={`pb-3 px-2 font-medium ${
                      activeTab === 'qa'
                        ? 'text-white border-b-2'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                    style={activeTab === 'qa' ? {borderColor: '#A6192E'} : {}}
                  >
                    Class Q&A ({questions.length})
                  </button>
                </div>

                <div className="bg-gray-900 rounded-b-lg border-x border-b border-gray-800">
                  {activeTab === 'reviews' ? (
                    <div className="p-5 space-y-4">
                      {reviews.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No reviews yet. Be the first to review!</p>
                      ) : (
                        reviews.map((review) => (
                          <div key={review.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-medium text-white">{review.username}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold" style={{color: '#A6192E'}}>{review.rating.toFixed(1)}/5.0</div>
                                {review.grade_received && (
                                  <div className="text-sm font-semibold" style={{color: '#A6192E'}}>Grade: {review.grade_received}</div>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-gray-500">Difficulty: </span>
                                <span className="font-semibold text-white">{review.difficulty.toFixed(1)}/5.0</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Workload: </span>
                                <span className="font-semibold text-white">{review.workload.toFixed(1)}/5.0</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Would take again: </span>
                                <span className="font-semibold text-white">
                                  {review.would_take_again ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-300 mb-2">{review.content}</p>
                            {review.tags && (
                              <div className="flex gap-2 flex-wrap">
                                {review.tags.split(',').map((tag: string, i: number) => (
                                  <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="p-5 space-y-4">
                      {questions.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No questions yet. Ask the first question!</p>
                      ) : (
                        questions.map((question) => (
                          <div key={question.id} className="border border-gray-800 rounded-lg p-4 hover:bg-gray-800">
                            <h3 className="font-semibold text-white">{question.title}</h3>
                            <p className="text-sm text-gray-400 mt-2">{question.content}</p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                              <span>by {question.username}</span>
                              <span>•</span>
                              <span>↑ {question.upvotes}</span>
                              <span>•</span>
                              <span>{question.answer_count} answers</span>
                              <span>•</span>
                              <span>{new Date(question.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            {selectedSection && reviews.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
                <h3 className="font-bold text-white mb-4">Section Stats</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Overall Rating</span>
                      <span className="font-bold" style={{color: '#A6192E'}}>{avgRating}/5.0</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Difficulty</span>
                      <span className="font-bold text-white">{avgDifficulty}/5.0</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Would Take Again</span>
                      <span className="font-bold" style={{color: '#A6192E'}}>{wouldTakeAgain}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Attendance</span>
                      <span className="font-bold text-white">{attendanceMandatory > 50 ? 'Mandatory' : 'Not Strict'}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-800">
                    <div className="text-sm text-gray-400">Based on {reviews.length} reviews</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
