import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { AppProvider } from './ToBStore';
import { RoleSelect } from './RoleSelect';
import { HELayout } from './he/HELayout';
import { HEDashboard } from './he/Dashboard';
import { HEProjectList } from './he/ProjectList';
import { HENewProject } from './he/NewProject';
import { HEParadigm } from './he/Paradigm';
import { HEProjectDetail } from './he/ProjectDetail';
import { RunLayout } from './he/run/RunLayout';
import { Participants } from './he/run/Participants';
import { LabPage } from './he/run/Lab';
import { SetupPage } from './he/run/Setup';
import { QuestionnairePage } from './he/run/Questionnaire';
import { CollectPage } from './he/run/Collect';
import { AnalysisPage } from './he/run/Analysis';
import { IDLayout } from './id/IDLayout';
import { IDDashboard } from './id/Dashboard';
import { PopulationStep } from './id/model/PopulationStep';
import { AttributesStep } from './id/model/AttributesStep';
import { ModelFront } from './id/model/ModelFront';
import { ModelSide } from './id/model/ModelSide';
import { ModelTop } from './id/model/ModelTop';
import { ModelIso } from './id/model/ModelIso';
import { ModelExport } from './id/model/ModelExport';
import { ExploreList } from './id/model/ExploreList';
import { ExploreVariant } from './id/model/ExploreVariant';
import { ReviewUpload } from './id/review/Upload';
import { ReviewPopulation } from './id/review/ReviewPopulation';
import { ReviewAnalyzing } from './id/review/Analyzing';
import { ReviewOverview } from './id/review/Overview';
import { ReviewHeatmapFront } from './id/review/HeatmapFront';
import { ReviewHeatmapSide } from './id/review/HeatmapSide';
import { ReviewIssueList } from './id/review/IssueList';
import { ReviewIssueDetail } from './id/review/IssueDetail';
import { ReviewExport } from './id/review/ExportReport';
import { UXLayout } from './ux/UXLayout';
import { UXDashboard } from './ux/Dashboard';
import { UXHeatmap } from './ux/Heatmap';

export const tobRoutes = [
  {
    path: '/tob',
    element: (
      <AppProvider>
        <Outlet />
      </AppProvider>
    ),
    children: [
      { index: true, element: <Navigate to="/tob/role-select" replace /> },
      { path: 'role-select', Component: RoleSelect },
      {
        path: 'he',
        Component: HELayout,
        children: [
          { index: true, element: <Navigate to="/tob/he/dashboard" replace /> },
          { path: 'dashboard', Component: HEDashboard },
          { path: 'projects', Component: HEProjectList },
          { path: 'projects/new', Component: HENewProject },
          { path: 'projects/new/paradigm', Component: HEParadigm },
          { path: 'projects/:id', Component: HEProjectDetail },
          {
            path: 'projects/:id/run',
            Component: RunLayout,
            children: [
              { index: true, element: <Navigate to="participants" replace /> },
              { path: 'participants', Component: Participants },
              { path: 'lab', Component: LabPage },
              { path: 'setup', Component: SetupPage },
              { path: 'questionnaire', Component: QuestionnairePage },
              { path: 'collect', Component: CollectPage },
              { path: 'analysis', Component: AnalysisPage },
            ],
          },
        ],
      },
      {
        path: 'id',
        Component: IDLayout,
        children: [
          { index: true, element: <Navigate to="/tob/id/dashboard" replace /> },
          { path: 'dashboard', Component: IDDashboard },
          { path: 'model/new/population', Component: PopulationStep },
          { path: 'model/new/attributes', Component: AttributesStep },
          { path: 'model/:id/front', Component: ModelFront },
          { path: 'model/:id/side', Component: ModelSide },
          { path: 'model/:id/top', Component: ModelTop },
          { path: 'model/:id/iso', Component: ModelIso },
          { path: 'model/:id/export', Component: ModelExport },
          { path: 'model/:id/explore', Component: ExploreList },
          { path: 'model/:id/explore/:variant', Component: ExploreVariant },
          { path: 'review/upload', Component: ReviewUpload },
          { path: 'review/population', Component: ReviewPopulation },
          { path: 'review/analyzing', Component: ReviewAnalyzing },
          { path: 'review/:id/overview', Component: ReviewOverview },
          { path: 'review/:id/heatmap/front', Component: ReviewHeatmapFront },
          { path: 'review/:id/heatmap/side', Component: ReviewHeatmapSide },
          { path: 'review/:id/issues', Component: ReviewIssueList },
          { path: 'review/:id/issues/:issueId', Component: ReviewIssueDetail },
          { path: 'review/:id/export', Component: ReviewExport },
        ],
      },
      {
        path: 'ux',
        Component: UXLayout,
        children: [
          { index: true, element: <Navigate to="/tob/ux/dashboard" replace /> },
          { path: 'dashboard', Component: UXDashboard },
          { path: 'heatmap', Component: UXHeatmap },
        ],
      },
    ],
  }
];


