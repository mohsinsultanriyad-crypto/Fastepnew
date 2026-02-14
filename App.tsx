
import React, { useState, useEffect } from 'react';
import { User, Shift, Leave, SitePost, AdvanceRequest, Announcement } from './types';
import WorkerApp from './components/WorkerApp';
import AdminApp from './components/AdminApp';
import Login from './components/Login';
import { createApiClient } from './src/lib/api';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [posts, setPosts] = useState<SitePost[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [advanceRequests, setAdvanceRequests] = useState<AdvanceRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from backend when a user logs in
  useEffect(() => {
    async function loadForUser(user: User) {
      try {
        const api = createApiClient();
        if (user.role === 'worker') {
          const res = await api.get('/api/entries/my');
          setShifts(res.data.entries || []);
        } else {
          const u = await api.get('/api/admin/users');
          setWorkers(u.data.users || []);
          const e = await api.get('/api/admin/entries?status=PENDING');
          setShifts(e.data.entries || []);
        }
      } catch (err) {
        console.error('Error loading data for user', err);
      } finally {
        setIsLoaded(true);
      }
    }
    if (currentUser) loadForUser(currentUser);
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} workers={workers} />;
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-xl relative overflow-hidden flex flex-col">
      {currentUser.role === 'worker' ? (
        <WorkerApp 
          user={currentUser} 
          shifts={shifts} 
          setShifts={setShifts} 
          leaves={leaves} 
          setLeaves={setLeaves}
          posts={posts}
          setPosts={setPosts}
          advanceRequests={advanceRequests}
          setAdvanceRequests={setAdvanceRequests}
          announcements={announcements}
          onLogout={handleLogout}
        />
      ) : (
        <AdminApp 
          user={currentUser} 
          shifts={shifts} 
          setShifts={setShifts} 
          leaves={leaves} 
          setLeaves={setLeaves}
          workers={workers}
          setWorkers={setWorkers}
          posts={posts}
          setPosts={setPosts}
          advanceRequests={advanceRequests}
          setAdvanceRequests={setAdvanceRequests}
          announcements={announcements}
          setAnnouncements={setAnnouncements}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default App;
