import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="w-full flex-grow overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
