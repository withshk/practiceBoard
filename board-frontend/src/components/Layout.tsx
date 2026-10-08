import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, LogOut, PenLine } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { USE_MOCK } from '../lib/config';
import { useToast } from './Toast';
export default function Layout() {
  const { user, loading, logout, sessionError, retrySession } = useAuth(); const toast = useToast(); const navigate = useNavigate();
  const location = useLocation(); useEffect(() => { window.scrollTo(0,0); }, [location.pathname]);
  const signout = () => { logout(); toast('로그아웃했어요.'); navigate('/'); };
  return <div className="app-shell"><a className="skip-link" href="#main">본문으로 바로 가기</a><header className="site-header"><div className="header-inner"><Link className="brand" to="/" aria-label="BOARD 홈"><span className="brand-mark">b<span /></span><span>BOARD<span className="brand-dot">.</span></span></Link><nav className="main-nav" aria-label="메인 메뉴"><NavLink to="/" end>게시판</NavLink>{user && <Link to="/?mine=true">내가 쓴 글</Link>}</nav><div className="header-actions">{loading ? <span className="muted small">확인 중…</span> : user ? <><span className="user-chip"><span className="avatar small-avatar">{user.nickname.charAt(0)}</span><span>{user.nickname}<span className="honorific"> 님</span></span></span><button className="icon-btn" onClick={signout} aria-label="로그아웃" title="로그아웃"><LogOut size={18} /></button></> : <><Link className="login-link" to="/login">로그인</Link><Link className="btn btn-primary btn-small" to="/signup">회원가입 <ArrowUpRight size={15} /></Link></>}</div></div></header>{sessionError && <div className="session-banner" role="alert">{sessionError}<button onClick={() => void retrySession()}>다시 확인</button><button onClick={signout}>로그인 초기화</button></div>}<main id="main" className="main-content"><Outlet /></main><footer className="site-footer"><div><span className="footer-brand">BOARD.</span><span>작은 생각이 모이는 곳</span></div><span className="footer-note">{USE_MOCK ? <><span className="status-dot" /> 로컬 데모 모드</> : <><PenLine size={13} /> 나의 작은 게시판</>}</span></footer></div>;
}
