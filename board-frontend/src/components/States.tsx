import { AlertCircle, ArrowLeft, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
export function Loading({ label = '불러오는 중이에요' }: { label?: string }) { return <div className="state-box" role="status"><LoaderCircle className="spin" size={26} /><p>{label}</p></div>; }
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) { return <div className="state-box error-state" role="alert"><span className="state-icon"><AlertCircle size={26} /></span><h2>잠시만요, 확인이 필요해요</h2><p>{message}</p><div className="button-row">{retry && <button className="btn btn-primary" onClick={retry}>다시 시도</button>}<Link className="btn btn-secondary" to="/"><ArrowLeft size={16} /> 목록으로</Link></div></div>; }
