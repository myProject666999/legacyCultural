import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Recharge from './pages/Recharge';
import Favorites from './pages/Favorites';
import Forum from './pages/Forum';
import News from './pages/News';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
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
            <AppLayout>
              <Home />
            </AppLayout>
          }
        />
        <Route
          path="/products"
          element={
            <AppLayout>
              <Products />
            </AppLayout>
          }
        />
        <Route
          path="/products/:id"
          element={
            <AppLayout>
              <ProductDetail />
            </AppLayout>
          }
        />
        <Route
          path="/orders"
          element={
            <AppLayout>
              <PrivateRoute>
              <Orders />
            </PrivateRoute>
            </AppLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <AppLayout>
              <PrivateRoute>
              <Profile />
            </PrivateRoute>
            </AppLayout>
          }
        />
        <Route
          path="/recharge"
          element={
            <AppLayout>
              <PrivateRoute>
              <Recharge />
            </PrivateRoute>
            </AppLayout>
          }
        />
        <Route
          path="/favorites"
          element={
            <AppLayout>
              <PrivateRoute>
              <Favorites />
            </PrivateRoute>
            </AppLayout>
          }
        />
        <Route
          path="/forum"
          element={
            <AppLayout>
              <Forum />
            </AppLayout>
          }
        />
        <Route
          path="/forum/:id"
          element={
            <AppLayout>
              <Forum />
            </AppLayout>
          }
        />
        <Route
          path="/news"
          element={
            <AppLayout>
              <News />
            </AppLayout>
          }
        />
        <Route
          path="/news/:id"
          element={
            <AppLayout>
              <News />
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
