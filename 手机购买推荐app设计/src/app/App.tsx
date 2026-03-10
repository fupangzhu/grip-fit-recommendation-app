import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './components/AppContext';
import { AuthProvider } from './components/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </AuthProvider>
  );
}
