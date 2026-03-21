import React, { useRef, useState } from 'react';
import { Camera, ChevronDown, ChevronUp, Eye, Loader2, Plus, RotateCcw, Save, Trash2, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCms } from '../../contexts/CmsContext';
import type { CmsAbout, CmsContact, CmsService, CmsServices } from '../../contexts/CmsContext';
import { uploadTeamPhoto } from '../../lib/uploadTeamPhoto';

type TabKey = 'about' | 'services' | 'contact';

// ── Shared components ────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}> = ({ label, value, onChange, multiline, rows = 3, placeholder }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
      {label}
    </label>
    {multiline ? (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-slate-100 placeholder-slate-500 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 outline-none transition-all resize-none"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-slate-100 placeholder-slate-500 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 outline-none transition-all"
      />
    )}
  </div>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-xl border border-white/8 bg-slate-900 p-6">
    <h3 className="text-sm font-bold uppercase tracking-widest text-teal-400 mb-5">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

// ── Team Member Photo Uploader ────────────────────────────────────────────────

interface PhotoUploaderProps {
  name: string;
  image: string;
  onImageChange: (url: string) => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ name, image, onImageChange }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }

    setError('');
    setUploading(true);
    try {
      const url = await uploadTeamPhoto(file);
      onImageChange(url);
    } catch (err: any) {
      setError(err?.message || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar preview */}
      <div
        className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-700 border-2 border-white/10 group cursor-pointer"
        onClick={() => fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        title="Click or drag to upload photo"
      >
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
            <span className="text-2xl font-bold text-slate-300">{name?.charAt(0) || '?'}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
          ) : (
            <><Upload className="w-3.5 h-3.5" /> Upload</>
          )}
        </button>

        {image && (
          <button
            type="button"
            onClick={() => onImageChange('')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Remove photo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-xs text-center">{error}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </div>
  );
};

// ── About tab ────────────────────────────────────────────────────────────────

const AboutTab: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const { content, updateAbout } = useCms();
  const [draft, setDraft] = useState<CmsAbout>({
    ...content.about,
    values: content.about.values.map(v => ({ ...v })),
    whyFeatures: [...content.about.whyFeatures],
    stats: content.about.stats.map(s => ({ ...s })),
    team: content.about.team.map(t => ({ ...t })),
  });

  const set = (key: keyof CmsAbout, value: any) =>
    setDraft(d => ({ ...d, [key]: value }));

  const setValueItem = (i: number, field: 'title' | 'desc', val: string) =>
    setDraft(d => ({ ...d, values: d.values.map((x, j) => j === i ? { ...x, [field]: val } : x) }));

  const addValue = () =>
    setDraft(d => ({ ...d, values: [...d.values, { title: 'New Value', desc: 'Description here.' }] }));

  const removeValue = (i: number) =>
    setDraft(d => ({ ...d, values: d.values.filter((_, j) => j !== i) }));

  const setFeature = (i: number, val: string) =>
    setDraft(d => ({ ...d, whyFeatures: d.whyFeatures.map((x, j) => j === i ? val : x) }));

  const addFeature = () =>
    setDraft(d => ({ ...d, whyFeatures: [...d.whyFeatures, 'New feature'] }));

  const removeFeature = (i: number) =>
    setDraft(d => ({ ...d, whyFeatures: d.whyFeatures.filter((_, j) => j !== i) }));

  const setStat = (i: number, field: 'value' | 'label', val: string) =>
    setDraft(d => ({ ...d, stats: d.stats.map((x, j) => j === i ? { ...x, [field]: val } : x) }));

  const setTeamField = (i: number, field: 'name' | 'role' | 'image', val: string) =>
    setDraft(d => ({ ...d, team: d.team.map((x, j) => j === i ? { ...x, [field]: val } : x) }));

  const addTeamMember = () =>
    setDraft(d => ({ ...d, team: [...d.team, { name: 'New Member', role: 'Role', image: '' }] }));

  const removeTeamMember = (i: number) =>
    setDraft(d => ({ ...d, team: d.team.filter((_, j) => j !== i) }));

  const handleSave = () => { updateAbout(draft); onSaved(); };

  return (
    <div className="space-y-6">
      <SectionCard title="Hero Section">
        <Field label="Title Line 1" value={draft.heroTitle1} onChange={v => set('heroTitle1', v)} />
        <Field label="Title Line 2 (gradient)" value={draft.heroTitle2} onChange={v => set('heroTitle2', v)} />
        <Field label="Description" value={draft.heroDesc} onChange={v => set('heroDesc', v)} multiline rows={3} />
      </SectionCard>

      <SectionCard title="Mission & Vision">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Field label="Mission Title" value={draft.missionTitle} onChange={v => set('missionTitle', v)} />
            <Field label="Mission Text" value={draft.missionText} onChange={v => set('missionText', v)} multiline rows={4} />
          </div>
          <div className="space-y-3">
            <Field label="Vision Title" value={draft.visionTitle} onChange={v => set('visionTitle', v)} />
            <Field label="Vision Text" value={draft.visionText} onChange={v => set('visionText', v)} multiline rows={4} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Our Values">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Section Title" value={draft.valuesTitle} onChange={v => set('valuesTitle', v)} />
          <Field label="Section Subtitle" value={draft.valuesSubtitle} onChange={v => set('valuesSubtitle', v)} />
        </div>
        <div className="space-y-3 pt-2">
          {draft.values.map((val, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-slate-800/50 border border-white/5">
              <div className="flex-1 space-y-2">
                <Field label={`Value ${i + 1} Title`} value={val.title} onChange={v => setValueItem(i, 'title', v)} />
                <Field label="Description" value={val.desc} onChange={v => setValueItem(i, 'desc', v)} multiline rows={2} />
              </div>
              <button onClick={() => removeValue(i)} className="self-start mt-5 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button onClick={addValue} className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors">
            <Plus className="w-4 h-4" /> Add Value
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Why Choose Us">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Heading" value={draft.whyTitle} onChange={v => set('whyTitle', v)} />
          <Field label="Subheading" value={draft.whySubtitle} onChange={v => set('whySubtitle', v)} />
        </div>
        <div className="space-y-2 pt-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Feature Points</p>
          {draft.whyFeatures.map((feat, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={feat}
                onChange={e => setFeature(i, e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-slate-100 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 outline-none transition-all"
              />
              <button onClick={() => removeFeature(i)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button onClick={addFeature} className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors">
            <Plus className="w-4 h-4" /> Add Feature
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Stats">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {draft.stats.map((stat, i) => (
            <div key={i} className="space-y-2 p-3 rounded-lg bg-slate-800/50 border border-white/5">
              <Field label="Value" value={stat.value} onChange={v => setStat(i, 'value', v)} />
              <Field label="Label" value={stat.label} onChange={v => setStat(i, 'label', v)} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Team ── */}
      <SectionCard title="Team Members">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Section Title" value={draft.teamTitle} onChange={v => set('teamTitle', v)} />
          <Field label="Section Subtitle" value={draft.teamSubtitle} onChange={v => set('teamSubtitle', v)} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-2">
          {draft.team.map((member, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-slate-800/60 p-4">
              {/* Header row */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Member {i + 1}
                </span>
                <button
                  onClick={() => removeTeamMember(i)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Remove member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Photo + fields side by side */}
              <div className="flex gap-4 items-start">
                {/* Photo uploader */}
                <PhotoUploader
                  name={member.name}
                  image={member.image || ''}
                  onImageChange={url => setTeamField(i, 'image', url)}
                />

                {/* Text fields */}
                <div className="flex-1 space-y-3 min-w-0">
                  <Field
                    label="Full Name"
                    value={member.name}
                    onChange={v => setTeamField(i, 'name', v)}
                    placeholder="e.g. Dr. Sarah Chen"
                  />
                  <Field
                    label="Role / Title"
                    value={member.role}
                    onChange={v => setTeamField(i, 'role', v)}
                    placeholder="e.g. Founder & CEO"
                  />
                </div>
              </div>

              {/* Photo storage note */}
              <p className="mt-3 text-[11px] text-slate-500 leading-snug">
                {member.image
                  ? member.image.startsWith('data:')
                    ? 'Preview stored locally (R2 not connected yet). Photo will be uploaded to R2 once configured.'
                    : `Stored in R2: ${member.image.slice(0, 60)}…`
                  : 'No photo — initial on About page will be shown.'}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={addTeamMember}
          className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors mt-2"
        >
          <Plus className="w-4 h-4" /> Add Team Member
        </button>

        {/* R2 setup hint */}
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300 leading-relaxed">
          <strong>R2 Storage setup:</strong> To persist photos across devices and deployments, configure your
          Cloudflare R2 bucket. Set <code className="bg-black/30 px-1 rounded">STUDYGLOBAL_UPLOADS</code> binding
          and <code className="bg-black/30 px-1 rounded">R2_PUBLIC_BASE_URL</code> in your Cloudflare Pages
          dashboard. Until then, photos are stored as local previews.
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm transition-colors shadow-lg shadow-teal-900/40"
        >
          <Save className="w-4 h-4" /> Save About Page
        </button>
      </div>
    </div>
  );
};

// ── Services tab ─────────────────────────────────────────────────────────────

const ServicesTab: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const { content, updateServices } = useCms();
  const [draft, setDraft] = useState<CmsServices>({
    ...content.services,
    services: content.services.services.map(s => ({ ...s, features: [...s.features] })),
  });
  const [expanded, setExpanded] = useState<number | null>(0);

  const set = (key: keyof CmsServices, value: any) =>
    setDraft(d => ({ ...d, [key]: value }));

  const setService = (i: number, field: keyof CmsService, val: any) =>
    setDraft(d => ({
      ...d,
      services: d.services.map((s, j) => j === i ? { ...s, [field]: val } : s),
    }));

  const setFeature = (si: number, fi: number, val: string) =>
    setDraft(d => ({
      ...d,
      services: d.services.map((s, j) =>
        j !== si ? s : { ...s, features: s.features.map((f, k) => k === fi ? val : f) }
      ),
    }));

  const addFeature = (si: number) =>
    setDraft(d => ({
      ...d,
      services: d.services.map((s, j) => j === si ? { ...s, features: [...s.features, 'New feature'] } : s),
    }));

  const removeFeature = (si: number, fi: number) =>
    setDraft(d => ({
      ...d,
      services: d.services.map((s, j) =>
        j !== si ? s : { ...s, features: s.features.filter((_, k) => k !== fi) }
      ),
    }));

  const addService = () =>
    setDraft(d => ({
      ...d,
      services: [...d.services, { title: 'New Service', desc: 'Service description.', features: ['Feature 1'] }],
    }));

  const removeService = (i: number) =>
    setDraft(d => ({ ...d, services: d.services.filter((_, j) => j !== i) }));

  const handleSave = () => { updateServices(draft); onSaved(); };

  return (
    <div className="space-y-6">
      <SectionCard title="Hero Section">
        <Field label="Title Line 1" value={draft.heroTitle1} onChange={v => set('heroTitle1', v)} />
        <Field label="Title Line 2 (gradient)" value={draft.heroTitle2} onChange={v => set('heroTitle2', v)} />
        <Field label="Description" value={draft.heroDesc} onChange={v => set('heroDesc', v)} multiline rows={3} />
      </SectionCard>

      <SectionCard title="Services">
        <div className="space-y-3">
          {draft.services.map((svc, i) => (
            <div key={i} className="rounded-lg border border-white/8 bg-slate-800/40 overflow-hidden">
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <span className="text-sm font-semibold text-slate-200">{svc.title || `Service ${i + 1}`}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); removeService(i); }}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {expanded === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {expanded === i && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                  <Field label="Title" value={svc.title} onChange={v => setService(i, 'title', v)} />
                  <Field label="Description" value={svc.desc} onChange={v => setService(i, 'desc', v)} multiline rows={3} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Features</p>
                    <div className="space-y-2">
                      {svc.features.map((feat, fi) => (
                        <div key={fi} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={feat}
                            onChange={e => setFeature(i, fi, e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-slate-100 text-sm focus:border-teal-500 outline-none transition-all"
                          />
                          <button onClick={() => removeFeature(i, fi)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addFeature(i)} className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Feature
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button onClick={addService} className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors">
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Call to Action (CTA)">
        <Field label="Heading" value={draft.ctaTitle} onChange={v => set('ctaTitle', v)} />
        <Field label="Description" value={draft.ctaDesc} onChange={v => set('ctaDesc', v)} multiline rows={2} />
      </SectionCard>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm transition-colors shadow-lg shadow-teal-900/40"
        >
          <Save className="w-4 h-4" /> Save Services Page
        </button>
      </div>
    </div>
  );
};

// ── Contact tab ───────────────────────────────────────────────────────────────

const ContactTab: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const { content, updateContact } = useCms();
  const [draft, setDraft] = useState<CmsContact>({ ...content.contact });

  const set = (key: keyof CmsContact, val: string) =>
    setDraft(d => ({ ...d, [key]: val }));

  const handleSave = () => { updateContact(draft); onSaved(); };

  return (
    <div className="space-y-6">
      <SectionCard title="Hero Section">
        <Field label="Title Line 1" value={draft.heroTitle1} onChange={v => set('heroTitle1', v)} />
        <Field label="Title Line 2 (gradient)" value={draft.heroTitle2} onChange={v => set('heroTitle2', v)} />
        <Field label="Description" value={draft.heroDesc} onChange={v => set('heroDesc', v)} multiline rows={3} />
      </SectionCard>

      <SectionCard title="Contact Information">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Email" value={draft.email} onChange={v => set('email', v)} />
          <Field label="Phone" value={draft.phone} onChange={v => set('phone', v)} />
          <Field label="Address" value={draft.address} onChange={v => set('address', v)} />
          <Field label="Office Hours" value={draft.hours} onChange={v => set('hours', v)} />
        </div>
      </SectionCard>

      <SectionCard title="Live Chat Card">
        <Field label="Description" value={draft.liveChatDesc} onChange={v => set('liveChatDesc', v)} multiline rows={2} />
      </SectionCard>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm transition-colors shadow-lg shadow-teal-900/40"
        >
          <Save className="w-4 h-4" /> Save Contact Page
        </button>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const AdminCMS: React.FC = () => {
  const { resetToDefaults } = useCms();
  const [activeTab, setActiveTab] = useState<TabKey>('about');
  const [saved, setSaved] = useState(false);

  const handleSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Reset all page content to defaults? This cannot be undone.')) {
      resetToDefaults();
      handleSaved();
    }
  };

  const tabs: { key: TabKey; label: string; previewPath: string }[] = [
    { key: 'about',    label: 'About Page',    previewPath: '/about' },
    { key: 'services', label: 'Services Page',  previewPath: '/services' },
    { key: 'contact',  label: 'Contact Page',   previewPath: '/contact' },
  ];

  const activeTab_ = tabs.find(t => t.key === activeTab)!;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Page Content Editor</h1>
          <p className="text-sm text-slate-400 mt-0.5">Edit text and team photos for your public pages.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Saved!
            </span>
          )}
          <Link
            to={activeTab_.previewPath}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 text-sm font-medium transition-colors"
          >
            <Eye className="w-4 h-4" /> Preview
          </Link>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset Defaults
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-900 border border-white/8 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-teal-500 text-white shadow-md shadow-teal-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'about'    && <AboutTab    onSaved={handleSaved} />}
      {activeTab === 'services' && <ServicesTab onSaved={handleSaved} />}
      {activeTab === 'contact'  && <ContactTab  onSaved={handleSaved} />}
    </div>
  );
};

export default AdminCMS;
