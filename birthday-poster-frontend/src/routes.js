// src/routes.js
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
// Existing routes
import EventLoginPage from './Components/EventLoginPage';
import ClientPage from './Components/ClientPage';
// import ClientPageUser from './Components/ClientPageUser';
import ShareScreen from './Components/ShareScreen';

const Login = lazy(() => import('./Components/Login'));
const CreatePosterPage = lazy(() => import('./Components/CreatePosterPage'));
const ViewAllPoster = lazy(() => import('./Components/ViewAllPoster'));
const Dashboard = lazy(() => import('./SuperAdmin/Dashboard'));
const AdminList = lazy(() => import('./SuperAdmin/AdminList'));
const CreateAdmin = lazy(() => import('./SuperAdmin/CreateAdmin'));
const Settings = lazy(() => import('./SuperAdmin/Settings'));
const TemplateManager = lazy(() => import('./SuperAdmin/TemplateManager'));
const CreateTemplate = lazy(() => import('./Components/CreateTemplate'));
const UserManager = lazy(() => import('./SuperAdmin/UserManager'));
const UserForm = lazy(() => import('./SuperAdmin/CreateAdmin'));
const UserDetails = lazy(() => import('./Components/UserDetails'));
const PhotoUpload = lazy(() => import('./Components/PhotoUpload'));
// Layout component (needs to be imported or created)
const Layout = lazy(() => import('./SuperAdmin/Layout/Layout'));

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
    path: '/eventlogin',
    element: <EventLoginPage />,
    exact: true
  },
  {
    path: '/',
    element: <Login />,
    exact: true
  },
  {
    path: '/adminsettings',
    element: <CreatePosterPage />,
    exact: true
  },
  {
    path: '/photomergeapp/share/:photoId',
    element: <ShareScreen />,
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
  {
    path: '/admin/login',
    element: <Login />,
    exact: true
  },

  // Admin Routes with Layout and Private Route
  {
    path: '/superadmin',
    element: <Navigate to="/superadmin/dashboard" replace />,
    exact: true
  },
  {
    path: '/superadmin/dashboard',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </PrivateRoute>
    ),
    exact: true
  },
  {
    path: '/superadmin/admins',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <AdminList />
        </AdminLayout>
      </PrivateRoute>
    ),
    exact: true
  },
  {
    path: '/superadmin/admins/create',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <CreateAdmin />
        </AdminLayout>
      </PrivateRoute>
    ),
    exact: true
  },
  {
    path: '/superadmin/admins/edit/:id',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <CreateAdmin /> {/* Reuse CreateAdmin for editing */}
        </AdminLayout>
      </PrivateRoute>
    ),
    exact: true
  },
  {
    path: '/superadmin/templates',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <TemplateManager />
        </AdminLayout>
      </PrivateRoute>
    ),
    exact: true
  },
  {
    path: '/superadmin/templates/create',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <CreateTemplate />
        </AdminLayout>
      </PrivateRoute>
    ),
    exact: true
  },
  {
    path: '/superadmin/templates/edit/:id',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <CreateTemplate /> {/* Reuse CreateTemplate for editing */}
        </AdminLayout>
      </PrivateRoute>
    ),
    exact: true
  },
  {
    path: '/superadmin/users',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <UserManager />
        </AdminLayout>
      </PrivateRoute>
    ),
    exact: true
  },
  {
    path: '/superadmin/users/create',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <UserForm />
        </AdminLayout>
      </PrivateRoute>
    ),
    exact: true
  },
  {
    path: '/superadmin/users/edit/:id',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <UserForm />
        </AdminLayout>
      </PrivateRoute>
    ),
    exact: true
  },
  {
    path: '/superadmin/users/:id',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <UserDetails />
        </AdminLayout>
      </PrivateRoute>
    ),
    exact: true
  },
  {
    path: '/superadmin/upload',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <PhotoUpload />
        </AdminLayout>
      </PrivateRoute>
    ),
    exact: true
  },
  {
    path: '/superadmin/settings',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <Settings />
        </AdminLayout>
      </PrivateRoute>
    ),
    exact: true
  },

  // Fallback routes
  {
    path: '*',
    element: <Navigate to="/" replace />,
    exact: true
  },
  {
    path: '/superadmin/*',
    element: <Navigate to="/superadmin/dashboard" replace />,
    exact: true
  }
];

export default routes;