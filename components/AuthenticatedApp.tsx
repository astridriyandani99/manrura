import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ContentDisplay from './ContentDisplay';
import Chatbot from './Chatbot';
import AdminDashboard from './AdminDashboard';
import { manruraData } from '../data/manruraData';
import type { Standard, User, Ward, AllAssessments, AssessmentScore } from '../types';
import { ArrowLeftIcon } from './Icons';

interface AuthenticatedAppProps {
    currentUser: User;
    allUsers: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    wards: Ward[];
    setWards: React.Dispatch<React.SetStateAction<Ward[]>>;
    allAssessments: AllAssessments;
    setAllAssessments: React.Dispatch<React.SetStateAction<AllAssessments>>;
}

const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({
    currentUser,
    allUsers,
    setUsers,
    wards,
    setWards,
    allAssessments,
    setAllAssessments
}) => {
  const [selectedStandardId, setSelectedStandardId] = useState<string>('bab1');
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(manruraData[0]);
  
  // Determine the selected ward based on user role
  const initialWardId = currentUser.role === 'Ward Staff' 
    ? currentUser.wardId 
    : (wards.length > 0 ? wards[0].id : '');
  const [selectedWardId, setSelectedWardId] = useState<string>(initialWardId || '');

  // Admin-specific state for viewing ward details
  const [adminSelectedWardId, setAdminSelectedWardId] = useState<string | null>(null);

  // Effect to handle role-based view changes
  useEffect(() => {
    if (currentUser.role !== 'Admin') {
      setAdminSelectedWardId(null);
    }
    // If user is Ward Staff, lock the selected ward
    if (currentUser.role === 'Ward Staff' && currentUser.wardId) {
        setSelectedWardId(currentUser.wardId);
    }
  }, [currentUser]);
  
  // Effect to update the standard content when ID changes
  useEffect(() => {
    if (selectedStandardId === 'admin_page') {
        setSelectedStandard(null);
        setAdminSelectedWardId(null); // Clear detailed view when returning to dashboard
    } else {
        const newStandard = manruraData.find(std => std.id === selectedStandardId) || null;
        setSelectedStandard(newStandard);
    }
  }, [selectedStandardId]);

  const handleScoreChange = (poinId: string, role: 'wardStaff' | 'assessor', updates: Partial<AssessmentScore>) => {
    setAllAssessments(prev => {
      const wardIdToUpdate = adminSelectedWardId && currentUser.role === 'Admin' ? adminSelectedWardId : selectedWardId;
      const currentWardAssessments = prev[wardIdToUpdate] || {};
      const existingPoinAssessment = currentWardAssessments[poinId] || {};
      
      const existingRoleScore = existingPoinAssessment[role] || { score: null, notes: '', evidence: null };

      const updatedRoleScore = {
        ...existingRoleScore,
        ...updates
      };

      if (role === 'assessor') {
        updatedRoleScore.assessorId = currentUser.id;
      }

      const updatedPoinAssessment = {
        ...existingPoinAssessment,
        [role]: updatedRoleScore
      };

      return {
        ...prev,
        [wardIdToUpdate]: {
          ...currentWardAssessments,
          [poinId]: updatedPoinAssessment
        }
      };
    });
  };

  const addWard = (wardName: string) => {
    const newWard: Ward = {
      id: `ward-${Date.now()}`,
      name: wardName,
    };
    setWards(prev => [...prev, newWard]);
  };

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const handleAdminSelectWard = (wardId: string) => {
    setAdminSelectedWardId(wardId);
    if (selectedStandardId === 'admin_page') {
      setSelectedStandardId('bab1');
    }
  };

  const handleReturnToDashboard = () => {
    setSelectedStandardId('admin_page');
  };
  
  // Determine which assessment data to display
  const isViewingAsAdminDetail = currentUser.role === 'Admin' && adminSelectedWardId;
  const wardIdForDisplay = isViewingAsAdminDetail ? adminSelectedWardId : selectedWardId;
  const assessmentDataForDisplay = allAssessments[wardIdForDisplay!] || {};
  const adminSelectedWard = adminSelectedWardId ? wards.find(w => w.id === adminSelectedWardId) : null;
  const isReadOnly = currentUser.role === 'Admin';

  return (
    <div className="flex h-screen font-sans antialiased">
      <Sidebar 
        standards={manruraData}
        selectedStandardId={selectedStandardId}
        setSelectedStandardId={setSelectedStandardId}
        currentUser={currentUser}
        wards={wards}
        selectedWardId={selectedWardId}
        setSelectedWardId={setSelectedWardId}
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-100">
        {currentUser.role === 'Admin' && (!adminSelectedWardId || selectedStandardId === 'admin_page') ? (
            <AdminDashboard 
                wards={wards} 
                allUsers={allUsers}
                allAssessments={allAssessments}
                manruraData={manruraData}
                onAddWard={addWard}
                onAddUser={addUser}
                onSelectWard={handleAdminSelectWard}
            />
        ) : isViewingAsAdminDetail && selectedStandard ? ( // Admin viewing specific ward
            <div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">
                    Hasil Audit: <span className="text-sky-700">{adminSelectedWard?.name}</span>
                    </h2>
                    <button 
                    onClick={handleReturnToDashboard}
                    className="flex items-center justify-center sm:justify-start px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                    <ArrowLeftIcon className="w-5 h-5 mr-2"/>
                    Kembali ke Dashboard
                    </button>
                </div>
                <ContentDisplay 
                    standard={selectedStandard}
                    currentUser={currentUser}
                    assessmentData={assessmentDataForDisplay}
                    onScoreChange={() => {}} // Read-only for Admin
                    users={allUsers}
                />
            </div>
        ) : ( // Assessor or Ward Staff view
          <ContentDisplay 
            standard={selectedStandard}
            currentUser={currentUser}
            assessmentData={assessmentDataForDisplay}
            onScoreChange={isReadOnly ? ()=>{} : handleScoreChange}
            users={allUsers}
          />
        )}
      </main>
      <Chatbot />
    </div>
  );
};

export default AuthenticatedApp;
