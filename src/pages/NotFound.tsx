// pages/NotFound.tsx
import { useLocation, Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page <code>{location.pathname}</code> does not exist.</p>
      <Link to="/">Return to Home</Link>
    </div>
  );
};

export default NotFound;
