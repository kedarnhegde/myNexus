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
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({username: '', email: '', oldPassword: '', newPassword: '', confirmPassword: ''});
  const [modal, setModal] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info'}>({isOpen: false, title: '', message: '', type: 'info'});
  const [eventModal, setEventModal] = useState<{isOpen: boolean, eventName: string, action: string}>({isOpen: false, eventName: '', action: ''});
  const [userEvents, setUserEvents] = useState<{eventName: string, action: string, date: string}[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<{[key: string]: string}>({});
  const [connectedClubs, setConnectedClubs] = useState<string[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [clubFilter, setClubFilter] = useState('All');

  const handleClubConnect = (clubName: string, url: string) => {
    window.open(url, '_blank');
    setModal({isOpen: true, title: 'Success', message: `Successfully connected to ${clubName}!`, type: 'success'});
  };

  const getButtonText = (eventName: string, originalAction: string) => {
    const registeredAction = registeredEvents[eventName];
    if (!registeredAction) return originalAction;
    
    switch (registeredAction) {
      case 'Register': return 'Registered';
      case 'Join': return 'Joined';
      case 'Get Tickets': return 'Purchased';
      default: return originalAction;
    }
  };



  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      setLoading(false);
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    fetch('http://localhost:3000/api/posts/')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error(err));
    
    fetch(`http://localhost:3000/api/messages/${parsedUser.id}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error(err));
    
    fetch(`http://localhost:3000/api/connections/${parsedUser.id}`)
      .then(res => res.json())
      .then(data => setConnections(data))
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
    
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth');
  };

  const handleLike = async (postId: number) => {
    try {
      await fetch(`http://localhost:3000/api/posts/${postId}/like?user_id=${user.id}`, {
        method: 'POST'
      });
      const res = await fetch('http://localhost:3000/api/posts/');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await fetch(`http://localhost:3000/api/users/search/${searchQuery}?current_user_id=${user.id}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendRequest = async (friendId: number) => {
    try {
      await fetch(`http://localhost:3000/api/connections/?user_id=${user.id}&friend_id=${friendId}`, {
        method: 'POST'
      });
      const res = await fetch(`http://localhost:3000/api/connections/${user.id}`);
      const data = await res.json();
      setConnections(data);
      setSearchResults([]);
      setSearchQuery('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptRequest = async (connectionId: number) => {
    try {
      await fetch(`http://localhost:3000/api/connections/${connectionId}?status=accepted`, {
        method: 'PUT'
      });
      const res = await fetch(`http://localhost:3000/api/connections/${user.id}`);
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
        ? `http://localhost:3000/api/users/${user.id}?old_password=${encodeURIComponent(profileData.oldPassword)}`
        : `http://localhost:3000/api/users/${user.id}`;
      
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
          
          <button onClick={() => setActiveSection('clubs')} className="w-full flex items-center gap-3 p-3 rounded-lg text-left" style={{backgroundColor: activeSection === 'clubs' ? 'rgba(166, 25, 46, 0.2)' : 'transparent'}}>
            <svg className="w-6 h-6" style={{color: '#A6192E'}} fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span className="font-medium text-white">Clubs</span>
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
          {activeSection === 'home' ? 'Home' : activeSection === 'peer' ? 'Peer Connect' : activeSection === 'events' ? 'Events' : activeSection === 'clubs' ? 'Clubs' : activeSection === 'courses' ? 'Course Compass' : activeSection === 'messages' ? 'Messages' : 'Profile'}
        </h2>
        
        {activeSection === 'home' && (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-gray-900 rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{backgroundColor: '#A6192E'}}>
                    {post.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{post.username}</p>
                    <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="mb-4 text-gray-300">{post.content}</p>
                <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 text-gray-400 hover:text-red-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                  </svg>
                  <span>{post.likes_count}</span>
                </button>
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
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {searchResults.map(result => (
                    <div key={result.id} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{result.username}</p>
                        <p className="text-gray-400 text-sm">{result.email}</p>
                      </div>
                      <button
                        onClick={() => handleSendRequest(result.id)}
                        className="px-4 py-2 text-white rounded-lg text-sm"
                        style={{backgroundColor: '#A6192E'}}
                      >
                        Send Request
                      </button>
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
    </div>
  );
}
