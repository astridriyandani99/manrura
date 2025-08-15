import React from 'react';
import type { Ward, User, AllAssessments, Standard, AssessmentPeriod } from '../types';
import { BuildingOfficeIcon, UsersIcon, ChartBarSquareIcon, EyeIcon } from './Icons';
import AccountManagement from './AccountManagement';
import AssessmentPeriodManagement from './AssessmentPeriodManagement';

interface AdminDashboardProps {
    wards: Ward[];
    allUsers: User[];
    allAssessments: AllAssessments;
    manruraData: Standard[];
    assessmentPeriods: AssessmentPeriod[];
    onAddWard: (name: string) => void;
    onAddUser: (user: User) => void;
    onSelectWard: (wardId: string) => void;
    onAddAssessmentPeriod: (period: Omit<AssessmentPeriod, 'id'>) => void;
}

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 flex items-center">
    <div className="p-3 rounded-full bg-sky-100 text-sky-600 mr-4">
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
    <div className="flex items-center gap-3">
        <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div 
            className="bg-sky-600 h-2.5 rounded-full" 
            style={{ width: `${value}%` }}
            title={`${value.toFixed(1)}%`}
        ></div>
        </div>
        <span className="text-sm font-medium text-slate-600 w-12 text-right">{value.toFixed(1)}%</span>
    </div>
);


const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    wards, 
    allUsers, 
    allAssessments, 
    manruraData,
    assessmentPeriods,
    onAddWard, 
    onAddUser, 
    onSelectWard,
    onAddAssessmentPeriod
 }) => {
    
    const assessors = allUsers.filter(u => u.role === 'Assessor');
    const allPoinIds = manruraData.flatMap(std => std.elements.flatMap(el => el.poin.map(p => p.id)));
    const totalPoinCountInStandard = allPoinIds.length;

    const wardSummaries = wards.map(ward => {
        const assessmentData = allAssessments[ward.id] || {};
        const assessedPoin = allPoinIds.filter(id => assessmentData[id]?.assessor?.score !== null && assessmentData[id]?.assessor?.score !== undefined);
        
        const currentScore = assessedPoin.reduce((sum, id) => sum + (assessmentData[id]?.assessor?.score || 0), 0);
        const maxScore = totalPoinCountInStandard * 10;
        const progress = totalPoinCountInStandard > 0 ? (assessedPoin.length / totalPoinCountInStandard) * 100 : 0;
        
        return {
            id: ward.id,
            name: ward.name,
            score: currentScore,
            maxScore: maxScore,
            progress: progress
        };
    });

    const totalAssessedPoints = wardSummaries.reduce((acc, summary) => acc + (summary.progress / 100 * totalPoinCountInStandard), 0);
    const totalPossiblePointsAcrossWards = wards.length * totalPoinCountInStandard;
    const overallCompletion = totalPossiblePointsAcrossWards > 0 ? (totalAssessedPoints / totalPossiblePointsAcrossWards) * 100 : 0;

    const totalAssessedScoreSum = wardSummaries.reduce((acc, summary) => {
         const assessedCount = (summary.progress / 100) * totalPoinCountInStandard;
         if (assessedCount > 0) {
             return acc + summary.score;
         }
         return acc;
    }, 0);
    const totalMaxScoreForAssessedPoints = wardSummaries.reduce((acc, summary) => acc + ((summary.progress / 100 * totalPoinCountInStandard) * 10), 0);
    const overallAverageScore = totalMaxScoreForAssessedPoints > 0 ? (totalAssessedScoreSum / totalMaxScoreForAssessedPoints) * 100 : 0;


    return (
        <div>
            <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Admin Dashboard</h2>
                <p className="text-slate-600">Overall summary of ward assessments and account management.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KpiCard title="Total Wards" value={wards.length} icon={<BuildingOfficeIcon className="w-6 h-6"/>} />
                <KpiCard title="Total Assessors" value={assessors.length} icon={<UsersIcon className="w-6 h-6"/>} />
                <KpiCard title="Overall Validation" value={`${overallCompletion.toFixed(1)}%`} icon={<ChartBarSquareIcon className="w-6 h-6"/>} />
                <KpiCard title="Average Score" value={`${overallAverageScore.toFixed(1)}%`} icon={<ChartBarSquareIcon className="w-6 h-6"/>} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 mb-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Ward Performance Summary</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Ward Name</th>
                                <th scope="col" className="px-6 py-3">Validation Progress</th>
                                <th scope="col" className="px-6 py-3">Total Score</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wardSummaries.map(summary => (
                                <tr key={summary.id} className="bg-white border-b hover:bg-slate-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                        {summary.name}
                                    </th>
                                    <td className="px-6 py-4">
                                       <ProgressBar value={summary.progress} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-slate-800">{summary.score}</span>
                                        <span className="text-slate-500"> / {summary.maxScore}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onSelectWard(summary.id)}
                                            className="font-medium text-sky-600 hover:text-sky-800 flex items-center justify-end w-full"
                                            aria-label={`View details for ${summary.name}`}
                                        >
                                            <span className="hidden sm:inline">Lihat Detail</span>
                                            <EyeIcon className="w-5 h-5 sm:ml-2" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="space-y-8">
                <AssessmentPeriodManagement 
                    periods={assessmentPeriods}
                    onAddPeriod={onAddAssessmentPeriod}
                />
                <AccountManagement 
                    wards={wards} 
                    allUsers={allUsers}
                    onAddWard={onAddWard}
                    onAddUser={onAddUser}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;