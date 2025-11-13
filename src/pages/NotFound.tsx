import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 - Route not found:', location.pathname);
    
    // If we hit a 404, try to redirect to home
    if (location.pathname !== '/') {
      console.log('Attempting to redirect to home...');
      // Use setTimeout to avoid React state update during render
      setTimeout(() => {
        window.location.hash = '/';
      }, 100);
    }
  }, [location]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page <code>{location.pathname}</code> does not exist.</p>
      <p>Current hash: <code>{window.location.hash}</code></p>
      <Link to="/">Return to Home</Link>
    </div>
  );
};

export default NotFound;
