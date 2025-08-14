import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';
import AuthenticatedApp from './components/AuthenticatedApp';
import { INITIAL_USERS, WARDS as initialWards } from './constants';
import type { User, Ward, AllAssessments } from './types';

const App: React.FC = () => {
  const { currentUser } = useAuth();
  
  // All major application state is managed here
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('manrura_users');
    return savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;
  });
  const [wards, setWards] = useState<Ward[]>(() => {
     const savedWards = localStorage.getItem('manrura_wards');
    return savedWards ? JSON.parse(savedWards) : initialWards;
  });
  const [allAssessments, setAllAssessments] = useState<AllAssessments>(() => {
    const savedAssessments = localStorage.getItem('manrura_assessments');
    return savedAssessments ? JSON.parse(savedAssessments) : {};
  });

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem('manrura_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('manrura_wards', JSON.stringify(wards));
  }, [wards]);

  useEffect(() => {
    localStorage.setItem('manrura_assessments', JSON.stringify(allAssessments));
  }, [allAssessments]);

  if (!currentUser) {
    return <LoginScreen users={users} />;
  }

  return (
    <AuthenticatedApp 
      currentUser={currentUser}
      allUsers={users}
      setUsers={setUsers}
      wards={wards}
      setWards={setWards}
      allAssessments={allAssessments}
      setAllAssessments={setAllAssessments}
    />
  );
};

export default App;
