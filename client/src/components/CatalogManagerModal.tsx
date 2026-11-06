import React, { useState } from 'react';
import { Database, Search, Plus, Check, DollarSign, Tag, Clock, Layers } from 'lucide-react';
import { CatalogItem } from '../types/index.js';
import { CatalogApi } from '../services/api.js';

interface CatalogManagerProps {
  catalog: CatalogItem[];
  onRefreshCatalog: () => void;
}

export const CatalogManager: React.FC<CatalogManagerProps> = ({
  catalog,
  onRefreshCatalog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  // New item form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [description, setDescription] = useState('');
  const [unitType, setUnitType] = useState('hour');
  const [defaultRate, setDefaultRate] = useState('95');
  const [keywords, setKeywords] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = Array.from(new Set(catalog.map(c => c.category)));

  const filtered = catalog.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keywords.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    setIsSubmitting(true);
    try {
      await CatalogApi.create({
        code,
        name,
        category,
        description,
        unitType,
        defaultRate: parseFloat(defaultRate) || 0,
        keywords,
      });

      setShowAddForm(false);
      setCode('');
      setName('');
      setDescription('');
      setKeywords('');
      onRefreshCatalog();
    } catch (err: any) {
      alert(`Error creating item: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Service Pricing Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Predefined IT & professional service rates used by the deterministic pricing engine.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Add Form' : 'Add New Service Item'}</span>
        </button>
      </div>

      {/* Add New Item Form */}
      {showAddForm && (
        <form onSubmit={handleCreateItem} className="bg-white p-5 rounded-xl border border-blue-200 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs uppercase">
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Create New Catalog Service Entry</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Item Code</label>
              <input
                type="text"
                required
                placeholder="e.g. ENG-FE-VUE"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Service Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Vue.js Frontend Engineering"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Unit Type</label>
              <select
                value={unitType}
                onChange={e => setUnitType(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="hour">Hour</option>
                <option value="day">Day</option>
                <option value="milestone">Milestone / Fixed Package</option>
                <option value="month">Month (Retainer)</option>
                <option value="unit">Per Unit</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Default Rate ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={defaultRate}
                onChange={e => setDefaultRate(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Description</label>
            <input
              type="text"
              placeholder="Detailed description of what this service covers..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Matching Keywords (Comma-separated for AI Requirement Linking)
            </label>
            <input
              type="text"
              placeholder="e.g. vue, vuejs, frontend, ui, portal, single page app"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
            >
              {isSubmitting ? 'Saving...' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search catalog by name, code, or keyword..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto">
          {['ALL', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {item.code}
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {item.category}
                </span>
              </div>

              <h3 className="font-bold text-xs text-slate-900">{item.name}</h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{item.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 capitalize">Billing: Per {item.unitType}</span>
              <span className="font-extrabold text-sm text-slate-900">
                ${item.defaultRate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                <span className="text-[10px] text-slate-400 font-normal"> / {item.unitType}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
