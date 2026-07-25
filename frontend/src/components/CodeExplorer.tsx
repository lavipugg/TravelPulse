import React, { useState, useMemo } from 'react';
import { Folder, FolderOpen, FileCode, Copy, Check, Search, Terminal, ChevronRight, ChevronDown, Layers, Server, Layout } from 'lucide-react';
import { backendFiles } from '../data/backendCode';
import { frontendFiles } from '../data/frontendCode';
import { CodeFile } from '../types';

interface TreeNode {
  name: string;
  fullPath: string;
  isFolder: boolean;
  file?: CodeFile;
  children: TreeNode[];
}

function buildTree(files: CodeFile[], rootPrefix: string): TreeNode {
  const root: TreeNode = {
    name: rootPrefix,
    fullPath: rootPrefix,
    isFolder: true,
    children: []
  };

  files.forEach(file => {
    const relativePath = file.path.startsWith(rootPrefix + '/')
      ? file.path.slice(rootPrefix.length + 1)
      : file.path;

    const parts = relativePath.split('/');
    let current = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      let child = current.children.find(c => c.name === part);

      if (!child) {
        child = {
          name: part,
          fullPath: current.fullPath + '/' + part,
          isFolder: !isLast,
          file: isLast ? file : undefined,
          children: []
        };
        current.children.push(child);
      }

      current = child;
    });
  });

  const sortNodes = (node: TreeNode) => {
    node.children.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortNodes);
  };

  sortNodes(root);
  return root;
}

