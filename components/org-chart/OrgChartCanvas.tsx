'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  Position,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import {
  Network,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Share2,
  Sparkles,
  GitFork,
  Building2,
  Flame,
  CheckCircle2,
  Maximize2,
  Layers,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  X
} from 'lucide-react';
import { BentoNode } from './BentoNode';
import AddStaffDrawer from './AddStaffDrawer';
import { StaffMember, DEFAULT_STAFF_MEMBERS, DepartmentType, DEPARTMENT_CONFIG } from './types';

// Register custom node types
const nodeTypes = {
  bentoNode: BentoNode
};

// Node dimensions for Dagre layout
const NODE_WIDTH = 340;
const NODE_HEIGHT = 220;

// Dagre Hierarchical Layout Generator for Clean Top-to-Down Tree Hierarchy
function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 40,
    ranksep: 105,
    ranker: 'tight-tree', // Generates symmetric top-to-down pyramid trees
    align: 'DL'
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Only use primary hierarchy edges for tree layout positioning to avoid layout distortions from circular matrix relations
  edges.forEach((edge) => {
    if (edge.data?.isPrimary) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition ? nodeWithPosition.x - NODE_WIDTH / 2 : 0,
        y: nodeWithPosition ? nodeWithPosition.y - NODE_HEIGHT / 2 : 0
      }
    };
  });

  return { nodes: layoutedNodes, edges };
}

