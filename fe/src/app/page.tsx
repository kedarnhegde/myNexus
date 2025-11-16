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
  const [activeSection, setActiveSection] = useState('home');
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
    fetch(`http://localhost:3000/api/users/recommended/${parsedUser.id}`)
      .then(res => res.json())
      .then(data => setSearchResults(data))
      .catch(err => console.error(err));
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    fetch(`http://localhost:3000/api/users/recommended/${user.id}`)
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth');
  };

  const handleVote = async (postId: number, voteType: 'upvote' | 'downvote') => {
    try {
      await fetch(`http://localhost:8000/posts/${postId}/vote?user_id=${user.id}&vote_type=${voteType}`, {
        method: 'POST'
      });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await fetch(`http://localhost:8000/users/search/${searchQuery}?current_user_id=${user.id}`);
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

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    
    try {
      const res = await fetch('http://localhost:8000/posts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost, user_id: user.id, category: selectedCategory })
      });
      
      if (!res.ok) {
        throw new Error('Failed to create post');
      }
      
      setNewPost('');
      setSelectedCategory('general');
      // Refresh posts
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
          <button onClick={() => setActiveSection('home')} className="w-full flex items-center gap-3 p-3 rounded-lg text-left" style={{backgroundColor: activeSection === 'home' ? 'rgba(166, 25, 46, 0.2)' : 'transparent'}}>
            <svg className="w-6 h-6" style={{color: '#A6192E'}} fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="font-medium text-white">Home</span>
          </button>
          
          <button onClick={() => setActiveSection('peer')} className="w-full flex items-center gap-3 p-3 rounded-lg text-left" style={{backgroundColor: activeSection === 'peer' ? 'rgba(166, 25, 46, 0.2)' : 'transparent'}}>
            <svg className="w-6 h-6" style={{color: '#A6192E'}} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span className="font-medium text-white">Peer Connect</span>
          </button>
          
          <button onClick={() => setActiveSection('events')} className="w-full flex items-center gap-3 p-3 rounded-lg text-left" style={{backgroundColor: activeSection === 'events' ? 'rgba(166, 25, 46, 0.2)' : 'transparent'}}>
            <svg className="w-6 h-6" style={{color: '#A6192E'}} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-white">Events</span>
          </button>
          
          <button onClick={() => setActiveSection('courses')} className="w-full flex items-center gap-3 p-3 rounded-lg text-left" style={{backgroundColor: activeSection === 'courses' ? 'rgba(166, 25, 46, 0.2)' : 'transparent'}}>
            <svg className="w-6 h-6" style={{color: '#A6192E'}} fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            <span className="font-medium text-white">Course Compass</span>
          </button>
          
          <button onClick={() => setActiveSection('messages')} className="w-full flex items-center gap-3 p-3 rounded-lg text-left" style={{backgroundColor: activeSection === 'messages' ? 'rgba(166, 25, 46, 0.2)' : 'transparent'}}>
            <svg className="w-6 h-6" style={{color: '#A6192E'}} fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="font-medium text-white">Messages</span>
          </button>
          
          <button onClick={() => setActiveSection('profile')} className="w-full flex items-center gap-3 p-3 rounded-lg text-left" style={{backgroundColor: activeSection === 'profile' ? 'rgba(166, 25, 46, 0.2)' : 'transparent'}}>
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
          {activeSection === 'home' ? 'Home' : activeSection === 'peer' ? 'Peer Connect' : activeSection === 'events' ? 'Events' : activeSection === 'courses' ? 'Course Compass' : activeSection === 'messages' ? 'Messages' : 'Profile'}
        </h2>
        
        {activeSection === 'home' && (
          <div className="space-y-6">
            {/* Filter Section */}
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <span className="text-white font-medium">🔍 Filter Posts:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-red-600"
                >
                  <option value="all">📋 All Posts</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Create Post Section */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">✏️ Create New Post</h3>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">Post as:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-red-600 text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <textarea
                  placeholder="Share something with your community..."
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-red-600 resize-none"
                  rows={3}
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim()}
                    className="px-6 py-2 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{backgroundColor: '#A6192E'}}
                  >
                    📤 Post
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="bg-gray-900 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{backgroundColor: '#A6192E'}}>
                        {post.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{post.username}</p>
                        <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{backgroundColor: 'rgba(166, 25, 46, 0.2)', color: '#A6192E'}}>
                      {categories.find(cat => cat.value === post.category)?.icon} {categories.find(cat => cat.value === post.category)?.label || post.category}
                    </span>
                  </div>
                  <p className="mb-4 text-gray-300">{post.content}</p>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleVote(post.id, 'upvote')} 
                      className={`flex items-center gap-1 transition-colors ${
                        post.user_vote === 1 
                          ? 'text-green-500' 
                          : 'text-gray-400 hover:text-green-500'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <span className="text-sm">Upvote</span>
                    </button>
                    
                    <span className="text-white font-medium">{post.likes_count}</span>
                    
                    <button 
                      onClick={() => handleVote(post.id, 'downvote')} 
                      className={`flex items-center gap-1 transition-colors ${
                        post.user_vote === -1 
                          ? 'text-red-500' 
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span className="text-sm">Downvote</span>
                    </button>
                    
                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm">{post.comment_count || 0} Comments</span>
                    </button>
                  </div>
                  
                  {showComments[post.id] && (
                    <div className="mt-4 border-t border-gray-700 pt-4">
                      <div className="space-y-3 mb-4">
                        {comments[post.id]?.map(comment => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{backgroundColor: '#A6192E'}}>
                              {comment.username[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-medium text-sm">{comment.username}</span>
                                <span className="text-gray-500 text-xs">{new Date(comment.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-gray-300 text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-red-600 text-sm"
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({...prev, [post.id]: e.target.value}))}
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
                    </div>
                  )}
                </div>
              ))}
            </div>
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
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Pending Requests</h3>
              {connections.filter(c => c.status === 'pending' && !c.is_sender).map(conn => (
                <div key={conn.id} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center">
                  <p className="text-white">{conn.username}</p>
                  <button
                    onClick={() => handleAcceptRequest(conn.id)}
                    className="px-4 py-2 text-white rounded-lg text-sm"
                    style={{backgroundColor: '#A6192E'}}
                  >
                    Accept
                  </button>
                </div>
              ))}
              
              <h3 className="text-lg font-semibold text-white mt-6">Friends</h3>
              {connections.filter(c => c.status === 'accepted').map(conn => (
                <div key={conn.id} className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-white">{conn.username}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeSection === 'events' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">SDSU Career Fair 2024</h3>
                  <p className="text-gray-400 text-sm">📅 March 15, 2024 • 10:00 AM - 4:00 PM</p>
                  <p className="text-gray-400 text-sm">📍 Montezuma Hall</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{backgroundColor: 'rgba(166, 25, 46, 0.2)', color: '#A6192E'}}>Upcoming</span>
              </div>
              <p className="text-gray-300 mb-4">Connect with top employers and explore career opportunities. Bring your resume!</p>
              <button className="px-4 py-2 text-white rounded-lg text-sm" style={{backgroundColor: '#A6192E'}}>Register</button>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Study Group: CS 310</h3>
                  <p className="text-gray-400 text-sm">📅 March 10, 2024 • 6:00 PM - 8:00 PM</p>
                  <p className="text-gray-400 text-sm">📍 Library Room 204</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{backgroundColor: 'rgba(166, 25, 46, 0.2)', color: '#A6192E'}}>This Week</span>
              </div>
              <p className="text-gray-300 mb-4">Join us for a collaborative study session covering data structures and algorithms.</p>
              <button className="px-4 py-2 text-white rounded-lg text-sm" style={{backgroundColor: '#A6192E'}}>Join</button>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Aztec Basketball Game</h3>
                  <p className="text-gray-400 text-sm">📅 March 12, 2024 • 7:00 PM</p>
                  <p className="text-gray-400 text-sm">📍 Viejas Arena</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10B981'}}>Free Entry</span>
              </div>
              <p className="text-gray-300 mb-4">Cheer on the Aztecs! Free entry for students with valid ID.</p>
              <button className="px-4 py-2 text-white rounded-lg text-sm" style={{backgroundColor: '#A6192E'}}>Get Tickets</button>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Tech Workshop: Web Development</h3>
                  <p className="text-gray-400 text-sm">📅 March 18, 2024 • 3:00 PM - 5:00 PM</p>
                  <p className="text-gray-400 text-sm">📍 Engineering Building 101</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{backgroundColor: 'rgba(166, 25, 46, 0.2)', color: '#A6192E'}}>Workshop</span>
              </div>
              <p className="text-gray-300 mb-4">Learn modern web development with React and Next.js. Laptops required.</p>
              <button className="px-4 py-2 text-white rounded-lg text-sm" style={{backgroundColor: '#A6192E'}}>Register</button>
            </div>
          </div>
        )}
        
        {activeSection === 'courses' && (
          <div className="text-center py-12">
            <p className="text-gray-400">Course Compass coming soon...</p>
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
            </div>
          </div>
        )}
      </div>

      <div className="w-80 bg-gray-900 border-l border-gray-800 p-6">
        <h2 className="text-xl font-bold mb-6 text-white">Trending</h2>
        <div className="space-y-6">
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
                  
                  <h3 className="text-lg font-semibold text-white mb-3">Availability</h3>
                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-7 gap-2 text-center">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-xs text-gray-400">{day}</div>
                      ))}
                      {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28].map(d => (
                        <div key={d} className={`text-xs py-2 rounded ${[5,12,19,26].includes(d) ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>{d}</div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Green = Available for sessions</p>
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
    </div>
  );
}
