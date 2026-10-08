import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Post } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { errorMessage } from '../lib/config';
import { dateLabel } from '../lib/format';
import { ErrorState, Loading } from '../components/States';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
export default function PostPage() {
  const { id } = useParams(); const postId = Number(id); const { user } = useAuth(); const navigate = useNavigate(); const toast = useToast();
  const [post, setPost] = useState<Post | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [retry, setRetry] = useState(0); const [confirm, setConfirm] = useState(false); const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    let active = true; setLoading(true); setError('');
    if (!Number.isSafeInteger(postId) || postId <= 0) { setError('올바른 게시글 주소가 아니에요.'); setLoading(false); return; }
    api.getPost(postId).then(data => { if (active) { setPost(data); document.title = `${data.title} · BOARD`; } }).catch(err => { if (active) setError(errorMessage(err)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [postId,retry]);
  async function remove() {
    if (deleting) return; setDeleting(true);
    try { await api.deletePost(postId); toast('게시글을 삭제했어요.'); navigate('/', { replace: true }); }
    catch (err) { toast(errorMessage(err), 'error'); setConfirm(false); }
    finally { setDeleting(false); }
  }
  if (loading) return <Loading label="이야기를 불러오는 중이에요" />;
  if (error || !post) return <ErrorState message={error || '글을 찾을 수 없어요.'} retry={() => setRetry(n => n+1)} />;
  const owner = user?.id === post.author.id;
  return <div className="detail-page"><div className="detail-top"><Link className="back-link" to="/"><ArrowLeft size={16} /> 모든 이야기</Link><span className="muted small">게시글 #{post.id}</span></div><article className="article"><header className="article-header"><p className="eyebrow">A STORY ON BOARD</p><h1>{post.title}</h1><div className="article-info"><div className="article-author"><span className="avatar">{post.author.nickname.charAt(0)}</span><div><strong>{post.author.nickname}</strong><span>작성자</span></div></div><div className="article-date"><CalendarDays size={15} /><time dateTime={post.createdAt}>{dateLabel(post.createdAt,true)}</time>{post.updatedAt !== post.createdAt && <span className="edited-badge" title={`수정: ${dateLabel(post.updatedAt,true)}`}>수정됨</span>}</div></div></header><div className="article-body">{post.content}</div><footer className="article-footer"><span className="article-end-mark" aria-hidden="true">b.</span><p>작은 생각을 나눠 주셔서 고마워요.</p></footer></article><div className="detail-actions"><Link className="btn btn-secondary" to="/"><ArrowLeft size={16} /> 목록으로</Link>{owner ? <div className="button-row"><Link className="btn btn-secondary" to={`/posts/${post.id}/edit`}><Pencil size={16} /> 수정</Link><button className="btn btn-delete" onClick={() => setConfirm(true)}><Trash2 size={16} /> 삭제</button></div> : <Link className="text-action" to={user ? '/posts/new' : '/login?next=%2Fposts%2Fnew'}>나도 이야기 남기기 <ArrowRight size={16} /></Link>}</div>{confirm && <ConfirmDialog danger title="이 글을 삭제할까요?" description="삭제한 글은 복구할 수 없어요. 정말 삭제할지 한 번 더 확인해 주세요." confirmLabel="삭제하기" busy={deleting} onClose={() => setConfirm(false)} onConfirm={() => void remove()} />}</div>;
}
