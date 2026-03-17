import React from 'react';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
  return (
    <main className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-slate-700 mb-4">
          StudyGlobal collects account and profile information needed to provide recommendations and support.
        </p>
        <p className="text-slate-700 mb-4">
          We do not sell personal data and only share it with trusted providers required to operate the service.
        </p>
        <Link to="/signup" className="text-sky-600 hover:text-sky-700 font-medium">Back to signup</Link>
      </div>
    </main>
  );
};

export default Privacy;
