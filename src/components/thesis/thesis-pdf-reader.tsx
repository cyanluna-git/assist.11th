"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Minus, Plus, RotateCcw } from "lucide-react";

type PDFDocumentProxy = import("pdfjs-dist/types/src/pdf").PDFDocumentProxy;
type PDFPageProxy = import("pdfjs-dist/types/src/pdf").PDFPageProxy;

type PageMetric = { width: number; height: number };
type ReaderPersistedState = {
  page: number;
  offsetRatio: number;
  zoomScale: number;
  fingerprint: string | null;
};

const STORAGE_PREFIX = "assist11:pdf-reader:";
const PAGE_BUFFER = 2;
const DEVICE_SCALE_CAP = 2;
const ZOOM_MIN = 0.75;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildPageWindow(centerPage: number, totalPages: number) {
  const pages = new Set<number>();
  for (let p = centerPage - PAGE_BUFFER; p <= centerPage + PAGE_BUFFER; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  return pages;
}

function readPersistedState(storageKey: string): ReaderPersistedState {
  if (typeof window === "undefined")
    return { page: 1, offsetRatio: 0, zoomScale: 1, fingerprint: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + storageKey);
    if (!raw) return { page: 1, offsetRatio: 0, zoomScale: 1, fingerprint: null };
    const p = JSON.parse(raw) as Partial<ReaderPersistedState>;
    return {
      page: Number.isFinite(p.page) && p.page ? Number(p.page) : 1,
      offsetRatio: Number.isFinite(p.offsetRatio) ? clamp(Number(p.offsetRatio), 0, 1) : 0,
      zoomScale: Number.isFinite(p.zoomScale) ? clamp(Number(p.zoomScale), ZOOM_MIN, ZOOM_MAX) : 1,
      fingerprint: typeof p.fingerprint === "string" ? p.fingerprint : null,
    };
  } catch {
    return { page: 1, offsetRatio: 0, zoomScale: 1, fingerprint: null };
  }
}

function writePersistedState(storageKey: string, value: ReaderPersistedState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(value));
}

// ── PdfCanvasPage ──
function PdfCanvasPage({
  pageNumber,
  pdfDocument,
  renderWidth,
  estimatedHeight,
  shouldRender,
  getPage,
  onMetric,
}: {
  pageNumber: number;
  pdfDocument: PDFDocumentProxy | null;
  renderWidth: number;
  estimatedHeight: number;
  shouldRender: boolean;
  getPage: (n: number) => Promise<PDFPageProxy>;
  onMetric: (n: number, m: PageMetric) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfDocument || !shouldRender || !renderWidth) return;
    let cancelled = false;
    let renderTask: { cancel?: () => void; promise: Promise<unknown> } | null = null;

    async function render() {
      try {
        setRenderError(null);
        const page = await getPage(pageNumber);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        const scale = renderWidth / base.width;
        const viewport = page.getViewport({ scale });
        const deviceScale = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, DEVICE_SCALE_CAP) : 1;
        const renderViewport = page.getViewport({ scale: scale * deviceScale });
        onMetric(pageNumber, { width: Math.ceil(viewport.width), height: Math.ceil(viewport.height) });
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) throw new Error("canvas 준비 실패");
        canvas.width = Math.ceil(renderViewport.width);
        canvas.height = Math.ceil(renderViewport.height);
        canvas.style.width = `${Math.ceil(viewport.width)}px`;
        canvas.style.height = `${Math.ceil(viewport.height)}px`;
        renderTask = page.render({ canvas, canvasContext: ctx, viewport: renderViewport });
        await renderTask.promise;
      } catch (err) {
        if (!cancelled) setRenderError(err instanceof Error ? err.message : "렌더링 실패");
      }
    }
    void render();
    return () => {
      cancelled = true;
      renderTask?.cancel?.();
    };
  }, [getPage, onMetric, pageNumber, pdfDocument, renderWidth, shouldRender]);

  return (
    <div style={{ minHeight: estimatedHeight }} className="flex items-center justify-center">
      {shouldRender ? (
        renderError ? (
          <div className="p-4 text-center text-xs text-text-muted">
            <p className="font-medium text-error">페이지 렌더링 실패</p>
            <p>{renderError}</p>
          </div>
        ) : (
          <canvas ref={canvasRef} className="block shadow-sm" />
        )
      ) : (
        <div className="p-4 text-center text-xs text-text-muted">페이지 준비 중...</div>
      )}
    </div>
  );
}

