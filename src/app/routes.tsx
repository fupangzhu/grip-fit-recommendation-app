import { createBrowserRouter, Outlet } from 'react-router';
import { DemoNav } from './components/DemoNav';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { AboutPage } from './components/AboutPage';
import { HandMeasurement } from './components/HandMeasurement';
import { PhoneSelection } from './components/PhoneSelection';
import { ModelPresets } from './components/ModelPresets';
import { ParamPreview } from './components/ParamPreview';
import { GripReport } from './components/GripReport';
import { AdminScoringPage } from './components/AdminScoringPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminPhones } from './components/admin/AdminPhones';
import { AdminRecords } from './components/admin/AdminRecords';
import { tobRoutes } from './components/tob/tobRoutes';

export const router = createBrowserRouter([
  {
    element: (
      <>
      <DemoNav />
      < Outlet />
      </>
    ),
    children: [
      ...tobRoutes,
      {
        path: '/',
        Component: Layout,
        children: [
          { index: true, Component: HomePage },
          { path: 'about', Component: AboutPage },
          { path: 'hand-measure', Component: HandMeasurement },
          { path: 'phone-select', Component: PhoneSelection },
          { path: 'model-presets', Component: ModelPresets },
          { path: 'grip-preview', Component: ParamPreview },
          { path: 'grip-report', Component: GripReport },
          { path: 'param-preview', Component: ParamPreview },
          { path: 'custom-params', Component: ParamPreview },
          { path: 'preview', Component: GripReport },
          { path: '*', Component: HomePage },
        ],
      },
      {
        path: '/admin',
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: 'users', Component: AdminUsers },
          { path: 'phones', Component: AdminPhones },
          { path: 'records', Component: AdminRecords },
          { path: 'scoring', Component: AdminScoringPage },
        ],
      },
    ]
  }
]);