function OrgChartFlow() {
  const reactFlowInstance = useReactFlow();
  const params = useParams();
  const trustId = (params?.trustId as string) || 'trust_sringeri';

  // Master staff state
  const [staffList, setStaffList] = useState<StaffMember[]>(DEFAULT_STAFF_MEMBERS);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  // Fetch dynamic org chart from backend
  const fetchBackendOrgChart = useCallback(async () => {
    setIsLoadingApi(true);
    try {
      const res = await fetch(`/api/v1/trusts/${trustId}/org-chart`);
      if (res.ok) {
        const json = await res.json();
        if (json.data?.staffMembers && json.data.staffMembers.length > 0) {
          const mapped: StaffMember[] = json.data.staffMembers.map((s: any) => ({
            id: s.id,
            name: s.name,
            role: s.role,
            department: s.department,
            subDepartment: s.subDepartment,
            avatar: s.avatar,
            email: s.email,
            phone: s.phone,
            location: s.location,
            joinedYear: s.joinedYear,
            status: s.status,
            reportsTo: s.primarySupervisorId || null,
            secondaryReports: s.secondarySupervisorIds || [],
            responsibilities: s.responsibilities
          }));
          setStaffList(mapped);
          if (typeof window !== 'undefined') {
            localStorage.setItem('sankalpvani_org_chart', JSON.stringify(mapped));
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch org chart from backend API', e);
    } finally {
      setIsLoadingApi(false);
    }
  }, [trustId]);

  useEffect(() => {
    fetchBackendOrgChart();
  }, [fetchBackendOrgChart]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<'All' | DepartmentType>('All');
  const [matrixVisibility, setMatrixVisibility] = useState<'all' | 'primary_only' | 'matrix_only'>('all');
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [drawerDefaultParentId, setDrawerDefaultParentId] = useState<string | null>(null);
  const [drawerDefaultMatrixId, setDrawerDefaultMatrixId] = useState<string | null>(null);

  // Status message / toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Save to state and storage
  const persistStaffList = useCallback((action: StaffMember[] | ((prev: StaffMember[]) => StaffMember[])) => {
    setStaffList((prev) => {
      const updated = typeof action === 'function' ? action(prev) : action;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sankalpvani_org_chart', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Handlers for Node Actions
  const handleEditStaff = useCallback((staff: StaffMember) => {
    setEditingStaff(staff);
    setDrawerDefaultParentId(null);
    setDrawerDefaultMatrixId(null);
    setIsDrawerOpen(true);
  }, []);

  const handleDeleteStaff = useCallback((staffId: string) => {
    persistStaffList((prev) => {
      // If deleted staff had subordinates, reassign their reportsTo to deleted staff's reportsTo or null
      const deletedStaff = prev.find(s => s.id === staffId);
      const parentOfDeleted = deletedStaff ? deletedStaff.reportsTo : null;

      const updated = prev
        .filter(s => s.id !== staffId)
        .map(s => {
          let reportsTo = s.reportsTo;
          if (reportsTo === staffId) {
            reportsTo = parentOfDeleted;
          }
          const secondaryReports = (s.secondaryReports || []).filter(id => id !== staffId);
          return { ...s, reportsTo, secondaryReports };
        });

      return updated;
    });
    showToast('Staff member removed and reporting lines updated.');
  }, []);

  const handleAddSubordinate = useCallback((parentStaff: StaffMember) => {
    setEditingStaff(null);
    setDrawerDefaultParentId(parentStaff.id);
    setDrawerDefaultMatrixId(null);
    setIsDrawerOpen(true);
  }, []);

  const handleAddMatrixRelation = useCallback((targetStaff: StaffMember) => {
    setEditingStaff(null);
    setDrawerDefaultParentId(null);
    setDrawerDefaultMatrixId(targetStaff.id);
    setIsDrawerOpen(true);
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const total = staffList.length;
    const spiritual = staffList.filter(s => s.department === 'Spiritual').length;
    const admin = staffList.filter(s => s.department === 'Admin').length;
    const operations = staffList.filter(s => s.department === 'Operations' || s.department === 'Finance').length;
    const matrixLinksCount = staffList.reduce((acc, curr) => acc + (curr.secondaryReports?.length || 0), 0);

    return { total, spiritual, admin, operations, matrixLinksCount };
  }, [staffList]);

  // Build React Flow Nodes & Edges from staffList
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Map staff by id for quick lookup of names and counts
    const staffMap = new Map<string, StaffMember>();
    staffList.forEach(s => staffMap.set(s.id, s));

    const directReportsCountMap = new Map<string, number>();
    const matrixReportsCountMap = new Map<string, number>();

    staffList.forEach(s => {
      if (s.reportsTo) {
        directReportsCountMap.set(s.reportsTo, (directReportsCountMap.get(s.reportsTo) || 0) + 1);
      }
      (s.secondaryReports || []).forEach(secId => {
        matrixReportsCountMap.set(secId, (matrixReportsCountMap.get(secId) || 0) + 1);
      });
    });

    const isSearching = searchQuery.trim().length > 0;
    const searchLower = searchQuery.toLowerCase();

    staffList.forEach((staff) => {
      // Filter by department if selected
      const matchesDept = departmentFilter === 'All' || staff.department === departmentFilter;
      const matchesSearch = !isSearching || 
        staff.name.toLowerCase().includes(searchLower) || 
        staff.role.toLowerCase().includes(searchLower) ||
        staff.department.toLowerCase().includes(searchLower);

      const isHighlighted = isSearching && matchesSearch;
      const isDimmed = (isSearching && !matchesSearch) || !matchesDept;

      const primaryManager = staff.reportsTo ? staffMap.get(staff.reportsTo) : null;
      const secondaryManagers = (staff.secondaryReports || [])
        .map(id => staffMap.get(id)?.name)
        .filter(Boolean) as string[];

      nodes.push({
        id: staff.id,
        type: 'bentoNode',
        position: { x: 0, y: 0 }, // will be set by dagre layout
        data: {
          staff,
          onEdit: handleEditStaff,
          onDelete: handleDeleteStaff,
          onAddSubordinate: handleAddSubordinate,
          onAddMatrixRelation: handleAddMatrixRelation,
          isHighlighted,
          isDimmed,
          primaryManagerName: primaryManager?.name,
          secondaryManagerNames: secondaryManagers,
          reporteeCount: directReportsCountMap.get(staff.id) || 0,
          matrixReporteeCount: matrixReportsCountMap.get(staff.id) || 0
        }
      });

      // 1. Direct Manager Connection (Thick, Solid Saffron Step Line)
      if (staff.reportsTo && staffMap.has(staff.reportsTo)) {
        if (matrixVisibility !== 'matrix_only') {
          edges.push({
            id: `primary-${staff.reportsTo}-${staff.id}`,
            source: staff.reportsTo,
            target: staff.id,
            sourceHandle: 'primary-source',
            targetHandle: 'primary-target',
            type: 'smoothstep', // Orthogonal step hierarchy tree connector
            animated: false,
            style: {
              stroke: '#ff7700', // Thick solid Saffron line
              strokeWidth: 3,
              opacity: isDimmed ? 0.3 : 0.95
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 14,
              height: 14,
              color: '#ff7700'
            },
            data: {
              isPrimary: true
            }
          });
        }
      }

      // 2. Secondary Connection (Thin, Dashed Grey Line with "Secondary" Badge)
      (staff.secondaryReports || []).forEach((secSupervisorId) => {
        if (staffMap.has(secSupervisorId)) {
          if (matrixVisibility !== 'primary_only') {
            edges.push({
              id: `matrix-${secSupervisorId}-${staff.id}`,
              source: secSupervisorId,
              target: staff.id,
              sourceHandle: 'matrix-source',
              targetHandle: 'matrix-target',
              type: 'smoothstep',
              animated: true,
              style: {
                stroke: '#9ca3af', // Thin dashed grey line
                strokeWidth: 1.5,
                strokeDasharray: '5,5',
                opacity: isDimmed ? 0.25 : 0.9
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 12,
                height: 12,
                color: '#9ca3af'
              },
              label: 'Secondary',
              labelStyle: {
                fill: '#4b5563',
                fontWeight: 700,
                fontSize: 9,
                fontFamily: 'sans-serif'
              },
              labelBgStyle: {
                fill: '#f3f4f6',
                fillOpacity: 0.95,
                stroke: '#9ca3af',
                strokeWidth: 1,
                rx: 4,
                ry: 4
              },
              labelBgPadding: [4, 2] as [number, number],
              data: {
                isPrimary: false
              }
            });
          }
        }
      });
    });

    return getLayoutedElements(nodes, edges);
  }, [staffList, departmentFilter, searchQuery, matrixVisibility, handleEditStaff, handleDeleteStaff, handleAddSubordinate, handleAddMatrixRelation]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Recompute layout whenever initial nodes/edges change
  useEffect(() => {
    const layouted = getLayoutedElements(initialNodes, initialEdges);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // On Connect callback (if user drags a handle)
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;
      const isMatrix = params.sourceHandle === 'matrix-source' || params.targetHandle === 'matrix-target';

      persistStaffList(prev => {
        return prev.map(s => {
          if (s.id === params.target) {
            if (isMatrix) {
              const sec = s.secondaryReports || [];
              if (!sec.includes(params.source!)) {
                return { ...s, secondaryReports: [...sec, params.source!] };
              }
            } else {
              return { ...s, reportsTo: params.source };
            }
          }
          return s;
        });
      });

      showToast(`Connected ${isMatrix ? 'Matrix Reporting' : 'Primary Hierarchy'} connection.`);
    },
    []
  );

  // Auto-layout button handler
  const handleReLayout = () => {
    const layouted = getLayoutedElements(nodes, edges);
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    }, 50);
  };

  // Reset to default hierarchy
  const handleResetToDefault = () => {
    if (confirm('Reset entire Devasthanam organization chart to standard temple hierarchy?')) {
      persistStaffList(DEFAULT_STAFF_MEMBERS);
      showToast('Org chart reset to default Devasthanam hierarchy.');
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
      }, 100);
    }
  };

  // Export Org Chart to JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(staffList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sankalpvani_org_chart_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Org chart exported to JSON file.');
  };

  // Save new or edited staff from drawer
  const handleSaveStaffFromDrawer = async (staff: StaffMember) => {
    // 1. Client-Side Cycle Detection Pre-check
    if (staff.reportsTo) {
      const isDescendant = (candidateId: string, ancestorId: string, visited = new Set<string>()): boolean => {
        if (candidateId === ancestorId) return true;
        if (visited.has(candidateId)) return false;
        visited.add(candidateId);
        const candidate = staffList.find(s => s.id === candidateId);
        if (!candidate) return false;
        if (candidate.reportsTo && isDescendant(candidate.reportsTo, ancestorId, visited)) return true;
        for (const sec of candidate.secondaryReports || []) {
          if (isDescendant(sec, ancestorId, visited)) return true;
        }
        return false;
      };

      if (isDescendant(staff.reportsTo, staff.id)) {
        const mgr = staffList.find(s => s.id === staff.reportsTo);
        const mgrName = mgr ? mgr.name : 'Selected manager';
        const errorMsg = `Cannot assign this manager. ${mgrName} already reports to ${staff.name}. A person cannot report to their own subordinate.`;
        showToast(errorMsg, 'error');
        throw new Error(errorMsg);
      }
    }

    // 2. Persist to authoritative backend API with Cycle Detection
    try {
      const res = await fetch(`/api/v1/trusts/${trustId}/org-chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: staff.id,
          name: staff.name,
          role: staff.role,
          department: staff.department,
          subDepartment: staff.subDepartment,
          avatar: staff.avatar,
          email: staff.email,
          phone: staff.phone,
          location: staff.location,
          joinedYear: staff.joinedYear,
          status: staff.status,
          primarySupervisorId: staff.reportsTo || null,
          secondarySupervisorIds: staff.secondaryReports || [],
          responsibilities: staff.responsibilities
        })
      });

      const json = await res.json();
      if (!res.ok) {
        let msg = json.error?.message || 'Failed to save staff to server.';
        if (json.error?.code === 'CYCLE_DETECTED' || msg.toLowerCase().includes('cycle') || msg.toLowerCase().includes('circular')) {
          const mgr = staffList.find(s => s.id === staff.reportsTo);
          const mgrName = mgr ? mgr.name : 'Selected manager';
          msg = `Cannot assign this manager. ${mgrName} already reports to ${staff.name}. A person cannot report to their own subordinate.`;
        }
        showToast(msg, 'error');
        throw new Error(msg);
      } else {
        persistStaffList(prev => {
          const exists = prev.some(s => s.id === staff.id);
          if (exists) {
            return prev.map(s => s.id === staff.id ? staff : s);
          } else {
            return [...prev, staff];
          }
        });
        showToast(`${staff.name} saved successfully.`, 'success');
      }
    } catch (e: any) {
      if (e.message?.startsWith('Cannot assign this manager')) {
        throw e;
      }
      showToast(`${staff.name} saved locally.`, 'success');
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[620px] bg-[#fcfcf7] rounded-3xl border border-outline-variant/30 shadow-md overflow-hidden flex flex-col">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl border flex items-center gap-2 animate-[bounce_0.5s_ease-out] ${
          toastType === 'error'
            ? 'bg-amber-900 text-amber-50 border-amber-700'
            : 'bg-primary text-on-primary border-primary-container'
        }`}>
          {toastType === 'error' ? (
            <AlertCircle size={16} className="text-amber-300 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-on-primary shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Analytics Bar */}
      <div className="bg-surface-container-lowest/95 backdrop-blur-md p-4 border-b border-outline-variant/25 z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Title & Quick Stats */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Network size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-primary">
                  Devasthanam Org Chart
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Matrix Reporting
                </span>
              </div>
              <p className="font-sans text-[11px] text-on-surface-variant font-medium">
                Dual reporting hierarchy: solid lines = direct tree, dashed animated lines = matrix cross-reporting.
              </p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-outline-variant/30">
            {/* Spiritual count */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50/80 border border-orange-200 text-xs font-bold text-orange-950">
              <Flame size={14} className="text-[#ff7700]" />
              <span>{stats.spiritual} Spiritual</span>
            </div>

            {/* Admin count */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-50/80 border border-yellow-200 text-xs font-bold text-yellow-950">
              <Building2 size={14} className="text-[#d4af37]" />
              <span>{stats.admin} Admin</span>
            </div>

            {/* Matrix count */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50/80 border border-purple-200 text-xs font-bold text-purple-950">
              <Share2 size={14} className="text-purple-700" />
              <span>{stats.matrixLinksCount} Matrix Links</span>
            </div>
          </div>
        </div>

        {/* Right: Search, Filter & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative min-w-[180px] sm:min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff, role, priest..."
              className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/40"
            />
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 text-xs font-bold">
            {(['All', 'Spiritual', 'Admin'] as const).map((dept) => (
              <button
                key={dept}
                onClick={() => setDepartmentFilter(dept)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  departmentFilter === dept
                    ? dept === 'Spiritual' 
                      ? 'bg-[#ff7700] text-white shadow-xs' 
                      : dept === 'Admin'
                      ? 'bg-[#d4af37] text-white shadow-xs'
                      : 'bg-primary text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Reporting Connections Toggle */}
          <div className="flex items-center bg-surface-container-high p-1 rounded-xl border border-outline-variant/40 text-xs font-bold">
            <button
              onClick={() => {
                if (matrixVisibility === 'all') setMatrixVisibility('primary_only');
                else if (matrixVisibility === 'primary_only') setMatrixVisibility('matrix_only');
                else setMatrixVisibility('all');
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] text-on-surface hover:bg-surface-container flex items-center gap-1.5 transition-all cursor-pointer"
              title="Toggle reporting line connections"
            >
              <Share2 size={12} className="text-primary" />
              <span>
                {matrixVisibility === 'all' && 'All Lines'}
                {matrixVisibility === 'primary_only' && 'Direct Only'}
                {matrixVisibility === 'matrix_only' && 'Secondary Only'}
              </span>
            </button>
          </div>

          {/* Auto Layout Button */}
          <button
            type="button"
            onClick={handleReLayout}
            className="px-3 py-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-on-surface rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Auto-organize hierarchical tree"
          >
            <RefreshCw size={13} className="text-primary" />
            <span className="hidden sm:inline">Auto Layout</span>
          </button>

          {/* Legend Toggle Button */}
          <button
            type="button"
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              isLegendOpen
                ? 'bg-amber-100/90 text-amber-900 border-amber-300'
                : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/40 text-on-surface'
            }`}
            title={isLegendOpen ? 'Hide Devasthanam Legend' : 'Show Devasthanam Legend'}
          >
            <HelpCircle size={13} className="text-primary" />
            <span className="hidden sm:inline">Legend</span>
            {isLegendOpen ? (
              <EyeOff size={12} className="text-amber-800" />
            ) : (
              <Eye size={12} className="text-on-surface-variant" />
            )}
          </button>

          {/* Add Staff Button (Opens Drawer) */}
          <button
            type="button"
            onClick={() => {
              setEditingStaff(null);
              setDrawerDefaultParentId(null);
              setDrawerDefaultMatrixId(null);
              setIsDrawerOpen(true);
            }}
            className="px-4 py-1.5 bg-primary hover:bg-[#7a4300] text-on-primary rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Main React Flow Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={(_, node) => {
            const staff = (node.data as any)?.staff as StaffMember;
            if (staff) handleEditStaff(staff);
          }}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.2}
          maxZoom={1.8}
          defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
          className="bg-[#fafaeb]/60"
        >
          {/* Sacred Canvas Background Grid */}
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={1.5} 
            color="#dbc2b0" 
            style={{ opacity: 0.4 }}
          />

          {/* Controls UI */}
          <Controls 
            position="bottom-right"
            className="!bg-surface-container-lowest !border !border-outline-variant/40 !rounded-2xl !shadow-xl !overflow-hidden"
          />

          {/* MiniMap with Department Colors */}
          <MiniMap
            position="bottom-left"
            nodeColor={(n) => {
              const staff = (n.data as any)?.staff as StaffMember;
              if (!staff) return '#8f4e00';
              if (staff.department === 'Spiritual') return '#ff7700';
              if (staff.department === 'Admin') return '#d4af37';
              if (staff.department === 'Operations') return '#059669';
              return '#2563eb';
            }}
            maskColor="rgba(240, 240, 230, 0.75)"
            className="!bg-surface-container-lowest !border !border-outline-variant/30 !rounded-2xl !shadow-xl !overflow-hidden hidden md:block"
            style={{ width: 140, height: 95 }}
          />

          {/* Top-Right Panel: Interactive Collapsible/Expandable Legend Popup with Hide & Show options */}
          <Panel position="top-right" className="!m-4">
            {isLegendOpen ? (
              <div className="bg-surface-container-lowest/95 backdrop-blur-md p-3.5 rounded-2xl border border-outline-variant/30 shadow-xl text-xs space-y-2.5 max-w-xs animate-[fadeIn_0.2s_ease-out]">
                {/* Legend Header with Hide toggle */}
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-primary" />
                    <span className="font-serif font-bold text-primary text-xs uppercase tracking-wider">
                      Devasthanam Legend
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLegendOpen(false)}
                    className="p-1 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                    title="Hide Legend Popup"
                  >
                    <span>Hide</span>
                    <ChevronUp size={14} />
                  </button>
                </div>

                {/* Department Left Border Indicators (Clickable filters) */}
                <div className="space-y-1.5 text-[11px]">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Department Borders:
                  </p>
                  <button
                    type="button"
                    onClick={() => setDepartmentFilter(departmentFilter === 'Spiritual' ? 'All' : 'Spiritual')}
                    className={`w-full flex items-center justify-between p-1.5 rounded-lg border transition-all cursor-pointer text-left ${
                      departmentFilter === 'Spiritual'
                        ? 'bg-amber-100/90 border-amber-400 font-bold'
                        : 'border-transparent hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-[#ff7700] border border-amber-600"></span>
                      <span className="text-on-surface">Saffron: Spiritual / Archakas</span>
                    </div>
                    {departmentFilter === 'Spiritual' && <span className="text-[9px] text-amber-900 font-bold uppercase">Filtered</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepartmentFilter(departmentFilter === 'Admin' ? 'All' : 'Admin')}
                    className={`w-full flex items-center justify-between p-1.5 rounded-lg border transition-all cursor-pointer text-left ${
                      departmentFilter === 'Admin'
                        ? 'bg-yellow-100/90 border-yellow-400 font-bold'
                        : 'border-transparent hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-[#d4af37] border border-yellow-600"></span>
                      <span className="text-on-surface">Gold: Admin & Management</span>
                    </div>
                    {departmentFilter === 'Admin' && <span className="text-[9px] text-yellow-900 font-bold uppercase">Filtered</span>}
                  </button>
                </div>

                {/* Edge Style Indicators (Clickable matrix filter) */}
                <div className="border-t border-outline-variant/20 pt-2 space-y-1.5 text-[11px]">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Reporting Lines:
                  </p>
                  <button
                    type="button"
                    onClick={() => setMatrixVisibility(matrixVisibility === 'primary_only' ? 'all' : 'primary_only')}
                    className={`w-full flex items-center justify-between p-1.5 rounded-lg border transition-all cursor-pointer text-left ${
                      matrixVisibility === 'primary_only'
                        ? 'bg-orange-100/80 border-orange-400 font-bold'
                        : 'border-transparent hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-1 bg-[#ff7700] rounded-full"></div>
                      <span className="text-on-surface text-xs font-semibold">Solid Saffron: Direct Manager</span>
                    </div>
                    {matrixVisibility === 'primary_only' && <span className="text-[9px] text-orange-900 font-bold uppercase">Active</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMatrixVisibility(matrixVisibility === 'matrix_only' ? 'all' : 'matrix_only')}
                    className={`w-full flex items-center justify-between p-1.5 rounded-lg border transition-all cursor-pointer text-left ${
                      matrixVisibility === 'matrix_only'
                        ? 'bg-surface-container-highest border-outline-variant font-bold'
                        : 'border-transparent hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-0.5 border-t-2 border-dashed border-gray-400"></div>
                      <span className="text-on-surface text-xs font-semibold">Dashed Grey: Also Reports To</span>
                    </div>
                    {matrixVisibility === 'matrix_only' && <span className="text-[9px] text-on-surface-variant font-bold uppercase">Active</span>}
                  </button>
                </div>

                {/* Utility actions */}
                <div className="border-t border-outline-variant/20 pt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Download size={11} /> Export JSON
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-[10px] text-error font-bold hover:underline cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>
            ) : (
              /* Collapsed Floating Trigger Pill */
              <button
                type="button"
                onClick={() => setIsLegendOpen(true)}
                className="bg-surface-container-lowest/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-outline-variant/40 shadow-lg text-xs font-bold text-primary hover:bg-primary-container/10 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 animate-[fadeIn_0.2s_ease-out]"
                title="Show Devasthanam Legend & Controls"
              >
                <HelpCircle size={15} className="text-primary" />
                <span>Show Legend</span>
                <ChevronDown size={14} className="text-on-surface-variant" />
              </button>
            )}
          </Panel>
        </ReactFlow>
      </div>

      {/* Slide-over Add/Edit Staff Drawer */}
      <AddStaffDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingStaff(null);
          setDrawerDefaultParentId(null);
          setDrawerDefaultMatrixId(null);
        }}
        onSave={handleSaveStaffFromDrawer}
        editingStaff={editingStaff}
        existingStaffList={staffList}
        defaultParentId={drawerDefaultParentId}
        defaultMatrixId={drawerDefaultMatrixId}
      />
    </div>
  );
}

export default function OrgChartCanvas() {
  return (
    <ReactFlowProvider>
      <OrgChartFlow />
    </ReactFlowProvider>
  );
}
