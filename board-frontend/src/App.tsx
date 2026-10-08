import type { ReactNode } from 'react';
import { createBrowserRouter, Link, Navigate, RouterProvider, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { ErrorState, Loading } from './components/States';
import { useAuth } from './lib/auth';
import BoardPage from './pages/BoardPage';
import AuthPage from './pages/AuthPage';
import PostPage from './pages/PostPage';
import EditorPage from './pages/EditorPage';
function Protected({ children }: { children: ReactNode }) {
  const { user, loading, sessionError, retrySession } = useAuth(); const location = useLocation();
  if (loading) return <Loading />;
  if (sessionError) return <ErrorState message={sessionError} retry={() => void retrySession()} />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return children;
}
const router = createBrowserRouter([{ element: <Layout />, errorElement: <ErrorState message="화면을 불러오지 못했어요. 새로고침해 주세요." />, children: [
  { index: true, element: <BoardPage /> },
  { path: 'login', element: <AuthPage mode="login" /> },
  { path: 'signup', element: <AuthPage mode="signup" /> },
  { path: 'posts/new', element: <Protected><EditorPage /></Protected> },
  { path: 'posts/:id/edit', element: <Protected><EditorPage /></Protected> },
  { path: 'posts/:id', element: <PostPage /> },
  { path: '*', element: <div className="not-found"><p className="eyebrow">404 · NOT FOUND</p><h1>여기는 비어 있어요.</h1><p>주소를 확인하거나 게시판으로 돌아가 주세요.</p><Link className="btn btn-primary" to="/">게시판으로 돌아가기</Link></div> }
] }]);
export default function App() { return <RouterProvider router={router} />; }
