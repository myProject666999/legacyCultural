import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import ProductManagement from './pages/ProductManagement';
import ProductTypeManagement from './pages/ProductTypeManagement';
import OrderManagement from './pages/OrderManagement';
import AnnouncementManagement from './pages/AnnouncementManagement';
import NewsManagement from './pages/NewsManagement';
import ForumManagement from './pages/ForumManagement';
import CarouselManagement from './pages/CarouselManagement';
import AdminManagement from './pages/AdminManagement';
import Statistics from './pages/Statistics';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <PrivateRoute>
              <AdminLayout>
                <Statistics />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <AdminLayout>
                <UserManagement />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <AdminLayout>
                <ProductManagement />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/product-types"
          element={
            <PrivateRoute>
              <AdminLayout>
                <ProductTypeManagement />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <AdminLayout>
                <OrderManagement />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <PrivateRoute>
              <AdminLayout>
                <AnnouncementManagement />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/news"
          element={
            <PrivateRoute>
              <AdminLayout>
                <NewsManagement />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forums"
          element={
            <PrivateRoute>
              <AdminLayout>
                <ForumManagement />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/carousels"
          element={
            <PrivateRoute>
              <AdminLayout>
                <CarouselManagement />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admins"
          element={
            <PrivateRoute>
              <AdminLayout>
                <AdminManagement />
              </AdminLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
