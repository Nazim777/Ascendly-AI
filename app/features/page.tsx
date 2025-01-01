import React from 'react';

const features = [
  {
    title: 'Tailored Resume Generation',
    description: 'Craft ATS-Optimized Resumes that highlight key skills and experiences to pass applicant tracking systems.',
    icon: '📄'
  },
  {
    title: 'Cover Letter Personalization',
    description: 'Generate unique cover letters that emphasize relevant experience and achievements for each application.',
    icon: '💼'
  },
  {
    title: 'AI-Driven Job Matching',
    description: 'Find the right opportunities by analyzing job listings and suggesting roles that match your profile.',
    icon: '🧠'
  },
  {
    title: 'Follow-Up Email Generator',
    description: 'Auto-generate professional follow-up emails to increase application success.',
    icon: '📧'
  },
  {
    title: 'LinkedIn Post Generator',
    description: 'Craft engaging LinkedIn posts that promote thought leadership and career achievements.',
    icon: '📢'
  },
  {
    title: 'Twitter Thread Generator',
    description: 'Create compelling Twitter threads that highlight career progress and engage your audience.',
    icon: '📝'
  },
  {
    title: 'Instagram Caption Creator',
    description: 'Generate catchy Instagram captions for job wins, certifications, and milestones.',
    icon: '📸'
  }
];

const FeaturesPage: React.FC = () => {
  return (
    <div className="  min-h-screen bg-gradient-to-b from-black to-gray-900 text-gray-100 overflow-hidden pt-20">
      <h1 className="text-4xl font-bold text-center mb-12">🚀 Features</h1>
      <p className="text-lg  text-center mb-16">Unlock the power of AI to streamline your job applications and boost your career!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className=" shadow-lg border border-gray-800 rounded-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-5xl text-center mb-4">{feature.icon}</div>
            <h2 className="text-2xl font-semibold text-center mb-4">{feature.title}</h2>
            <p className="text-center text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesPage;

