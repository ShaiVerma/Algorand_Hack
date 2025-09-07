import type { RouteObject } from 'react-router-dom'
import { AppLayout } from './views/layout/AppLayout'
import { Landing } from './views/landing/Landing'
import { Workspace } from './views/workspace/Workspace'
import { Settings } from './views/settings/Settings'

export const routes: RouteObject[] = [
  { path: '/', element: <Landing /> },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { index: true, element: <Workspace /> },
      { path: 'settings', element: <Settings /> }
    ]
  }
]
