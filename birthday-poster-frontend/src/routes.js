// src/routes.js
import { lazy } from 'react';

const CreatePosterPage = lazy(() => import('./Components/CreatePosterPage'));
const ViewAllPoster = lazy(() => import('./Components/ViewAllPoster'));

const routes = [
  {
    path: '/',
    element: <CreatePosterPage />,
    exact: true
  },
  {
    path: '/view-all-posters',
    element: <ViewAllPoster />,
    exact: true
  }
];

export default routes;