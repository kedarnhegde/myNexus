'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Modal from '@/components/Modal';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeSection') || 'home';
    }
    return 'home';
  });
  const [connections, setConnections] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [filters, setFilters] = useState({gender: '', year: '', course: '', tag: ''});
  const [yearFilter, setYearFilter] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({username: '', email: '', oldPassword: '', newPassword: '', confirmPassword: ''});
  const [modal, setModal] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info'}>({isOpen: false, title: '', message: '', type: 'info'});
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPost, setNewPost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showComments, setShowComments] = useState<{[key: number]: boolean}>({});
  const [comments, setComments] = useState<{[key: number]: any[]}>({});
  const [newComment, setNewComment] = useState<{[key: number]: string}>({});
  const [clubs, setClubs] = useState<any[]>([]);
  const [clubsLoading, setClubsLoading] = useState(true);
  const [clubFilter, setClubFilter] = useState('All');
  const [eventModal, setEventModal] = useState({isOpen: false, eventName: '', action: ''});
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<{[key: string]: string}>({});
  const [userTags, setUserTags] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [courses, setCourses] = useState([]);
  const [courseProfessors, setCourseProfessors] = useState([]);
  const [popularProfs, setPopularProfs] = useState([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [courseTab, setCourseTab] = useState<'courses' | 'professors'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<any>(null);
  const [courseSections, setCourseSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [sectionReviews, setSectionReviews] = useState<any[]>([]);
  const [sectionQuestions, setSectionQuestions] = useState<any[]>([]);
  const [reviewTab, setReviewTab] = useState<'reviews' | 'qa'>('reviews');
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [syllabusContent, setSyllabusContent] = useState('');
  const [profCourses, setProfCourses] = useState<any[]>([]);
  
  const getButtonText = (eventName: string, defaultAction: string) => {
    return registeredEvents[eventName] ? `${registeredEvents[eventName]}ed` : defaultAction;
  };
  
  const handleClubConnect = (clubName: string, url: string) => {
    window.open(url, '_blank');
  };
  
  const categories = [
    { value: 'general', label: 'General', icon: '💬' },
    { value: 'academic', label: 'Academic', icon: '📚' },
    { value: 'social', label: 'Social', icon: '🎉' },
    { value: 'jobs', label: 'Jobs/Internships', icon: '💼' },
    { value: 'housing', label: 'Housing', icon: '🏠' },
    { value: 'events', label: 'Events', icon: '📅' }
  ];
  
  const fetchPosts = async () => {
    try {
      const res = await fetch(`http://localhost:8000/posts/?category=${filterCategory}&user_id=${user?.id || ''}`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPosts([]);
    }
  };

  const getTagColor = (tag: string) => {
    const colors: any = {
      'Freshman': 'bg-blue-600', 'Sophomore': 'bg-green-600', 'Junior': 'bg-yellow-600', 
      'Senior': 'bg-orange-600', 'Graduate': 'bg-purple-600', 'PhD': 'bg-pink-600', 'Alumni': 'bg-red-600',
      'CS Major': 'bg-indigo-600', 'Business Major': 'bg-teal-600', 'Engineering Major': 'bg-cyan-600',
      'Meta': 'bg-blue-500', 'Google': 'bg-red-500', 'Amazon': 'bg-orange-500', 
      'Apple': 'bg-gray-500', 'Microsoft': 'bg-blue-400', 'Netflix': 'bg-red-600',
      'Python': 'bg-blue-700', 'Java': 'bg-red-700', 'JavaScript': 'bg-yellow-500', 'React': 'bg-cyan-500',
      'Machine Learning': 'bg-purple-500', 'Data Science': 'bg-green-700', 'Web Dev': 'bg-indigo-500',
      'Mobile Dev': 'bg-teal-500', 'Cloud Computing': 'bg-sky-500', 'Cybersecurity': 'bg-red-800',
      'Leadership': 'bg-amber-600', 'Teamwork': 'bg-lime-600', 'Public Speaking': 'bg-rose-600',
      'Research': 'bg-violet-600', 'Hackathons': 'bg-fuchsia-600', 'Open Source': 'bg-emerald-600',
      'Startups': 'bg-orange-700', 'Internship': 'bg-blue-800'
    };
    return colors[tag] || 'bg-gray-600';
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      setLoading(false);
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    fetchPosts();
    
    fetch(`http://localhost:8000/messages/${parsedUser.id}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error(err));
    
    fetch(`http://localhost:8000/connections/${parsedUser.id}`)
      .then(res => res.json())
      .then(data => {
        setConnections(data);
        setPendingRequests(data.filter((c: any) => c.status === 'pending' && !c.is_sender));
      })
      .catch(err => console.error(err));
    
    // Load recommended users
    fetch(`http://localhost:8000/users/recommended/${parsedUser.id}`)
      .then(res => res.json())
      .then(data => setSearchResults(data))
      .catch(err => console.error(err));
    
    setClubs([
      {name: 'Computer Science Society', members: '250+', location: 'Engineering Building', category: 'Academic', description: 'Connect with fellow CS students and explore tech opportunities.', url: 'https://instagram.com/sdsu_css'},
      {name: 'Business Student Association', members: '400+', location: 'Business Building', category: 'Academic', description: 'Network with business professionals and develop leadership skills.', url: 'https://instagram.com/sdsuba'},
      {name: 'Aztec Gaming', members: '180+', location: 'Student Union', category: 'Recreation', description: 'Gaming community for all skill levels and platforms.', url: 'https://www.instagram.com/aztecgamingsdsu/'},
      {name: 'Engineering Student Council', members: '320+', location: 'Engineering Building', category: 'Academic', description: 'Represent engineering students and organize professional events.', url: 'https://instagram.com/sdsu_esc'},
      {name: 'Aztec Recreation Center', members: '500+', location: 'ARC', category: 'Recreation', description: 'Fitness classes, intramural sports, and outdoor adventures.', url: 'https://instagram.com/sdsurec'},
      {name: 'Associated Students', members: '600+', location: 'Student Union', category: 'Government', description: 'Student government representing the voice of SDSU students.', url: 'https://instagram.com/as_sdsu'},
      {name: 'Aztec Dance Team', members: '45+', location: 'Viejas Arena', category: 'Arts', description: 'Official dance team performing at athletic events and competitions.', url: 'https://instagram.com/aztecdanceteam'},
      {name: 'Pre-Med Society', members: '300+', location: 'Life Sciences Building', category: 'Academic', description: 'Support pre-medical students with resources and networking.', url: 'https://instagram.com/sdsupremed'},
      {name: 'Aztec Marching Band', members: '200+', location: 'Music Building', category: 'Arts', description: 'Perform at football games and represent SDSU with pride.', url: 'https://instagram.com/aztecmarchingband'},
      {name: 'Surf Club', members: '150+', location: 'Beach Areas', category: 'Recreation', description: 'Catch waves and connect with fellow surfers in San Diego.', url: 'https://instagram.com/sdsusurfclub'},
      {name: 'Accounting Society', members: '180+', location: 'Business Building', category: 'Academic', description: 'Professional development for accounting and finance students.', url: 'https://instagram.com/sdsuaccounting'},
      {name: 'Aztec Cheerleaders', members: '30+', location: 'Viejas Arena', category: 'Recreation', description: 'Official cheerleading squad supporting Aztec athletics.', url: 'https://instagram.com/azteccheer'},
      {name: 'Psychology Club', members: '220+', location: 'Psychology Building', category: 'Academic', description: 'Explore psychology careers and research opportunities.', url: 'https://instagram.com/sdsupsychclub'},
      {name: 'Fraternity & Sorority Life', members: '2000+', location: 'Greek Row', category: 'Social', description: 'Join Greek life for leadership, service, and lifelong friendships.', url: 'https://instagram.com/sdsufsl'},
      {name: 'Aztec Nights', members: '800+', location: 'Student Union', category: 'Social', description: 'Free weekend entertainment and activities for students.', url: 'https://www.instagram.com/aztecnightssdsu/'},
      {name: 'International Student Center', members: '1200+', location: 'International Student Center', category: 'Cultural', description: 'Support and community for international students at SDSU.', url: 'https://instagram.com/sdsuisc'},
      {name: 'Aztec Radio', members: '80+', location: 'Student Union', category: 'Media', description: 'Student-run radio station broadcasting music and campus news.', url: 'https://instagram.com/aztecradio'},
      {name: 'Nursing Student Association', members: '280+', location: 'Nursing Building', category: 'Academic', description: 'Professional organization for nursing students and career development.', url: 'https://instagram.com/sdsunsa'},
      {name: 'Outdoor Adventures', members: '350+', location: 'ARC', category: 'Recreation', description: 'Hiking, camping, and outdoor activities throughout California.', url: 'https://instagram.com/sdsuoutdooradventures'},
      {name: 'MEChA', members: '120+', location: 'Student Union', category: 'Cultural', description: 'Chicano/Latino student movement promoting education and culture.', url: 'https://instagram.com/sdsu_mecha'},
      {name: 'Sanskrit Club', members: '85+', location: 'Student Union', category: 'Cultural', description: 'Celebrate Sanskrit language and Indian culture through events and activities.', url: 'https://www.instagram.com/sanskritisdsu/'},
      {name: 'APSA', members: '200+', location: 'Student Union', category: 'Cultural', description: 'Asian Pacific Student Alliance promoting cultural awareness and community.', url: 'https://www.instagram.com/apsasdsu/'},
      {name: 'SDSU Research', members: '150+', location: 'Research Centers', category: 'Academic', description: 'Undergraduate research opportunities across all disciplines.', url: 'https://www.instagram.com/sdsuresearch/'},
      {name: 'SDSU International', members: '800+', location: 'International Student Center', category: 'Cultural', description: 'Programs and support for international education and exchange.', url: 'https://www.instagram.com/sdsu_international/'},
      {name: 'Club Baseball', members: '40+', location: 'Baseball Fields', category: 'Recreation', description: 'Competitive club baseball team representing SDSU in tournaments.', url: 'https://www.instagram.com/sdsuclubbaseball/'},
      {name: 'AITP', members: '95+', location: 'Business Building', category: 'Academic', description: 'Association of Information Technology Professionals for tech careers.', url: 'https://www.instagram.com/sdsu_aitp/'},
      {name: 'Aztec Womens Basketball', members: '15+', location: 'Viejas Arena', category: 'Recreation', description: 'Official womens basketball team representing SDSU in NCAA competition.', url: 'https://www.instagram.com/aztecwbb/'},
      {name: 'Aztecs Rock Hunger', members: '300+', location: 'Campus Wide', category: 'Social', description: 'Student organization fighting food insecurity and supporting community.', url: 'https://www.instagram.com/aztecsrockhunger/'}
    ]);
    setClubsLoading(false);
    
    // Load all tags
    fetch('http://localhost:8000/tags/')
      .then(res => res.json())
      .then(data => setAllTags(data))
      .catch(err => console.error(err));
    
    // Load user tags
    fetch(`http://localhost:8000/users/${parsedUser.id}/tags`)
      .then(res => res.json())
      .then(data => setUserTags(data))
      .catch(err => console.error(err));
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeSection === 'courses') {
      fetchDepartments();
      fetchPopularProfessors();
      searchCourses();
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'courses') {
      if (courseTab === 'courses') searchCourses();
      else searchCourseProfessors();
    }
  }, [courseSearchQuery, selectedDept, courseTab]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('http://localhost:8000/departments');
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      setDepartments([]);
    }
  };

  const fetchPopularProfessors = async () => {
    try {
      const res = await fetch('http://localhost:8000/professors/popular');
      const data = await res.json();
      setPopularProfs(Array.isArray(data) ? data : []);
    } catch (error) {
      setPopularProfs([]);
    }
  };

  const searchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (courseSearchQuery) params.append('query', courseSearchQuery);
      if (selectedDept) params.append('department', selectedDept);
      const res = await fetch(`http://localhost:8000/courses/search?${params}`);
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      setCourses([]);
    }
  };

  const searchCourseProfessors = async () => {
    try {
      const params = new URLSearchParams();
      if (courseSearchQuery) params.append('query', courseSearchQuery);
      if (selectedDept) params.append('department', selectedDept);
      const res = await fetch(`http://localhost:8000/professors/search?${params}`);
      const data = await res.json();
      setCourseProfessors(Array.isArray(data) ? data : []);
    } catch (error) {
      setCourseProfessors([]);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    fetch(`http://localhost:8000/users/recommended/${user.id}`)
      .then(res => res.json())
      .then(data => {
        let filtered = data;
        if (yearFilter) filtered = filtered.filter((u: any) => u.tags?.includes(yearFilter));
        if (majorFilter) filtered = filtered.filter((u: any) => u.tags?.includes(majorFilter));
        if (companyFilter) filtered = filtered.filter((u: any) => u.tags?.includes(companyFilter));
        setSearchResults(filtered);
      })
      .catch(err => console.error(err));
  }, [yearFilter, majorFilter, companyFilter, user]);
  
  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [filterCategory, user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth');
  };

  const handleVote = async (postId: number, value: number) => {
    try {
      await fetch(`http://localhost:8000/posts/${postId}/vote?user_id=${user.id}&value=${value}`, {
        method: 'POST'
      });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    try {
      const res = await fetch('http://localhost:8000/posts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost, user_id: user.id, category: selectedCategory })
      });
      if (!res.ok) throw new Error('Failed to create post');
      setNewPost('');
      setSelectedCategory('general');
      fetchPosts();
      setModal({isOpen: true, title: 'Success', message: 'Post created successfully!', type: 'success'});
    } catch (err: any) {
      setModal({isOpen: true, title: 'Error', message: 'Failed to create post', type: 'error'});
    }
  };
  
  const fetchComments = async (postId: number) => {
    try {
      const res = await fetch(`http://localhost:8000/posts/${postId}/comments`);
      const data = await res.json();
      setComments(prev => ({...prev, [postId]: data}));
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleAddComment = async (postId: number) => {
    const content = newComment[postId]?.trim();
    if (!content) return;
    try {
      await fetch(`http://localhost:8000/posts/${postId}/comments?content=${encodeURIComponent(content)}&user_id=${user.id}`, {
        method: 'POST'
      });
      setNewComment(prev => ({...prev, [postId]: ''}));
      fetchComments(postId);
    } catch (err) {
      console.error(err);
    }
  };
  
  const toggleComments = (postId: number) => {
    const isShowing = showComments[postId];
    setShowComments(prev => ({...prev, [postId]: !isShowing}));
    if (!isShowing && !comments[postId]) {
      fetchComments(postId);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await fetch(`http://localhost:8000/users/search?current_user_id=${user.id}&query=${searchQuery}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendRequest = async (friendId: number) => {
    try {
      await fetch(`http://localhost:8000/connections/?user_id=${user.id}&friend_id=${friendId}`, {
        method: 'POST'
      });
      const res = await fetch(`http://localhost:8000/connections/${user.id}`);
      const data = await res.json();
      setConnections(data);
      setSearchResults(prev => prev.filter(u => u.id !== friendId));
      setModal({isOpen: true, title: 'Success', message: 'Connection request sent!', type: 'success'});
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptRequest = async (connectionId: number) => {
    try {
      await fetch(`http://localhost:8000/connections/${connectionId}?status=accepted`, {
        method: 'PUT'
      });
      const res = await fetch(`http://localhost:8000/connections/${user.id}`);
      const data = await res.json();
      setConnections(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEventAction = (eventName: string, action: string) => {
    setEventModal({isOpen: true, eventName, action});
  };

  const confirmEventAction = () => {
    const newEvent = {
      eventName: eventModal.eventName,
      action: eventModal.action,
      date: new Date().toLocaleDateString()
    };
    setUserEvents(prev => [...prev, newEvent]);
    setRegisteredEvents(prev => ({...prev, [eventModal.eventName]: eventModal.action}));
    setModal({isOpen: true, title: 'Success', message: `Successfully ${eventModal.action.toLowerCase()}ed for ${eventModal.eventName}!`, type: 'success'});
    setEventModal({isOpen: false, eventName: '', action: ''});
  };

  const handleAddTag = async (tagId: number) => {
    try {
      await fetch(`http://localhost:8000/users/${user.id}/tags/${tagId}`, { method: 'POST' });
      const res = await fetch(`http://localhost:8000/users/${user.id}/tags`);
      const data = await res.json();
      setUserTags(data);
      setShowTagSelector(false);
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleRemoveTag = async (tagId: number) => {
    try {
      await fetch(`http://localhost:8000/users/${user.id}/tags/${tagId}`, { method: 'DELETE' });
      const res = await fetch(`http://localhost:8000/users/${user.id}/tags`);
      const data = await res.json();
      setUserTags(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          setModal({isOpen: true, title: 'Error', message: 'New passwords do not match!', type: 'error'});
          return;
        }
        if (!profileData.oldPassword) {
          setModal({isOpen: true, title: 'Error', message: 'Please enter your old password!', type: 'error'});
          return;
        }
      }
      
      const updateData: any = {};
      if (profileData.username && profileData.username !== user.username) updateData.username = profileData.username;
      if (profileData.email && profileData.email !== user.email) updateData.email = profileData.email;
      if (profileData.newPassword) updateData.password = profileData.newPassword;
      
      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        return;
      }
      
      const url = profileData.newPassword 
        ? `http://localhost:8000/users/${user.id}?old_password=${encodeURIComponent(profileData.oldPassword)}`
        : `http://localhost:8000/users/${user.id}`;
      
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (!res.ok) {
        const error = await res.json();
        setModal({isOpen: true, title: 'Error', message: error.detail || 'Update failed', type: 'error'});
        return;
      }
      
      
      const updatedUser = { ...user, username: profileData.username, email: profileData.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setProfileData({username: '', email: '', oldPassword: '', newPassword: '', confirmPassword: ''});
      setIsEditing(false);
      setModal({isOpen: true, title: 'Success', message: 'Profile updated successfully!', type: 'success'});
    } catch (err: any) {
      console.error(err);
      setModal({isOpen: true, title: 'Error', message: 'Update failed: ' + err.message, type: 'error'});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{borderColor: '#A6192E', borderTopColor: 'transparent'}}></div>
          <p className="text-white text-center mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-black to-red-800">
        <div className="text-center text-white px-6">
          <h1 className="text-6xl font-bold mb-4">Welcome to Nexus</h1>
          <p className="text-xl mb-8 opacity-90">Connect with your SDSU community</p>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth"
              className="bg-white px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
              style={{color: '#A6192E'}}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <div className="w-64 bg-gray-900 border-r border-gray-800 p-6">
        <h2 className="text-2xl font-bold mb-8" style={{color: '#A6192E'}}>myNexus</h2>
        <nav className="space-y-4">
          <button onClick={() => { setActiveSection('home'); localStorage.setItem('activeSection', 'home'); }} className="w-full flex items-center gap-3 p-3 rounded-lg text-left" style={{backgroundColor: activeSection === 'home' ? 'rgba(166, 25, 46, 0.2)' : 'transparent'}}>
            <svg className="w-6 h-6" style={{color: '#A6192E'}} fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="font-medium text-white">AskSDSU</span>
          </button>
          
          <button onClick={() => { setActiveSection('courses'); localStorage.setItem('activeSection', 'courses'); }} className="w-full flex items-center gap-3 p-3 rounded-lg text-left" style={{backgroundColor: activeSection === 'courses' ? 'rgba(166, 25, 46, 0.2)' : 'transparent'}}>
            <svg className="w-6 h-6" style={{color: '#A6192E'}} fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            <span className="font-medium text-white">Course Compass</span>
          </button>
          
          <button onClick={() => { setActiveSection('peer'); localStorage.setItem('activeSection', 'peer'); }} className="w-full flex items-center gap-3 p-3 rounded-lg text-left" style={{backgroundColor: activeSection === 'peer' ? 'rgba(166, 25, 46, 0.2)' : 'transparent'}}>
            <svg className="w-6 h-6" style={{color: '#A6192E'}} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span className="font-medium text-white">Peer Connect</span>
          </button>
          
          <button onClick={() => { setActiveSection('events'); localStorage.setItem('activeSection', 'events'); }} className="w-full flex items-center gap-3 p-3 rounded-lg text-left" style={{backgroundColor: activeSection === 'events' ? 'rgba(166, 25, 46, 0.2)' : 'transparent'}}>
            <svg className="w-6 h-6" style={{color: '#A6192E'}} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-white">Events</span>
          </button>
          
          <button onClick={() => { setActiveSection('clubs'); localStorage.setItem('activeSection', 'clubs'); }} className="w-full flex items-center gap-3 p-3 rounded-lg text-left" style={{backgroundColor: activeSection === 'clubs' ? 'rgba(166, 25, 46, 0.2)' : 'transparent'}}>
            <svg className="w-6 h-6" style={{color: '#A6192E'}} fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span className="font-medium text-white">Clubs</span>
          </button>
          
          <button onClick={() => { setActiveSection('messages'); localStorage.setItem('activeSection', 'messages'); }} className="w-full flex items-center gap-3 p-3 rounded-lg text-left" style={{backgroundColor: activeSection === 'messages' ? 'rgba(166, 25, 46, 0.2)' : 'transparent'}}>
            <svg className="w-6 h-6" style={{color: '#A6192E'}} fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="font-medium text-white">Messages</span>
          </button>
          
          <button onClick={() => { setActiveSection('profile'); localStorage.setItem('activeSection', 'profile'); }} className="w-full flex items-center gap-3 p-3 rounded-lg text-left" style={{backgroundColor: activeSection === 'profile' ? 'rgba(166, 25, 46, 0.2)' : 'transparent'}}>
            <svg className="w-6 h-6" style={{color: '#A6192E'}} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-white">Profile</span>
          </button>
          
          <div className="pt-6 border-t border-gray-800">
            <p className="text-sm text-gray-400 mb-2">Logged in as</p>
            <p className="font-medium text-white">{user.username}</p>
            <button onClick={handleLogout} className="mt-4 w-full text-white py-2 rounded-lg text-sm font-medium" style={{backgroundColor: '#A6192E'}}>
              Logout
            </button>
          </div>
        </nav>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-white">
          {activeSection === 'home' ? 'AskSDSU' : activeSection === 'peer' ? 'Peer Connect' : activeSection === 'events' ? 'Events' : activeSection === 'clubs' ? 'Clubs' : activeSection === 'courses' ? 'Course Compass' : activeSection === 'messages' ? 'Messages' : 'Profile'}
        </h2>
        
        {activeSection === 'home' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-6">
              <textarea
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none mb-3"
                rows={3}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <div className="flex gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
                <button
                  onClick={handleCreatePost}
                  className="px-6 py-2 text-white rounded-lg font-medium"
                  style={{backgroundColor: '#A6192E'}}
                >
                  Post
                </button>
              </div>
            </div>

            <div className="mb-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none"
              >
                <option value="all">All Posts</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>

            {posts.map(post => (
              <div key={post.id} className="bg-gray-900 rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{backgroundColor: '#A6192E'}}>
                    {post.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{post.username}</p>
                    <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs" style={{backgroundColor: 'rgba(166, 25, 46, 0.2)', color: '#A6192E'}}>
                    {categories.find(c => c.value === post.category)?.label || post.category}
                  </span>
                </div>
                <p className="mb-4 text-gray-300">{post.content}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(post.id, 1)}
                      className="p-1 rounded transition"
                      style={{color: post.user_vote === 1 ? '#A6192E' : '#9CA3AF'}}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <span className="text-white font-medium">{post.likes_count}</span>
                    <button
                      onClick={() => handleVote(post.id, -1)}
                      className="p-1 rounded transition"
                      style={{color: post.user_vote === -1 ? '#A6192E' : '#9CA3AF'}}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1 text-gray-400 hover:text-blue-500 transition"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{post.comments_count || 0} Comments</span>
                  </button>
                </div>
                {showComments[post.id] && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none text-sm"
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment({...newComment, [post.id]: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-4 py-2 text-white rounded-lg text-sm"
                        style={{backgroundColor: '#A6192E'}}
                      >
                        Post
                      </button>
                    </div>
                    <div className="space-y-2">
                      {comments[post.id]?.map(comment => (
                        <div key={comment.id} className="flex gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{backgroundColor: '#A6192E'}}>
                            {comment.username[0].toUpperCase()}
                          </div>
                          <div className="flex-1 bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white text-sm font-medium">{comment.username}</span>
                              <span className="text-gray-500 text-xs">{new Date(comment.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-300 text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {activeSection === 'peer' && (
          <div>
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 text-white rounded-lg"
                  style={{backgroundColor: '#A6192E'}}
                >
                  Search
                </button>
              </div>
              
              <div className="flex gap-3 mt-3">
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none"
                >
                  <option value="">All Years</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                  <option value="PhD">PhD</option>
                  <option value="Alumni">Alumni</option>
                </select>
                
                <select
                  value={majorFilter}
                  onChange={(e) => setMajorFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none"
                >
                  <option value="">All Majors</option>
                  <option value="CS Major">CS Major</option>
                  <option value="Business Major">Business Major</option>
                  <option value="Engineering Major">Engineering Major</option>
                </select>
                
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none"
                >
                  <option value="">All Companies</option>
                  <option value="Meta">Meta</option>
                  <option value="Google">Google</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Apple">Apple</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Netflix">Netflix</option>
                </select>
              </div>
              {searchResults.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {searchResults.map(result => (
                    <div key={result.id} className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-800 transition" onClick={() => setSelectedUser(result)}>
                      <img src={`https://ui-avatars.com/api/?name=${result.username}&size=300&background=random&color=fff&bold=true`} alt={result.username} className="w-full h-32 object-cover" />
                      <div className="p-4">
                        <p className="text-white font-semibold text-lg mb-3">{result.username}</p>
                        {result.bio && <p className="text-gray-300 text-xs mb-3 line-clamp-2">{result.bio}</p>}
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {result.tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} className={`px-2 py-1 text-white text-xs rounded ${getTagColor(tag)}`}>{tag}</span>
                            ))}
                            {result.tags.length > 3 && <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded">+{result.tags.length - 3}</span>}
                          </div>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleSendRequest(result.id); }} className="w-full py-2 text-white rounded-lg text-sm font-medium" style={{backgroundColor: '#A6192E'}}>Connect</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Pending Requests</h3>
                <div className="grid grid-cols-4 gap-4">
                  {connections.filter(c => c.status === 'pending' && !c.is_sender).map(conn => (
                    <div key={conn.id} className="bg-gray-900 rounded-lg overflow-hidden">
                      <img src={`https://ui-avatars.com/api/?name=${conn.username}&size=300&background=random&color=fff&bold=true`} alt={conn.username} className="w-full h-32 object-cover" />
                      <div className="p-4">
                        <p className="text-white font-semibold text-lg mb-3">{conn.username}</p>
                        {conn.bio && <p className="text-gray-300 text-xs mb-3 line-clamp-2">{conn.bio}</p>}
                        {conn.tags && conn.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {conn.tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} className={`px-2 py-1 text-white text-xs rounded ${getTagColor(tag)}`}>{tag}</span>
                            ))}
                            {conn.tags.length > 3 && <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded">+{conn.tags.length - 3}</span>}
                          </div>
                        )}
                        <button
                          onClick={() => handleAcceptRequest(conn.id)}
                          className="w-full py-2 text-white rounded-lg text-sm font-medium"
                          style={{backgroundColor: '#A6192E'}}
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Friends</h3>
                <div className="grid grid-cols-4 gap-4">
                  {connections.filter(c => c.status === 'accepted').map(conn => (
                    <div key={conn.id} className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-800 transition" onClick={() => setSelectedUser(conn)}>
                      <img src={`https://ui-avatars.com/api/?name=${conn.username}&size=300&background=random&color=fff&bold=true`} alt={conn.username} className="w-full h-32 object-cover" />
                      <div className="p-4">
                        <p className="text-white font-semibold text-lg mb-3">{conn.username}</p>
                        {conn.bio && <p className="text-gray-300 text-xs mb-3 line-clamp-2">{conn.bio}</p>}
                        {conn.tags && conn.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {conn.tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} className={`px-2 py-1 text-white text-xs rounded ${getTagColor(tag)}`}>{tag}</span>
                            ))}
                            {conn.tags.length > 3 && <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded">+{conn.tags.length - 3}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeSection === 'events' && (
          <div className="space-y-4">
            {[
              {name: 'Social Venture Challenge 2026', date: 'October 1 – December 12, 2025 • 12:00 AM - 11:59 PM', location: 'University Library', description: 'Apply to the Social Venture Challenge 2026! Zip Launchpad Calendar', action: 'Register', tag: 'Competition', color: 'rgba(166, 25, 46, 0.2)'},
              {name: 'Care and Custody: Past Responses to Mental Health', date: 'October 20 – November 25, 2025 • 9:00 AM - 5:00 PM', location: 'Love Library 2nd floor elevator lobby', description: 'Exhibition exploring historical responses to mental health care and custody.', action: 'Join', tag: 'Exhibition', color: 'rgba(59, 130, 246, 0.2)'},
              {name: 'Bryan Adams Concert', date: 'Sunday, November 16, 2025 • 7:30 PM - 11:00 PM', location: 'Viejas Arena', description: 'Bryan Adams live in concert at Viejas Arena. Tickets on sale now!', action: 'Get Tickets', tag: 'Concert', color: 'rgba(236, 72, 153, 0.2)'},
              {name: 'International Student Virtual Open Advising Hours', date: 'Monday, November 17, 2025 • 10:00 AM - 11:30 AM', location: 'Virtual', description: 'Open advising hours for international students via virtual platform.', action: 'Join', tag: 'Advising', color: 'rgba(168, 85, 247, 0.2)'},
              {name: 'GEO CoEng/CoS Getting Started Session', date: 'Monday, November 17, 2025 • 10:00 AM - 11:00 AM', location: 'SDSU Engineering Building E203-E', description: 'Global Education Office session for College of Engineering and Sciences students.', action: 'Register', tag: 'Academic', color: 'rgba(59, 130, 246, 0.2)'},
              {name: 'Queer Crafternoon', date: 'Monday, November 17, 2025 • 12:00 PM - 1:00 PM', location: 'The Pride Center Multipurpose Room', description: 'Creative crafting session hosted by the Pride Center.', action: 'Join', tag: 'Social', color: 'rgba(245, 158, 11, 0.2)'},
              {name: 'GEO CAL/COE Getting Started Session for Study Abroad', date: 'Monday, November 17, 2025 • 3:00 PM - 4:00 PM', location: 'Online virtual event', description: 'Study abroad information session for College of Arts and Letters and College of Education.', action: 'Register', tag: 'Study Abroad', color: 'rgba(168, 85, 247, 0.2)'},
              {name: 'Meet the Author: Thien Pham', date: 'Monday, November 17, 2025 • 4:00 PM - 5:00 PM', location: 'APIDA Center', description: 'Author meet and greet event at the APIDA Center.', action: 'Join', tag: 'Literary', color: 'rgba(245, 158, 11, 0.2)'},
              {name: 'GraduAte', date: 'Monday, November 17, 2025 • 4:30 PM - 5:30 PM', location: 'The Pride Center Multipurpose Room', description: 'Graduate student support group at the Pride Center.', action: 'Join', tag: 'Graduate', color: 'rgba(34, 197, 94, 0.2)'},
              {name: 'Revision and Editing Strategies for Graduate Writers', date: 'Monday, November 17, 2025 • 5:00 PM - 6:00 PM', location: 'Zoom', description: 'Workshop on writing strategies for graduate students via Zoom.', action: 'Register', tag: 'Workshop', color: 'rgba(166, 25, 46, 0.2)'},
              {name: 'Fowler GEO Drop In Advising', date: 'Tuesday, November 18, 2025 • 10:00 AM - 11:30 AM', location: 'Lamden Hall Rm 419', description: 'Drop-in advising for Fowler College students interested in global education.', action: 'Join', tag: 'Advising', color: 'rgba(168, 85, 247, 0.2)'},
              {name: 'SDSU Student Symposium (S3) Information Session', date: 'Tuesday, November 18, 2025 • 10:00 AM - 12:00 PM', location: 'SDSU Imperial Valley Library', description: 'Information session about the Student Symposium. Free event.', action: 'Register', tag: 'Research', color: 'rgba(59, 130, 246, 0.2)'},
              {name: 'Free HIV Testing', date: 'Tuesday, November 18, 2025 • 11:00 AM - 4:00 PM', location: 'The Pride Center', description: 'Free HIV testing services provided at the Pride Center.', action: 'Join', tag: 'Health', color: 'rgba(34, 197, 94, 0.2)'},
              {name: 'Beyond Borders: International Student Employment Session', date: 'Tuesday, November 18, 2025 • 12:00 PM - 2:00 PM', location: 'Career Services SSE 1200', description: 'Employment guidance session for international students.', action: 'Register', tag: 'Career', color: 'rgba(166, 25, 46, 0.2)'},
              {name: 'Black Womens Healing Circle', date: 'Tuesday, November 18, 2025 • 1:00 PM - 2:00 PM', location: 'Black Resource Center', description: 'Healing circle for Black women at the Black Resource Center.', action: 'Join', tag: 'Wellness', color: 'rgba(34, 197, 94, 0.2)'},
              {name: 'Trans4', date: 'Tuesday, November 18, 2025 • 1:30 PM - 2:30 PM', location: 'The Pride Center Multipurpose Room', description: 'Support group for transgender students at the Pride Center.', action: 'Join', tag: 'Support', color: 'rgba(245, 158, 11, 0.2)'},
              {name: 'Getting Unstuck: A C&PS Drop-In Group', date: 'Tuesday, November 18, 2025 • 3:00 PM - 4:15 PM', location: 'Calpulli Center Conference Room 4', description: 'Free drop-in counseling group for students feeling stuck.', action: 'Join', tag: 'Counseling', color: 'rgba(34, 197, 94, 0.2)'},
              {name: 'Gender Journey', date: 'Tuesday, November 18, 2025 • 3:30 PM - 4:30 PM', location: 'The Pride Center Multipurpose Room', description: 'Support group for students exploring gender identity.', action: 'Join', tag: 'Support', color: 'rgba(245, 158, 11, 0.2)'},
              {name: 'Aztec Mens Basketball vs Troy', date: 'Tuesday, November 18, 2025 • 7:00 PM - 9:30 PM', location: 'Viejas Arena', description: 'Aztec Mens Basketball game against Troy. Free with student tickets.', action: 'Get Tickets', tag: 'Sports', color: 'rgba(16, 185, 129, 0.2)'},
              {name: 'Global Education Fair', date: 'Wednesday, November 19, 2025 • 10:00 AM - 2:00 PM', location: 'Centennial Walkway', description: 'Learn about global education opportunities and study abroad programs.', action: 'Join', tag: 'Education', color: 'rgba(168, 85, 247, 0.2)'}
            ].map((event, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{event.name}</h3>
                    <p className="text-gray-400 text-sm">📅 {event.date}</p>
                    <p className="text-gray-400 text-sm">📍 {event.location}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{backgroundColor: event.color, color: event.tag === 'Free Entry' ? '#10B981' : '#A6192E'}}>{event.tag}</span>
                </div>
                <p className="text-gray-300 mb-4">{event.description}</p>
                <button 
                  onClick={() => !registeredEvents[event.name] && handleEventAction(event.name, event.action)} 
                  className="px-4 py-2 text-white rounded-lg text-sm" 
                  style={{backgroundColor: registeredEvents[event.name] ? '#666' : '#A6192E', cursor: registeredEvents[event.name] ? 'default' : 'pointer'}}
                  disabled={!!registeredEvents[event.name]}
                >
                  {getButtonText(event.name, event.action)}
                </button>
              </div>
            ))}
          </div>
        )}
        
        {activeSection === 'clubs' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-6">
              {['All', 'Academic', 'Arts', 'Recreation', 'Social', 'Cultural', 'Government', 'Media'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setClubFilter(filter)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition"
                  style={{
                    backgroundColor: clubFilter === filter ? '#A6192E' : 'transparent',
                    color: clubFilter === filter ? 'white' : '#A6192E',
                    border: '1px solid #A6192E'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
            {clubsLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Loading clubs...</p>
              </div>
            ) : clubs.filter(club => clubFilter === 'All' || club.category === clubFilter).map((club, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{club.name}</h3>
                    <p className="text-gray-400 text-sm">👥 {club.members} members</p>
                    <p className="text-gray-400 text-sm">📍 {club.location}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{backgroundColor: 'rgba(166, 25, 46, 0.2)', color: '#A6192E'}}>{club.category}</span>
                </div>
                <p className="text-gray-300 mb-4">{club.description}</p>
                <button 
                  onClick={() => handleClubConnect(club.name, club.url)}
                  className="px-4 py-2 text-white rounded-lg text-sm" 
                  style={{backgroundColor: '#A6192E'}}
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        )}
        
        {activeSection === 'courses' && (
          <div>
            {selectedCourse ? (
              <div>
                <button onClick={() => { setSelectedCourse(null); setSelectedSection(null); }} className="text-gray-400 hover:text-white mb-4">← Back to Courses</button>
                <div className="bg-gray-900 rounded-lg p-5 border border-gray-800 mb-4">
                  <h2 className="text-2xl font-bold text-white">{selectedCourse.code}</h2>
                  <p className="text-lg text-gray-300 mt-1">{selectedCourse.title}</p>
                  <p className="text-gray-400 mt-2">{selectedCourse.description}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-5 border border-gray-800 mb-4">
                  <h3 className="font-bold text-lg mb-3 text-white">Select Section</h3>
                  <div className="space-y-2">
                    {courseSections.map((section: any) => (
                      <div key={section.section_id} onClick={async () => {
                        setSelectedSection(section);
                        try {
                          const revRes = await fetch(`http://localhost:8000/sections/${section.section_id}/reviews`);
                          const revData = await revRes.json();
                          setSectionReviews(Array.isArray(revData) ? revData : []);
                          const qRes = await fetch(`http://localhost:8000/sections/${section.section_id}/questions`);
                          const qData = await qRes.json();
                          setSectionQuestions(Array.isArray(qData) ? qData : []);
                        } catch (err) {
                          console.error(err);
                          setSectionReviews([]);
                          setSectionQuestions([]);
                        }
                      }} className={`p-4 border rounded-lg cursor-pointer ${selectedSection?.section_id === section.section_id ? 'bg-gray-800' : 'hover:bg-gray-800'}`} style={selectedSection?.section_id === section.section_id ? {borderColor: '#A6192E'} : {borderColor: '#374151'}}>
                        <div className="flex justify-between">
                          <div>
                            <div className="font-semibold text-white">Section {section.section_number} - {section.professor_name}</div>
                            <div className="text-sm text-gray-400">{section.schedule} • {section.location}</div>
                            {section.tags && <div className="flex gap-2 mt-2">{section.tags.split(',').map((tag: string, i: number) => {
                              const colors = ['bg-blue-900 text-blue-300', 'bg-orange-900 text-orange-300', 'bg-pink-900 text-pink-300', 'bg-teal-900 text-teal-300', 'bg-yellow-900 text-yellow-300', 'bg-indigo-900 text-indigo-300'];
                              return <span key={i} className={`text-xs px-2 py-1 rounded ${colors[i % colors.length]}`}>{tag}</span>;
                            })}</div>}
                            <button onClick={async (e) => { e.stopPropagation(); const res = await fetch(`http://localhost:8000/syllabus/${section.section_id}`); const data = await res.json(); setSyllabusContent(data.content); setShowSyllabus(true); }} className="text-sm mt-2" style={{color: '#A6192E'}}>📄 View Syllabus</button>
                          </div>
                          <div className="text-2xl font-bold text-white">{section.professor_rating.toFixed(1)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedSection && (
                  <div key={selectedSection.section_id} className="bg-gray-900 rounded-lg border border-gray-800">
                    <div className="flex gap-4 border-b border-gray-800 px-5 pt-3">
                      <button onClick={() => setReviewTab('reviews')} className={`pb-3 px-2 font-medium ${reviewTab === 'reviews' ? 'border-b-2 text-white' : 'text-gray-500'}`} style={reviewTab === 'reviews' ? {borderColor: '#A6192E'} : {}}>Reviews ({sectionReviews.length})</button>
                      <button onClick={() => setReviewTab('qa')} className={`pb-3 px-2 font-medium ${reviewTab === 'qa' ? 'border-b-2 text-white' : 'text-gray-500'}`} style={reviewTab === 'qa' ? {borderColor: '#A6192E'} : {}}>Q&A ({sectionQuestions.length})</button>
                    </div>
                    <div className="p-5 space-y-4">
                      {reviewTab === 'reviews' ? sectionReviews.map((r: any) => (
                        <div key={r.id} className="border-b border-gray-800 pb-4">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium text-white">{r.username}</span>
                            <span className="text-lg font-bold" style={{color: '#A6192E'}}>{r.rating.toFixed(1)}/5.0</span>
                          </div>
                          <p className="text-gray-300">{r.content}</p>
                          {r.tags && <div className="flex gap-2 mt-2">{r.tags.split(',').map((tag: string, i: number) => {
                            const colors = ['bg-blue-900 text-blue-300', 'bg-green-900 text-green-300', 'bg-purple-900 text-purple-300', 'bg-orange-900 text-orange-300', 'bg-pink-900 text-pink-300', 'bg-teal-900 text-teal-300'];
                            return <span key={i} className={`text-xs px-2 py-1 rounded ${colors[i % colors.length]}`}>{tag}</span>;
                          })}</div>}
                        </div>
                      )) : sectionQuestions.map((q: any) => (
                        <div key={q.id} className="border border-gray-800 rounded-lg p-4">
                          <h4 className="font-semibold text-white">{q.title}</h4>
                          <p className="text-sm text-gray-400 mt-2">{q.content}</p>
                          <div className="text-xs text-gray-500 mt-2">↑ {q.upvotes} • {q.answer_count} answers</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : selectedProfessor ? (
              <div>
                <button onClick={() => { setSelectedProfessor(null); setProfCourses([]); }} className="text-gray-400 hover:text-white mb-4">← Back to Professors</button>
                <div className="bg-gray-900 rounded-lg p-5 border border-gray-800 mb-4">
                  <div className="flex justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedProfessor.name}</h2>
                      <p className="text-gray-400">{selectedProfessor.department}</p>
                    </div>
                    {selectedProfessor.total_reviews > 0 && <div className="text-right"><div className="text-4xl font-bold" style={{color: '#A6192E'}}>{selectedProfessor.avg_rating.toFixed(1)}</div><div className="text-sm text-gray-400">{selectedProfessor.total_reviews} reviews</div></div>}
                  </div>
                  {selectedProfessor.total_reviews > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                      <div><span className="text-gray-400">Difficulty: </span><span className="font-bold text-white">{selectedProfessor.avg_difficulty.toFixed(1)}/5.0</span></div>
                      <div><span className="text-gray-400">Take Again: </span><span className="font-bold" style={{color: '#A6192E'}}>{selectedProfessor.would_take_again_percent.toFixed(0)}%</span></div>
                    </div>
                  )}
                </div>
                <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
                  <h3 className="font-bold text-lg mb-3 text-white">Courses Taught</h3>
                  <div className="space-y-3">
                    {profCourses.map((c: any) => (
                      <div key={c.section_id} onClick={async () => {
                        const res = await fetch(`http://localhost:8000/courses/${c.course_id}`);
                        const data = await res.json();
                        setSelectedCourse(data.course);
                        setCourseSections(data.sections);
                        setSelectedProfessor(null);
                      }} className="border border-gray-800 rounded-lg p-4 hover:bg-gray-800 cursor-pointer">
                        <h4 className="font-semibold text-white">{c.course_code} - {c.course_title}</h4>
                        <div className="text-sm text-gray-400">Section {c.section_number} • {c.semester}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-3 mb-4">
                  <input type="text" placeholder={courseTab === 'courses' ? 'Search courses (e.g., CS-160)' : 'Search professors'} value={courseSearchQuery} onChange={(e) => setCourseSearchQuery(e.target.value)} className="flex-1 px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none" />
                  <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none">
                    <option value="">All Departments</option>
                    {departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
                <div className="flex gap-4 border-b border-gray-800 mb-4">
                  <button onClick={() => setCourseTab('courses')} className={`pb-3 px-2 font-medium ${courseTab === 'courses' ? 'border-b-2 text-white' : 'text-gray-500'}`} style={courseTab === 'courses' ? {borderColor: '#A6192E'} : {}}>Courses</button>
                  <button onClick={() => setCourseTab('professors')} className={`pb-3 px-2 font-medium ${courseTab === 'professors' ? 'border-b-2 text-white' : 'text-gray-500'}`} style={courseTab === 'professors' ? {borderColor: '#A6192E'} : {}}>Professors</button>
                </div>
                {courseTab === 'courses' ? (
              <div className="space-y-3">
                {courses.length === 0 ? <div className="bg-gray-900 rounded-lg p-8 text-center text-gray-400">Loading courses...</div> : courses.map((course: any) => (
                  <div key={course.id} onClick={async () => {
                    setSelectedCourse(course);
                    setSelectedProfessor(null);
                    const res = await fetch(`http://localhost:8000/courses/${course.id}`);
                    const data = await res.json();
                    setCourseSections(data.sections);
                    if (data.sections.length > 0) {
                      setSelectedSection(data.sections[0]);
                      const revRes = await fetch(`http://localhost:8000/sections/${data.sections[0].section_id}/reviews`);
                      setSectionReviews(await revRes.json());
                      const qRes = await fetch(`http://localhost:8000/sections/${data.sections[0].section_id}/questions`);
                      setSectionQuestions(await qRes.json());
                    }
                  }} className="bg-gray-900 rounded-lg p-5 hover:bg-gray-800 transition cursor-pointer border border-gray-800">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-white">{course.code}</h3>
                        <p className="text-gray-300 mt-1">{course.title}</p>
                        <p className="text-sm text-gray-400 mt-2">{course.description}</p>
                        {course.tags && <div className="flex gap-2 flex-wrap mt-3">{course.tags.split(',').map((tag: string, i: number) => {
                          const colors = ['bg-blue-900 text-blue-300', 'bg-green-900 text-green-300', 'bg-purple-900 text-purple-300', 'bg-orange-900 text-orange-300', 'bg-pink-900 text-pink-300', 'bg-teal-900 text-teal-300'];
                          return <span key={i} className={`text-xs px-2 py-1 rounded ${colors[i % colors.length]}`}>{tag}</span>;
                        })}</div>}
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full ml-4" style={{backgroundColor: 'rgba(166, 25, 46, 0.2)', color: '#A6192E'}}>{course.department}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {courseProfessors.length === 0 ? <div className="bg-gray-900 rounded-lg p-8 text-center text-gray-400">No professors found.</div> : courseProfessors.map((prof: any) => (
                  <div key={prof.id} onClick={async () => {
                    setSelectedProfessor(prof);
                    setSelectedCourse(null);
                    const res = await fetch(`http://localhost:8000/professors/${prof.id}`);
                    const data = await res.json();
                    setProfCourses(Array.isArray(data.courses) ? data.courses : []);
                  }} className="bg-gray-900 rounded-lg p-5 hover:bg-gray-800 transition cursor-pointer border border-gray-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-white">{prof.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">{prof.department}</p>
                        {prof.total_reviews > 0 && <div className="flex gap-4 mt-3 text-sm">
                          <div><span className="text-gray-500">Rating: </span><span className="font-semibold" style={{color: '#A6192E'}}>{prof.avg_rating.toFixed(1)}/5.0</span></div>
                          <div><span className="text-gray-500">Difficulty: </span><span className="font-semibold text-white">{prof.avg_difficulty.toFixed(1)}/5.0</span></div>
                          <div><span className="text-gray-500">Would take again: </span><span className="font-semibold" style={{color: '#A6192E'}}>{prof.would_take_again_percent.toFixed(0)}%</span></div>
                        </div>}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{prof.avg_rating.toFixed(1)}</div>
                        <div className="text-xs text-gray-400">{prof.total_reviews} reviews</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                )}
              </>
            )}
          </div>
        )}
        
        {activeSection === 'messages' && (
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className="bg-gray-900 rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{backgroundColor: '#A6192E'}}>
                    {(msg.is_sender ? msg.receiver_username : msg.sender_username)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{msg.is_sender ? msg.receiver_username : msg.sender_username}</p>
                    <p className="text-sm text-gray-500">{new Date(msg.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-gray-300">{msg.content}</p>
              </div>
            ))}
          </div>
        )}
        
        {activeSection === 'profile' && (
          <div className="max-w-2xl">
            <div className="bg-gray-900 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
                {!isEditing ? (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setProfileData({username: user.username, email: user.email, oldPassword: '', newPassword: '', confirmPassword: ''});
                    }}
                    className="px-4 py-2 text-white rounded-lg text-sm"
                    style={{backgroundColor: '#A6192E'}}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setProfileData({username: '', email: '', oldPassword: '', newPassword: '', confirmPassword: ''});
                      }}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateProfile}
                      className="px-4 py-2 text-white rounded-lg text-sm"
                      style={{backgroundColor: '#A6192E'}}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none"
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    />
                  ) : (
                    <p className="text-white px-4 py-2">{user.username}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    />
                  ) : (
                    <p className="text-white px-4 py-2">{user.email}</p>
                  )}
                </div>
                
                {isEditing && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Old Password</label>
                      <input
                        type="password"
                        placeholder="Enter old password"
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none"
                        value={profileData.oldPassword}
                        onChange={(e) => setProfileData({...profileData, oldPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none"
                        value={profileData.newPassword}
                        onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none"
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-400">My Tags</label>
                  {!showTagSelector && (
                    <button
                      onClick={() => setShowTagSelector(true)}
                      className="px-4 py-2 text-white rounded-lg text-sm font-medium"
                      style={{backgroundColor: '#A6192E'}}
                    >
                      + Add Tag
                    </button>
                  )}
                </div>
                
                {showTagSelector && (
                  <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-white text-sm font-medium">Select a tag to add:</p>
                      <button
                        onClick={() => setShowTagSelector(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                      {allTags.filter(t => !userTags.find(ut => ut.id === t.id)).map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => handleAddTag(tag.id)}
                          className={`px-3 py-2 text-white text-sm rounded ${getTagColor(tag.name)} hover:opacity-80 transition`}
                        >
                          + {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {userTags.length === 0 ? (
                    <p className="text-gray-500 text-sm">No tags added yet. Click "Add Tag" to get started.</p>
                  ) : (
                    userTags.map(tag => (
                      <div key={tag.id} className={`px-3 py-2 text-white text-sm rounded ${getTagColor(tag.name)} flex items-center gap-2`}>
                        <span>{tag.name}</span>
                        <button 
                          onClick={() => handleRemoveTag(tag.id)} 
                          className="hover:text-red-300 font-bold text-lg leading-none"
                          title="Remove tag"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 space-y-4 mt-6">
              <h3 className="text-lg font-semibold text-white">Upcoming Events</h3>
              {userEvents.length === 0 ? (
                <p className="text-gray-400">No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {userEvents.filter(event => event.action !== 'Join').map((event, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">{event.eventName}</p>
                          <p className="text-gray-400 text-sm">{event.action} on {event.date}</p>
                        </div>
                        <span className="px-2 py-1 rounded text-xs" style={{backgroundColor: 'rgba(166, 25, 46, 0.2)', color: '#A6192E'}}>
                          {event.action}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-80 bg-gray-900 border-l border-gray-800 p-6">
        <h2 className="text-xl font-bold mb-6 text-white">{activeSection === 'courses' ? 'Course Info' : 'Trending'}</h2>
        <div className="space-y-6">
          {activeSection === 'courses' ? (
            <>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3">🔥 Popular Professors</h3>
                <div className="space-y-3">
                  {popularProfs.length > 0 ? popularProfs.slice(0, 5).map((prof: any) => (
                    <div key={prof.id} onClick={async () => {
                      setSelectedProfessor(prof);
                      const res = await fetch(`http://localhost:8000/professors/${prof.id}`);
                      const data = await res.json();
                      setProfCourses(Array.isArray(data.courses) ? data.courses : []);
                    }} className="cursor-pointer hover:bg-gray-800 p-2 rounded">
                      <div className="font-medium text-sm text-white">{prof.name}</div>
                      <div className="text-xs text-gray-400">{prof.department}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold" style={{color: '#A6192E'}}>{prof.avg_rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-400">{prof.total_reviews} reviews</span>
                      </div>
                    </div>
                  )) : <p className="text-sm text-gray-400">No professors yet</p>}
                </div>
              </div>
              <div className="rounded-lg p-5 border" style={{backgroundColor: 'rgba(166, 25, 46, 0.1)', borderColor: 'rgba(166, 25, 46, 0.3)'}}>
                <h3 className="font-bold text-white mb-2">💡 Tips</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Read multiple reviews</li>
                  <li>• Check syllabus</li>
                  <li>• Compare sections</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Topics</h3>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer">
                <p className="text-white font-medium">#SDSULife</p>
                <p className="text-xs text-gray-400">2.3k posts</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer">
                <p className="text-white font-medium">#StudyGroup</p>
                <p className="text-xs text-gray-400">1.8k posts</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer">
                <p className="text-white font-medium">#AztecPride</p>
                <p className="text-xs text-gray-400">1.5k posts</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Top Mentors</h3>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer">
                <p className="text-white font-medium">Dr. Sarah Chen</p>
                <p className="text-xs text-gray-400">Computer Science</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer">
                <p className="text-white font-medium">Prof. Mike Johnson</p>
                <p className="text-xs text-gray-400">Business</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Hot Posts</h3>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer">
                <p className="text-white text-sm">Spring Break Plans 🌴</p>
                <p className="text-xs text-gray-400">156 likes</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer">
                <p className="text-white text-sm">Career Fair Tips</p>
                <p className="text-xs text-gray-400">142 likes</p>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
      
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <img src={`https://ui-avatars.com/api/?name=${selectedUser.username}&size=150&background=random&color=fff&bold=true`} alt={selectedUser.username} className="w-24 h-24 rounded-lg" />
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedUser.username}</h2>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedUser.tags?.map((tag: string) => (
                        <span key={tag} className={`px-3 py-1 text-white text-sm rounded ${getTagColor(tag)}`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                  <p className="text-gray-300 mb-4">{selectedUser.bio || 'No bio available'}</p>
                  
                  {selectedUser.courses && selectedUser.courses.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">📚 Courses</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.courses.map((course: string, i: number) => (
                          <span key={i} className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedUser.clubs && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">🎯 Clubs</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.clubs.split(',').map((club: string, i: number) => (
                          <span key={i} className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded">
                            {club}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <h3 className="text-lg font-semibold text-white mb-3">Availability</h3>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-white font-medium">{calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4>
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1)); }} className="text-gray-400 hover:text-white transition">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1)); }} className="text-gray-400 hover:text-white transition">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-xs font-semibold py-2" style={{color: '#A6192E'}}>{day}</div>
                      ))}
                      {(() => {
                        const year = calendarDate.getFullYear();
                        const month = calendarDate.getMonth();
                        const firstDay = new Date(year, month, 1).getDay();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const days = [];
                        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="py-3"></div>);
                        for (let d = 1; d <= daysInMonth; d++) {
                          const isAvailable = [5,12,19,26].includes(d);
                          days.push(
                            <div key={d} className={`text-sm py-3 rounded-lg font-medium transition-all cursor-pointer ${
                              isAvailable
                                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}>{d}</div>
                          );
                        }
                        return days;
                      })()}
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gradient-to-br from-green-500 to-green-600"></div>
                        <span className="text-gray-300">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gray-700"></div>
                        <span className="text-gray-300">Unavailable</span>
                      </div>
                    </div>
                  </div>

                  <button onClick={(e) => { e.stopPropagation(); handleSendRequest(selectedUser.id); setSelectedUser(null); }} className="w-full py-3 text-white rounded-lg font-medium" style={{backgroundColor: '#A6192E'}}>Connect</button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Peer Reviews ({selectedUser.id % 3 + 2})</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400">★</span>)}
                        </div>
                        <span className="text-gray-400 text-sm">by @student{selectedUser.id + 1}</span>
                      </div>
                      <p className="text-gray-300 text-sm">Great study partner! Very knowledgeable and patient. Helped me ace my exam.</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1,2,3,4].map(s => <span key={s} className="text-yellow-400">★</span>)}<span className="text-gray-600">★</span>
                        </div>
                        <span className="text-gray-400 text-sm">by @student{selectedUser.id + 2}</span>
                      </div>
                      <p className="text-gray-300 text-sm">Really helpful with project work. Knows the material well and explains clearly.</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400">★</span>)}
                        </div>
                        <span className="text-gray-400 text-sm">by @student{selectedUser.id + 3}</span>
                      </div>
                      <p className="text-gray-300 text-sm">Awesome mentor! Made complex topics easy to understand. Highly recommend!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({...modal, isOpen: false})}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
      
      {eventModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">{eventModal.action} for Event</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to {eventModal.action.toLowerCase()} for "{eventModal.eventName}"?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setEventModal({isOpen: false, eventName: '', action: ''})}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmEventAction}
                className="px-4 py-2 text-white rounded-lg"
                style={{backgroundColor: '#A6192E'}}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showSyllabus && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowSyllabus(false)}>
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">Course Syllabus</h2>
                <button onClick={() => setShowSyllabus(false)} className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">{syllabusContent}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
