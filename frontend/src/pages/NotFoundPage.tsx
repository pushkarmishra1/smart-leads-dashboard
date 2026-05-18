import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 items-center justify-center mb-6">
          <Zap size={32} className="text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-6xl font-black text-gray-200 dark:text-gray-800 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Page not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
