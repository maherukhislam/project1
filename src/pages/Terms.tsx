import React from 'react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <main className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms of Service</h1>
        <p className="text-slate-700 mb-4">
          By using StudyGlobal, you agree to use the platform lawfully and provide accurate account information.
        </p>
        <p className="text-slate-700 mb-4">
          We may update these terms over time. Continued use of the service after updates indicates acceptance
          of revised terms.
        </p>
        <Link to="/signup" className="text-sky-600 hover:text-sky-700 font-medium">Back to signup</Link>
      </div>
    </main>
  );
};

export default Terms;