// ── Main PdfReader ──
export function ThesisPdfReader({ src, title, storageKey }: { src: string; title: string; storageKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageJumpInputRef = useRef<HTMLInputElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const pageCacheRef = useRef<Map<number, Promise<PDFPageProxy>>>(new Map());
  const hasRestoredRef = useRef(false);
  const scrollFrameRef = useRef<number | null>(null);
  const latestReaderStateRef = useRef<ReaderPersistedState>({ page: 1, offsetRatio: 0, zoomScale: 1, fingerprint: null });
  const containerSizeRef = useRef({ width: 0, height: 0 });
  const pendingLayoutRestoreRef = useRef<{ nonce: number; passesLeft: number } | null>(null);

  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [renderWindow, setRenderWindow] = useState<Set<number>>(() => new Set([1, 2, 3]));
  const [pageMetrics, setPageMetrics] = useState<Record<number, PageMetric>>({});
  const [defaultAspectRatio, setDefaultAspectRatio] = useState(1.414);
  const [readerState, setReaderState] = useState<ReaderPersistedState>({ page: 1, offsetRatio: 0, zoomScale: 1, fingerprint: null });
  const [baseContentWidth, setBaseContentWidth] = useState(700);
  const [layoutRestoreNonce, setLayoutRestoreNonce] = useState(0);
  const [pageJumpValue, setPageJumpValue] = useState("1");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPage = useCallback(async (pageNumber: number) => {
    const cached = pageCacheRef.current.get(pageNumber);
    if (cached) return cached;
    if (!pdfDocument) throw new Error("PDF 준비 중");
    const next = pdfDocument.getPage(pageNumber);
    pageCacheRef.current.set(pageNumber, next);
    return next;
  }, [pdfDocument]);

  const persistReaderPosition = useCallback((page: number, offsetRatio: number) => {
    setReaderState((current) => {
      const next = { ...current, page, offsetRatio: clamp(offsetRatio, 0, 1) };
      writePersistedState(storageKey, next);
      return next;
    });
  }, [storageKey]);

  useEffect(() => { latestReaderStateRef.current = readerState; }, [readerState]);
  useEffect(() => { setPageJumpValue(String(currentPage)); }, [currentPage]);

  const scheduleLayoutRestore = useCallback((passesLeft = 3) => {
    pendingLayoutRestoreRef.current = { nonce: Date.now(), passesLeft };
    setLayoutRestoreNonce((c) => c + 1);
  }, []);

  const jumpToPage = useCallback((requestedPage: number, offsetRatio = 0) => {
    if (!totalPages) return;
    const nextPage = clamp(Math.round(requestedPage), 1, totalPages);
    const container = containerRef.current;
    const targetNode = pageRefs.current[nextPage];
    setCurrentPage(nextPage);
    setRenderWindow(buildPageWindow(nextPage, totalPages));
    persistReaderPosition(nextPage, clamp(offsetRatio, 0, 1));
    if (container && targetNode) {
      container.scrollTop = targetNode.offsetTop + targetNode.offsetHeight * clamp(offsetRatio, 0, 1);
    } else {
      scheduleLayoutRestore(2);
    }
  }, [persistReaderPosition, scheduleLayoutRestore, totalPages]);

  const applyZoomScale = useCallback((nextZoom: number) => {
    const zoom = clamp(Number(nextZoom.toFixed(2)), ZOOM_MIN, ZOOM_MAX);
    setReaderState((current) => {
      const next = { ...current, zoomScale: zoom };
      writePersistedState(storageKey, next);
      return next;
    });
    scheduleLayoutRestore(4);
  }, [scheduleLayoutRestore, storageKey]);

  const recalculateViewportState = useCallback(() => {
    const container = containerRef.current;
    if (!container || !totalPages) return;
    const vTop = container.scrollTop;
    const vBottom = vTop + container.clientHeight;
    const vCenter = vTop + container.clientHeight / 2;
    const buffTop = vTop - container.clientHeight;
    const buffBottom = vBottom + container.clientHeight;
    let nextPage = currentPage;
    let bestDist = Infinity;
    const nextWindow = new Set<number>();
    for (let p = 1; p <= totalPages; p++) {
      const node = pageRefs.current[p];
      if (!node) continue;
      const pTop = node.offsetTop, pBottom = pTop + node.offsetHeight, pCenter = pTop + node.offsetHeight / 2;
      if (pBottom >= buffTop && pTop <= buffBottom) nextWindow.add(p);
      const dist = Math.abs(pCenter - vCenter);
      if (dist < bestDist) { bestDist = dist; nextPage = p; }
    }
    if (!nextWindow.size) {
      for (const p of buildPageWindow(nextPage, totalPages)) nextWindow.add(p);
    } else {
      for (const p of buildPageWindow(nextPage, totalPages)) nextWindow.add(p);
    }
    setRenderWindow(nextWindow);
    setCurrentPage(nextPage);
    const node = pageRefs.current[nextPage];
    if (node) persistReaderPosition(nextPage, (vTop - node.offsetTop) / Math.max(node.offsetHeight, 1));
  }, [currentPage, persistReaderPosition, totalPages]);

  // ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      const nw = Math.floor(e.contentRect.width);
      const nh = Math.floor(e.contentRect.height);
      const prev = containerSizeRef.current;
      containerSizeRef.current = { width: nw, height: nh };
      setBaseContentWidth(Math.max(Math.floor(e.contentRect.width) - 40, 320));
      if (hasRestoredRef.current && (prev.width !== nw || prev.height !== nh)) {
        pendingLayoutRestoreRef.current = { nonce: Date.now(), passesLeft: 3 };
        setLayoutRestoreNonce((c) => c + 1);
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Load PDF
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true); setError(null);
        pageCacheRef.current.clear(); hasRestoredRef.current = false;
        const persisted = readPersistedState(storageKey);
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const doc = await pdfjs.getDocument(src).promise;
        if (cancelled) return;
        const fp = doc.fingerprints?.[0] ?? null;
        const eff = (persisted.fingerprint && fp && persisted.fingerprint !== fp)
          ? { page: 1, offsetRatio: 0, zoomScale: 1, fingerprint: fp }
          : { ...persisted, fingerprint: fp };
        const firstPage = await doc.getPage(eff.page || 1);
        const fvp = firstPage.getViewport({ scale: 1 });
        if (cancelled) return;
        pageCacheRef.current.set(firstPage.pageNumber, Promise.resolve(firstPage));
        setPdfDocument(doc);
        setTotalPages(doc.numPages);
        setDefaultAspectRatio(fvp.height / fvp.width);
        setReaderState(eff);
        setCurrentPage(clamp(eff.page, 1, doc.numPages));
        setRenderWindow(buildPageWindow(clamp(eff.page, 1, doc.numPages), doc.numPages));
        writePersistedState(storageKey, eff);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "PDF 로드 실패");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [src, storageKey]);

  // Restore scroll position
  useEffect(() => {
    if (!totalPages || hasRestoredRef.current) return;
    const container = containerRef.current;
    const targetNode = pageRefs.current[readerState.page];
    if (!container || !targetNode) return;
    container.scrollTop = targetNode.offsetTop + targetNode.offsetHeight * readerState.offsetRatio;
    hasRestoredRef.current = true;
    recalculateViewportState();
  }, [readerState, recalculateViewportState, totalPages, pageMetrics, baseContentWidth]);

  // Layout restore
  useEffect(() => {
    if (!totalPages || !hasRestoredRef.current) return;
    const pending = pendingLayoutRestoreRef.current;
    if (!pending || pending.passesLeft <= 0) return;
    const container = containerRef.current;
    const targetState = latestReaderStateRef.current;
    const targetNode = pageRefs.current[targetState.page];
    if (!container || !targetNode) return;
    const frame = window.requestAnimationFrame(() => {
      const node = pageRefs.current[targetState.page];
      if (!node) return;
      container.scrollTop = node.offsetTop + node.offsetHeight * targetState.offsetRatio;
      pending.passesLeft--;
      if (pending.passesLeft > 0) setLayoutRestoreNonce((c) => c + 1);
      else pendingLayoutRestoreRef.current = null;
      recalculateViewportState();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [baseContentWidth, layoutRestoreNonce, pageMetrics, recalculateViewportState, totalPages]);

  // Scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !totalPages) return;
    const onScroll = () => {
      if (scrollFrameRef.current) window.cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = window.requestAnimationFrame(() => recalculateViewportState());
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (scrollFrameRef.current) window.cancelAnimationFrame(scrollFrameRef.current);
    };
  }, [recalculateViewportState, totalPages]);

  // Keyboard shortcuts
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) return;
      if (e.key === "+" || e.key === "=") { e.preventDefault(); applyZoomScale(readerState.zoomScale + ZOOM_STEP); return; }
      if (e.key === "-") { e.preventDefault(); applyZoomScale(readerState.zoomScale - ZOOM_STEP); return; }
      if (e.key === "0") { e.preventDefault(); applyZoomScale(1); return; }
      if (e.key === "PageDown" || e.key.toLowerCase() === "n") { e.preventDefault(); jumpToPage(currentPage + 1, 0); return; }
      if (e.key === "PageUp" || e.key.toLowerCase() === "p") { e.preventDefault(); jumpToPage(currentPage - 1, 0); return; }
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "j") { e.preventDefault(); container.scrollBy({ top: 96, behavior: "smooth" }); return; }
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "k") { e.preventDefault(); container.scrollBy({ top: -96, behavior: "smooth" }); return; }
    };
    container.addEventListener("keydown", onKey);
    return () => container.removeEventListener("keydown", onKey);
  }, [applyZoomScale, currentPage, jumpToPage, readerState.zoomScale]);

  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);
  const renderWidth = Math.max(Math.round(baseContentWidth * readerState.zoomScale), 320);

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#eef1f5] p-8 text-center">
        <p className="text-sm font-medium text-error">PDF를 불러오지 못했습니다.</p>
        <p className="text-xs text-text-muted">{error}</p>
        <a href={src} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded border border-line-subtle px-3 py-1.5 text-xs text-text-muted hover:bg-muted">
          <ExternalLink size={12} /> 브라우저 PDF로 열기
        </a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex h-full flex-col overflow-auto bg-[#eef1f5] outline-none"
      tabIndex={0}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement)?.closest("button, a, input, textarea")) return;
        containerRef.current?.focus();
      }}
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-line-subtle bg-canvas px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs font-medium text-text-strong">{title}</span>
          <span className="shrink-0 text-xs text-text-muted">{totalPages ? `${currentPage} / ${totalPages}p` : "로딩 중"}</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => applyZoomScale(readerState.zoomScale - ZOOM_STEP)} disabled={isLoading || readerState.zoomScale <= ZOOM_MIN} className="flex items-center gap-1 rounded border border-line-subtle px-2 py-1 text-xs text-text-muted hover:bg-muted disabled:opacity-40">
            <Minus size={11} />
          </button>
          <span className="min-w-[2.5rem] text-center text-xs text-text-muted">{Math.round(readerState.zoomScale * 100)}%</span>
          <button type="button" onClick={() => applyZoomScale(readerState.zoomScale + ZOOM_STEP)} disabled={isLoading || readerState.zoomScale >= ZOOM_MAX} className="flex items-center gap-1 rounded border border-line-subtle px-2 py-1 text-xs text-text-muted hover:bg-muted disabled:opacity-40">
            <Plus size={11} />
          </button>
          <button type="button" onClick={() => applyZoomScale(1)} disabled={isLoading || Math.abs(readerState.zoomScale - 1) < 0.01} className="flex items-center gap-1 rounded border border-line-subtle px-2 py-1 text-xs text-text-muted hover:bg-muted disabled:opacity-40">
            <RotateCcw size={11} />
          </button>
          <form className="flex items-center gap-1" onSubmit={(e) => { e.preventDefault(); jumpToPage(Number(pageJumpValue || currentPage), 0); pageJumpInputRef.current?.blur(); }}>
            <input ref={pageJumpInputRef} type="number" min={1} max={Math.max(totalPages, 1)} value={pageJumpValue} onChange={(e) => setPageJumpValue(e.target.value)} className="w-12 rounded border border-line-subtle bg-canvas px-1.5 py-1 text-center text-xs" />
            <button type="submit" disabled={isLoading || !totalPages} className="rounded border border-line-subtle px-2 py-1 text-xs text-text-muted hover:bg-muted disabled:opacity-40">이동</button>
          </form>
          <a href={src} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded border border-line-subtle px-2 py-1 text-xs text-text-muted hover:bg-muted">
            <ExternalLink size={11} /> 열기
          </a>
        </div>
      </div>

      {/* Scrubber */}
      {!isLoading && (
        <div className="sticky top-[44px] z-10 shrink-0 border-b border-line-subtle bg-canvas/80 px-3 py-1.5 backdrop-blur-sm">
          <input type="range" min={1} max={Math.max(totalPages, 1)} step={1} value={totalPages ? currentPage : 1} onChange={(e) => jumpToPage(Number(e.target.value), 0)} className="w-full accent-brand" />
          <p className="mt-0.5 text-[10px] text-text-muted opacity-60">`+ / - / 0` 확대 &nbsp;·&nbsp; `j / k` 스크롤 &nbsp;·&nbsp; `n / p` 페이지</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <p className="text-sm text-text-muted">PDF 준비 중...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-6">
          {pageNumbers.map((pageNumber) => {
            const metric = pageMetrics[pageNumber];
            const estimatedHeight = Math.ceil(metric?.height ?? renderWidth * defaultAspectRatio);
            return (
              <div key={pageNumber} ref={(node) => { pageRefs.current[pageNumber] = node; }} data-page-number={pageNumber} className="flex flex-col items-center">
                <div className="mb-1 text-[10px] text-text-muted opacity-50">Page {pageNumber}</div>
                <PdfCanvasPage
                  pageNumber={pageNumber}
                  pdfDocument={pdfDocument}
                  renderWidth={renderWidth}
                  estimatedHeight={estimatedHeight}
                  shouldRender={renderWindow.has(pageNumber)}
                  getPage={getPage}
                  onMetric={(n, m) => {
                    setPageMetrics((cur) => {
                      const ex = cur[n];
                      if (ex && ex.width === m.width && ex.height === m.height) return cur;
                      return { ...cur, [n]: m };
                    });
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
