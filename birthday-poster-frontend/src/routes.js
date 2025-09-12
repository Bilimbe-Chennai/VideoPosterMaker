// src/routes.js
import { lazy } from 'react';
import ClientPage from './Components/ClientPage';
import EventLoginPage from './Components/EventLoginPage';

const CreatePosterPage = lazy(() => import('./Components/CreatePosterPage'));
const ViewAllPoster = lazy(() => import('./Components/ViewAllPoster'));

const routes = [
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
  }
];

export default routes;