export const CodeExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'backend' | 'frontend'>('backend');
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<CodeFile>(
    activeTab === 'backend' ? backendFiles[0] : frontendFiles[0]
  );
  const [copied, setCopied] = useState(false);

  const currentFileList = activeTab === 'backend' ? backendFiles : frontendFiles;

  // Build tree data structure
  const rootTree = useMemo(() => {
    return buildTree(currentFileList, activeTab);
  }, [currentFileList, activeTab]);

  // Keep track of expanded folder paths
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>(() => {
    // Collect all folder paths and expand by default
    const map: Record<string, boolean> = {};
    const collectPaths = (node: TreeNode) => {
      if (node.isFolder) {
        map[node.fullPath] = true;
        node.children.forEach(collectPaths);
      }
    };
    collectPaths(rootTree);
    return map;
  });

  const toggleFolder = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPaths(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTabChange = (tab: 'backend' | 'frontend') => {
    setActiveTab(tab);
    const newList = tab === 'backend' ? backendFiles : frontendFiles;
    setSelectedFile(newList[0]);

    // Reset expanded paths for new tab
    const newRoot = buildTree(newList, tab);
    const map: Record<string, boolean> = {};
    const collectPaths = (node: TreeNode) => {
      if (node.isFolder) {
        map[node.fullPath] = true;
        node.children.forEach(collectPaths);
      }
    };
    collectPaths(newRoot);
    setExpandedPaths(map);
  };

  // Filtered list when searching
  const filteredFiles = useMemo(() => {
    if (!search.trim()) return null;
    return currentFileList.filter(f =>
      f.path.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [currentFileList, search]);

  // Recursive Tree Node Item Component
  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedPaths[node.fullPath] !== false;

    if (node.isFolder) {
      return (
        <div key={node.fullPath} className="space-y-0.5">
          <button
            onClick={(e) => toggleFolder(node.fullPath, e)}
            style={{ paddingLeft: `${depth * 14 + 6}px` }}
            className="w-full text-left py-1 px-1.5 rounded hover:bg-zinc-800/60 text-zinc-300 transition flex items-center gap-1.5 text-xs font-mono group"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:text-amber-300" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-amber-400/80 shrink-0 group-hover:text-amber-300" />
            )}
            <span className="font-semibold text-zinc-200 text-[11px] truncate">{node.name}</span>
          </button>

          {isExpanded && (
            <div className="space-y-0.5 border-l border-zinc-800/70 ml-3">
              {node.children.map(child => renderTreeNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    if (!node.file) return null;
    const file = node.file;
    const isSelected = selectedFile.path === file.path;

    return (
      <button
        key={node.fullPath}
        onClick={() => setSelectedFile(file)}
        style={{ paddingLeft: `${depth * 14 + 18}px` }}
        className={`w-full text-left py-1.5 px-2 rounded border transition flex items-center justify-between gap-1 text-xs ${
          isSelected
            ? 'bg-blue-950/60 border-blue-500/80 text-blue-200 font-bold shadow-sm'
            : 'bg-zinc-950/40 border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 hover:border-zinc-800/80'
        }`}
      >
        <div className="flex items-center gap-1.5 font-mono truncate text-[11px]">
          <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-400' : 'text-zinc-500'}`} />
          <span className="truncate">{node.name}</span>
        </div>
        {isSelected && (
          <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-mono font-bold shrink-0">
            ATTIVO
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4 py-2">
      {/* Top Controls Bar */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-mono uppercase tracking-wide">
            <Terminal className="w-4 h-4 text-blue-400" />
            ARCHITETTURA E ALBERO FILE PROGETTO
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Naviga nella struttura gerarchica ad albero delle cartelle <code className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-blue-300 font-mono text-[11px]">/backend</code> e <code className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-sky-300 font-mono text-[11px]">/frontend</code>.
          </p>
        </div>

        {/* Tab Toggle /backend vs /frontend */}
        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 shrink-0 font-mono text-xs shadow-inner">
          <button
            onClick={() => handleTabChange('backend')}
            className={`flex items-center gap-2 px-3.5 py-1.5 font-bold rounded transition ${
              activeTab === 'backend'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            /backend (Java Spring)
          </button>
          <button
            onClick={() => handleTabChange('frontend')}
            className={`flex items-center gap-2 px-3.5 py-1.5 font-bold rounded transition ${
              activeTab === 'frontend'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            /frontend (React App)
          </button>
        </div>
      </div>

      {/* Grid Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Sidebar: Interactive Folder Tree */}
        <div className="lg:col-span-4 bg-[#0c0c0e] border border-zinc-800 rounded-xl p-3 shadow-lg space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Filtra file o pacchetto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 pl-8 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between px-1 pb-1 border-b border-zinc-900">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              ALBERO CARTELLE /{activeTab.toUpperCase()}
            </span>
            <span className="text-blue-400 bg-blue-950/80 border border-blue-800/80 px-2 py-0.5 rounded font-bold">
              {currentFileList.length} FILE
            </span>
          </div>

          <div className="space-y-1 max-h-[540px] overflow-y-auto pr-1 select-none">
            {filteredFiles ? (
              /* Search Filtered List */
              <div className="space-y-1">
                {filteredFiles.map((file, idx) => {
                  const isSelected = selectedFile.path === file.path;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left p-2 rounded-lg border text-xs transition flex flex-col gap-0.5 ${
                        isSelected
                          ? 'bg-blue-950/60 border-blue-500 text-zinc-100 shadow'
                          : 'bg-zinc-950/60 border-zinc-800/60 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-mono font-bold text-[11px]">
                        <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-400' : 'text-zinc-500'}`} />
                        <span className="truncate">{file.path}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 line-clamp-1">{file.description}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Hierarchical Visual Folder Tree */
              renderTreeNode(rootTree)
            )}
          </div>
        </div>

        {/* Right Code Viewer */}
        <div className="lg:col-span-8 bg-[#0c0c0e] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          {/* Header Code Viewer */}
          <div className="bg-zinc-900/90 px-4 py-2.5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="overflow-hidden font-mono">
                <span className="text-xs font-bold text-zinc-100 truncate block">
                  {selectedFile.path}
                </span>
                <span className="text-[10px] text-zinc-400 line-clamp-1 font-sans">
                  {selectedFile.description}
                </span>
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold rounded-lg shadow transition shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'COPIATO!' : 'COPIA CODICE'}
            </button>
          </div>

          {/* Code Window */}
          <div className="p-4 bg-[#09090b] font-mono text-xs text-zinc-300 overflow-x-auto max-h-[580px] leading-relaxed">
            <pre className="text-[12px] leading-5">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

