// src/routes.js
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
// Existing routes
import EventLoginPage from './Components/EventLoginPage';
import ClientPage from './Components/ClientPage';
import ClientPageUser from './Components/ClientPageUser';

const CreatePosterPage = lazy(() => import('./Components/CreatePosterPage'));
const ViewAllPoster = lazy(() => import('./Components/ViewAllPoster'));
// Lazy load new admin system components
// const Login = lazy(() => import('./Components/Login'));
// const Dashboard = lazy(() => import('./Components/Dashboard'));
// const AdminList = lazy(() => import('./Components/AdminList'));
// const CreateAdmin = lazy(() => import('./Components/CreateAdmin'));
// const Settings = lazy(() => import('./Components/Settings'));
// const TemplateManager = lazy(() => import('./Components/TemplateManager'));
// const CreateTemplate = lazy(() => import('./Components/CreateTemplate'));
// const UserManager = lazy(() => import('./Components/UserManager'));
// const UserDetails = lazy(() => import('./Components/UserDetails'));
const PhotoUpload = lazy(() => import('./Components/PhotoUpload'));
// Layout component (needs to be imported or created)
const Layout = lazy(() => import('./Layout/Layout'));

// Private Route wrapper component
const PrivateRoute = lazy(() => import('./Components/PrivateRoute'));

// Layout wrapper for admin routes
const AdminLayout = ({ children }) => (
  <Layout>{children}</Layout>
);
const routes = [
//   {
// path: '/',
//     element: <ClientPageUser />,
//     exact: true
//   },
    {
path: '/',
    element: <EventLoginPage />,
    exact: true
  },
  {
    path: '/adminsettings',
    element: <CreatePosterPage />,
    exact: true
  },
  {
    path: '/view-all-posters',
    element: <ViewAllPoster />,
    exact: true
  },
  {
    path: '/client/:eventName/:id',
    element: <ClientPage />,
    exact: true
  },
  // Admin System Routes
  
  // Auth Routes (No Layout)
  // {
  //   path: '/admin/login',
  //   element: <Login />,
  //   exact: true
  // },
  
  // // Admin Routes with Layout and Private Route
  // {
  //   path: '/admin',
  //   element: <Navigate to="/admin/dashboard" replace />,
  //   exact: true
  // },
  // {
  //   path: '/admin/dashboard',
  //   element: (
  //     <PrivateRoute>
  //       <AdminLayout>
  //         <Dashboard />
  //       </AdminLayout>
  //     </PrivateRoute>
  //   ),
  //   exact: true
  // },
  // {
  //   path: '/admin/admins',
  //   element: (
  //     <PrivateRoute>
  //       <AdminLayout>
  //         <AdminList />
  //       </AdminLayout>
  //     </PrivateRoute>
  //   ),
  //   exact: true
  // },
  // {
  //   path: '/admin/admins/create',
  //   element: (
  //     <PrivateRoute>
  //       <AdminLayout>
  //         <CreateAdmin />
  //       </AdminLayout>
  //     </PrivateRoute>
  //   ),
  //   exact: true
  // },
  // {
  //   path: '/admin/admins/edit/:id',
  //   element: (
  //     <PrivateRoute>
  //       <AdminLayout>
  //         <CreateAdmin /> {/* Reuse CreateAdmin for editing */}
  //       </AdminLayout>
  //     </PrivateRoute>
  //   ),
  //   exact: true
  // },
  // {
  //   path: '/admin/templates',
  //   element: (
  //     <PrivateRoute>
  //       <AdminLayout>
  //         <TemplateManager />
  //       </AdminLayout>
  //     </PrivateRoute>
  //   ),
  //   exact: true
  // },
  // {
  //   path: '/admin/templates/create',
  //   element: (
  //     <PrivateRoute>
  //       <AdminLayout>
  //         <CreateTemplate />
  //       </AdminLayout>
  //     </PrivateRoute>
  //   ),
  //   exact: true
  // },
  // {
  //   path: '/admin/templates/edit/:id',
  //   element: (
  //     <PrivateRoute>
  //       <AdminLayout>
  //         <CreateTemplate /> {/* Reuse CreateTemplate for editing */}
  //       </AdminLayout>
  //     </PrivateRoute>
  //   ),
  //   exact: true
  // },
  // {
  //   path: '/admin/users',
  //   element: (
  //     <PrivateRoute>
  //       <AdminLayout>
  //         <UserManager />
  //       </AdminLayout>
  //     </PrivateRoute>
  //   ),
  //   exact: true
  // },
  // {
  //   path: '/admin/users/create',
  //   element: (
  //     <PrivateRoute>
  //       <AdminLayout>
  //         <UserDetails /> {/* Reuse UserDetails for creating */}
  //       </AdminLayout>
  //     </PrivateRoute>
  //   ),
  //   exact: true
  // },
  // {
  //   path: '/admin/users/:id',
  //   element: (
  //     <PrivateRoute>
  //       <AdminLayout>
  //         <UserDetails />
  //       </AdminLayout>
  //     </PrivateRoute>
  //   ),
  //   exact: true
  // },
  // {
  //   path: '/admin/upload',
  //   element: (
  //     // <PrivateRoute>
  //       <AdminLayout>
  //         <PhotoUpload />
  //       </AdminLayout>
  //     // </PrivateRoute>
  //   ),
  //   exact: true
  // },
  // {
  //   path: '/admin/settings',
  //   element: (
  //     <PrivateRoute>
  //       <AdminLayout>
  //         <Settings />
  //       </AdminLayout>
  //     </PrivateRoute>
  //   ),
  //   exact: true
  // },
  
  // Fallback routes
  // {
  //   path: '*',
  //   element: <Navigate to="/" replace />,
  //   exact: true
  // },
  // {
  //   path: '/admin/*',
  //   element: <Navigate to="/admin/dashboard" replace />,
  //   exact: true
  // }
];

export default routes;