import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, PenLine } from 'lucide-react';
import { Link, useBeforeUnload, useBlocker, useNavigate, useParams } from 'react-router-dom';
import type { PostInput } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { ApiError, errorMessage } from '../lib/config';
import { LIMITS, validatePost } from '../lib/validation';
import { ErrorState, Loading } from '../components/States';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
const EMPTY = { title: '', content: '' };
export default function EditorPage() {
  const { id } = useParams(); const editing = !!id; const postId = Number(id); const { user } = useAuth(); const navigate = useNavigate(); const toast = useToast(); const saved = useRef(false);
  const [input, setInput] = useState<PostInput>(EMPTY); const [initial, setInitial] = useState<PostInput>(EMPTY); const [loading, setLoading] = useState(editing); const [loadError, setLoadError] = useState(''); const [retry, setRetry] = useState(0); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [fields, setFields] = useState<Record<string,string>>({});
  const dirty = input.title !== initial.title || input.content !== initial.content;
  const blocker = useBlocker(({ currentLocation, nextLocation }) => !saved.current && (dirty || busy) && (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search));
  useBeforeUnload(useCallback((event: BeforeUnloadEvent) => { if ((dirty || busy) && !saved.current) { event.preventDefault(); event.returnValue = ''; } }, [dirty,busy]));
  useEffect(() => {
    let active = true; saved.current = false; setError(''); setFields({}); setLoadError(''); document.title = `${editing ? '글 수정' : '새 글 쓰기'} · BOARD`;
    if (!editing) { setInput(EMPTY); setInitial(EMPTY); setLoading(false); return; }
    setLoading(true);
    if (!Number.isSafeInteger(postId) || postId <= 0) { setLoadError('올바른 게시글 주소가 아니에요.'); setLoading(false); return; }
    api.getPost(postId).then(post => {
      if (!active) return;
      if (post.author.id !== user?.id) { setLoadError('본인이 작성한 글만 수정할 수 있어요.'); return; }
      const values = { title: post.title, content: post.content }; setInput(values); setInitial(values);
    }).catch(err => { if (active) setLoadError(errorMessage(err)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [editing,postId,user?.id,retry]);
  const update = (key: keyof PostInput, value: string) => { setInput(prev => ({ ...prev, [key]: value })); setFields(prev => ({ ...prev, [key]: '' })); setError(''); };
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return; const values = { title: input.title.trim(), content: input.content.trim() }; const errors = validatePost(values); setFields(errors); setError('');
    if (Object.keys(errors).length) return; setBusy(true);
    try { const result = editing ? await api.updatePost(postId,values) : await api.createPost(values); saved.current = true; if (blocker.state === 'blocked') blocker.reset(); toast(editing ? '게시글을 수정했어요.' : '새로운 이야기를 등록했어요.'); navigate(`/posts/${result.id}`, { replace: true }); }
    catch (err) { setError(errorMessage(err)); if (err instanceof ApiError && err.fieldErrors) setFields(err.fieldErrors); }
    finally { setBusy(false); }
  }
  if (loading) return <Loading />;
  if (loadError) return <ErrorState message={loadError} retry={() => setRetry(n => n+1)} />;
  const cancelTo = editing ? `/posts/${postId}` : '/';
  return <div className="editor-page"><Link className="back-link" to={cancelTo}><ArrowLeft size={16} /> {editing ? '글로 돌아가기' : '게시판으로'}</Link><header className="editor-heading"><p className="eyebrow">{editing ? 'REFINE YOUR STORY' : 'MAKE A LITTLE MARK'}</p><h1>{editing ? '이야기를 다듬어 주세요.' : '어떤 이야기를 남길까요?'}</h1><p>{editing ? '수정한 내용은 저장한 뒤에 반영돼요.' : '정답은 없어요. 지금 떠오르는 생각을 자유롭게 적어 주세요.'}</p></header><form className="editor-form" onSubmit={submit} noValidate><fieldset className="form-fieldset" disabled={busy}><div className="editor-author"><span className="avatar small-avatar">{user?.nickname.charAt(0)}</span><span><strong>{user?.nickname}</strong> 님의 이야기</span><span className="editor-mode"><PenLine size={13} /> {editing ? '글 수정' : '새 글'}</span></div><div className="editor-title-field"><label htmlFor="post-title" className="editor-label">제목 <span className="required-dot">*</span><span className="char-count">{input.title.length} / {LIMITS.title}</span></label><input id="post-title" name="title" className={fields.title ? 'invalid' : ''} placeholder="이야기의 제목을 입력해 주세요" value={input.title} onChange={e => update('title',e.target.value)} maxLength={LIMITS.title} aria-invalid={!!fields.title} aria-describedby={fields.title ? 'title-error' : undefined} />{fields.title && <p className="field-error" id="title-error">{fields.title}</p>}</div><div className="editor-content-field"><label htmlFor="post-content" className="editor-label">내용 <span className="required-dot">*</span><span className="char-count">{input.content.length.toLocaleString()} / 10,000</span></label><textarea id="post-content" name="content" className={fields.content ? 'invalid' : ''} placeholder={'오늘의 작은 발견, 나누고 싶은 생각…\n당신만의 이야기를 적어 주세요.'} value={input.content} onChange={e => update('content',e.target.value)} maxLength={LIMITS.content} aria-invalid={!!fields.content} aria-describedby={fields.content ? 'content-error' : 'content-hint'} />{fields.content && <p className="field-error" id="content-error">{fields.content}</p>}<p className="editor-hint" id="content-hint">일반 텍스트로 저장되며, 줄바꿈은 그대로 유지돼요.</p></div></fieldset>{error && <div className="inline-error" role="alert">{error}</div>}<div className="editor-actions"><p><Check size={14} /> 서로를 존중하는 이야기를 남겨 주세요.</p><div className="button-row"><button type="button" className="btn btn-secondary" disabled={busy} onClick={() => navigate(cancelTo)}>취소</button><button type="submit" className="btn btn-primary" disabled={busy || (editing && !dirty)}>{busy ? '저장 중…' : editing ? '수정 저장' : '게시글 등록'}<ArrowRight size={16} /></button></div></div></form>{blocker.state === 'blocked' && <ConfirmDialog title="저장하지 않고 나갈까요?" description={busy ? '지금 글을 저장하고 있어요. 저장이 끝날 때까지 잠시 기다려 주세요.' : '아직 저장하지 않은 내용이 있어요. 이 페이지를 떠나면 작성한 내용이 사라져요.'} confirmLabel="저장하지 않고 나가기" busy={busy} onClose={() => blocker.reset()} onConfirm={() => blocker.proceed()} />}</div>;
}
