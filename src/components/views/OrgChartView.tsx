import { useRef, useEffect, useCallback } from 'react';
import { OrgChart } from 'd3-org-chart';
import { CREW_MEMBERS, type CrewMember } from '../../data/crew-data';

const DEPT_COLORS: Record<string, string> = {
  Management: '#ef4444',
  Art: '#8b5cf6',
  'Business Development': '#3b82f6',
  Marketing: '#ec4899',
  'Game Design': '#f59e0b',
  Production: '#10b981',
  Technology: '#06b6d4',
  Quality: '#6366f1',
};

function getTierGradient(tier: string): string {
  switch (tier) {
    case 'leadership':
      return 'background: linear-gradient(135deg, #ef4444, #f59e0b);';
    case 'group-leader':
      return 'background: linear-gradient(135deg, #6366f1, #06b6d4);';
    default:
      return 'background: linear-gradient(135deg, #475569, #64748b);';
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

interface OrgChartViewProps {
  members?: CrewMember[];
}

export function OrgChartView({ members = CREW_MEMBERS }: OrgChartViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<OrgChart | null>(null);

  const renderChart = useCallback(() => {
    const chartData = members.map((m) => ({
      id: m.id,
      parentId: m.reportsTo ?? '',
      name: m.name,
      role: m.role,
      department: m.department,
      tier: m.tier,
      isAdmin: m.isAdmin,
    }));
    if (!containerRef.current) return;

    // Clear previous render
    containerRef.current.innerHTML = '';

    const chart = new OrgChart()
      .container(containerRef.current)
      .data(chartData)
      .nodeId((d: any) => d.id)
      .parentNodeId((d: any) => d.parentId || null)
      .nodeWidth(() => 260)
      .nodeHeight(() => 120)
      .compact(true)
      .childrenMargin(() => 50)
      .compactMarginBetween(() => 25)
      .compactMarginPair(() => 50)
      .siblingsMargin(() => 25)
      .neighbourMargin(() => 30)
      .initialZoom(0.8)
      .nodeContent((d: any) => {
        const data = d.data;
        const initials = getInitials(data.name);
        const gradient = getTierGradient(data.tier);
        const deptColor = DEPT_COLORS[data.department] || '#64748b';
        const tierLabel =
          data.tier === 'leadership'
            ? 'Leadership'
            : data.tier === 'group-leader'
              ? 'Group Leader'
              : 'Crew';

        return `
          <div style="
            background: #1e2534;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            width: 258px;
            height: 118px;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: border-color 0.2s;
          "
          onmouseover="this.style.borderColor='#475569'"
          onmouseout="this.style.borderColor='#334155'"
          >
            <div style="
              min-width: 48px;
              width: 48px;
              height: 48px;
              border-radius: 50%;
              ${gradient}
              display: flex;
              align-items: center;
              justify-content: center;
              color: #fff;
              font-weight: 700;
              font-size: 15px;
              letter-spacing: 0.5px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">${initials}</div>

            <div style="flex: 1; min-width: 0; overflow: hidden;">
              <div style="
                color: #f1f5f9;
                font-weight: 700;
                font-size: 13px;
                line-height: 1.3;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 3px;
              ">${data.name}</div>

              <div style="
                color: #94a3b8;
                font-size: 11px;
                line-height: 1.3;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 8px;
              ">${data.role}</div>

              <div style="display: flex; gap: 6px; align-items: center; flex-wrap: nowrap;">
                <span style="
                  background: ${deptColor}22;
                  color: ${deptColor};
                  border: 1px solid ${deptColor}44;
                  padding: 2px 8px;
                  border-radius: 9999px;
                  font-size: 10px;
                  font-weight: 600;
                  white-space: nowrap;
                ">${data.department}</span>

                <span style="
                  background: #334155;
                  color: #94a3b8;
                  padding: 2px 6px;
                  border-radius: 9999px;
                  font-size: 9px;
                  font-weight: 500;
                  white-space: nowrap;
                ">${tierLabel}</span>
              </div>
            </div>
          </div>
        `;
      })
      .linkUpdate(function (this: any, _d: any, _i: number, _arr: any) {
        if (this && this.attr) {
          this.attr('stroke', '#334155')
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.6);
        }
      })
      .render();

    // Make SVG background transparent
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
      svg.style.background = 'transparent';
    }

    chartRef.current = chart;

    // Expand all nodes and fit to view
    setTimeout(() => {
      try {
        chart.expandAll();
        chart.fit();
      } catch {
        // ignore if expandAll is not ready
      }
    }, 300);
  }, [members]);

  useEffect(() => {
    renderChart();

    const handleResize = () => {
      if (chartRef.current) {
        try {
          chartRef.current.fit();
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderChart]);

  const handleFit = () => {
    chartRef.current?.fit();
  };

  const handleZoomIn = () => {
    chartRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    chartRef.current?.zoomOut();
  };

  const handleExpandAll = () => {
    chartRef.current?.expandAll();
    setTimeout(() => chartRef.current?.fit(), 200);
  };

  const handleCollapseAll = () => {
    chartRef.current?.collapseAll();
    setTimeout(() => chartRef.current?.fit(), 200);
  };

  return (
    <div className="relative w-full h-full min-h-[600px] bg-[#0f1117] rounded-xl overflow-hidden">
      {/* Chart container */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[600px]"
        style={{ background: '#0f1117' }}
      />

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={handleFit}
          className="w-9 h-9 rounded-lg bg-[#1e2534] border border-[#334155] text-slate-300 hover:text-white hover:border-slate-500 flex items-center justify-center transition-colors shadow-lg"
          title="Fit to view"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-lg bg-[#1e2534] border border-[#334155] text-slate-300 hover:text-white hover:border-slate-500 flex items-center justify-center transition-colors shadow-lg"
          title="Zoom in"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-lg bg-[#1e2534] border border-[#334155] text-slate-300 hover:text-white hover:border-slate-500 flex items-center justify-center transition-colors shadow-lg"
          title="Zoom out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <div className="w-full border-t border-[#334155] my-1" />

        <button
          onClick={handleExpandAll}
          className="w-9 h-9 rounded-lg bg-[#1e2534] border border-[#334155] text-slate-300 hover:text-white hover:border-slate-500 flex items-center justify-center transition-colors shadow-lg"
          title="Expand all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 13 12 18 17 13" /><polyline points="7 6 12 11 17 6" />
          </svg>
        </button>
        <button
          onClick={handleCollapseAll}
          className="w-9 h-9 rounded-lg bg-[#1e2534] border border-[#334155] text-slate-300 hover:text-white hover:border-slate-500 flex items-center justify-center transition-colors shadow-lg"
          title="Collapse all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 11 12 6 7 11" /><polyline points="17 18 12 13 7 18" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 z-10 bg-[#1e2534]/90 backdrop-blur-sm border border-[#334155] rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }} />
          <span className="text-[11px] text-slate-400">Leadership</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }} />
          <span className="text-[11px] text-slate-400">Group Leader</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #475569, #64748b)' }} />
          <span className="text-[11px] text-slate-400">Crew</span>
        </div>
      </div>
    </div>
  );
}
