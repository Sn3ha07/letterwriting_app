import { useState } from 'react';
import {
  LetterTemplate,
  Contact,
  LetterType,
  ToneOption,
  LengthOption,
  ComplexityOption,
} from '../types';
import {
  BookmarkCheck,
  Users,
  Search,
  Plus,
  ArrowUpRight,
  Trash2,
  Edit2,
  Mail,
  Building,
  Phone,
  FileText,
  Sparkles,
  Check,
  X,
} from 'lucide-react';

interface LibraryViewProps {
  templates: LetterTemplate[];
  contacts: Contact[];
  onSelectTemplate: (template: LetterTemplate) => void;
  onSelectContactToDraft: (contact: Contact) => void;
  onAddContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onAddCustomTemplate: (template: LetterTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export function LibraryView({
  templates,
  contacts,
  onSelectTemplate,
  onSelectContactToDraft,
  onAddContact,
  onDeleteContact,
  onAddCustomTemplate,
  onDeleteTemplate,
}: LibraryViewProps) {
  const [subTab, setSubTab] = useState<'templates' | 'contacts'>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Contact Modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    title: '',
    organization: '',
    email: '',
    phone: '',
    address: '',
    salutation: 'Dear ',
    relationship: 'Professional Contact',
    notes: '',
  });

  // Template Modal state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<LetterTemplate>>({
    title: '',
    category: 'custom',
    description: '',
    letterType: 'Cover Letter',
    defaultTone: 'Warmly Professional',
    defaultLength: 'Standard',
    defaultComplexity: 'Professional & Polished',
    samplePurpose: '',
    sampleKeyDetails: '',
  });

  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.letterType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ? true : tpl.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredContacts = contacts.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSaveContact = () => {
    if (!newContact.name?.trim()) return;
    const contact: Contact = {
      id: `c-${Date.now()}`,
      name: newContact.name,
      title: newContact.title || '',
      organization: newContact.organization || '',
      email: newContact.email || '',
      phone: newContact.phone || '',
      address: newContact.address || '',
      salutation: newContact.salutation || `Dear ${newContact.name},`,
      relationship: newContact.relationship || 'Professional',
      notes: newContact.notes || '',
      createdAt: new Date().toISOString().split('T')[0],
    };
    onAddContact(contact);
    setIsContactModalOpen(false);
    setNewContact({
      name: '',
      title: '',
      organization: '',
      email: '',
      phone: '',
      address: '',
      salutation: 'Dear ',
      relationship: 'Professional Contact',
      notes: '',
    });
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.title?.trim()) return;
    const template: LetterTemplate = {
      id: `tpl-user-${Date.now()}`,
      title: newTemplate.title,
      category: 'custom',
      description: newTemplate.description || 'Custom user saved template',
      letterType: (newTemplate.letterType as LetterType) || 'Cover Letter',
      defaultTone: (newTemplate.defaultTone as ToneOption) || 'Warmly Professional',
      defaultLength: (newTemplate.defaultLength as LengthOption) || 'Standard',
      defaultComplexity:
        (newTemplate.defaultComplexity as ComplexityOption) || 'Professional & Polished',
      samplePurpose: newTemplate.samplePurpose || '',
      sampleKeyDetails: newTemplate.sampleKeyDetails || '',
      isCustom: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    onAddCustomTemplate(template);
    setIsTemplateModalOpen(false);
    setNewTemplate({
      title: '',
      category: 'custom',
      description: '',
      letterType: 'Cover Letter',
      defaultTone: 'Warmly Professional',
      defaultLength: 'Standard',
      defaultComplexity: 'Professional & Polished',
      samplePurpose: '',
      sampleKeyDetails: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Subtabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-serif-formal text-neutral-900 tracking-tight">
            Templates & Contacts Library
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Access pre-engineered formal correspondence templates and manage your verified recipient address book
          </p>
        </div>

        {/* Subtabs & Add Action */}
        <div className="flex items-center gap-3">
          <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200">
            <button
              id="library-templates-tab-btn"
              type="button"
              onClick={() => setSubTab('templates')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                subTab === 'templates'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Templates ({templates.length})</span>
            </button>

            <button
              id="library-contacts-tab-btn"
              type="button"
              onClick={() => setSubTab('contacts')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                subTab === 'contacts'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Contacts ({contacts.length})</span>
            </button>
          </div>

          {subTab === 'templates' ? (
            <button
              id="add-template-btn"
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Template</span>
            </button>
          ) : (
            <button
              id="add-contact-btn"
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Contact</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-white p-3 rounded-xl border border-neutral-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            id="library-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              subTab === 'templates'
                ? 'Search templates by title, type...'
                : 'Search contacts by name, organization...'
            }
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700"
          />
        </div>

        {subTab === 'templates' && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
            {['all', 'cover-letter', 'recommendation', 'corporate', 'inquiry', 'custom'].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg capitalize whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-amber-800 text-white font-medium'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat === 'all' ? 'All Templates' : cat.replace('-', ' ')}
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* Templates Tab Content */}
      {subTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-neutral-200/90 hover:border-neutral-300 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                    {tpl.letterType}
                  </span>
                  {tpl.isCustom && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-medium">
                        Custom
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteTemplate(tpl.id)}
                        className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold font-serif-formal text-neutral-900 group-hover:text-amber-900 transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>

                {/* Preset attributes pill row */}
                <div className="flex flex-wrap gap-1.5 mt-4 text-[10.5px]">
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded">
                    {tpl.defaultTone}
                  </span>
                  <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded">
                    {tpl.defaultLength}
                  </span>
                  <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded">
                    {tpl.defaultComplexity}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">
                  {tpl.isCustom ? 'User Created' : 'Curated Preset'}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectTemplate(tpl)}
                  className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shadow-xs"
                >
                  <span>Use Template</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-neutral-200 p-8">
              <FileText className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
              <p className="text-sm font-medium text-neutral-700">No matching templates found</p>
              <p className="text-xs text-neutral-500 mt-1">Try another search query or clear category filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Contacts Tab Content */}
      {subTab === 'contacts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-2xl border border-neutral-200/90 hover:border-neutral-300 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center font-serif-formal shadow-xs">
                    {contact.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteContact(contact.id)}
                    className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                    title="Delete contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-neutral-900">{contact.name}</h3>
                <div className="text-xs text-neutral-600 font-medium mt-0.5">{contact.title}</div>
                <div className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                  <Building className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span className="truncate">{contact.organization}</span>
                </div>

                {contact.email && (
                  <div className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}

                {contact.salutation && (
                  <div className="mt-3 text-[11px] p-2 bg-neutral-50 rounded-lg text-neutral-600 border border-neutral-100">
                    <span className="font-semibold text-neutral-700">Formal Greeting:</span>{' '}
                    {contact.salutation}
                  </div>
                )}

                {contact.notes && (
                  <div className="mt-2 text-[11px] text-neutral-500 italic line-clamp-2">
                    "{contact.notes}"
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[10.5px] text-neutral-400">{contact.relationship}</span>
                <button
                  type="button"
                  onClick={() => onSelectContactToDraft(contact)}
                  className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shadow-xs"
                >
                  <span>Draft Letter</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredContacts.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-neutral-200 p-8">
              <Users className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
              <p className="text-sm font-medium text-neutral-700">No contacts in address book</p>
              <p className="text-xs text-neutral-500 mt-1">Click "Add Contact" above to store key recipients.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-800" />
                Add New Recipient Contact
              </h3>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-amber-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Title / Role</label>
                  <input
                    type="text"
                    value={newContact.title}
                    onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                    placeholder="e.g. Dean of Admissions"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-amber-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Organization</label>
                  <input
                    type="text"
                    value={newContact.organization}
                    onChange={(e) => setNewContact({ ...newContact, organization: e.target.value })}
                    placeholder="e.g. Columbia University"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-amber-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="e.g. a.pendelton@columbia.edu"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-amber-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Preferred Salutation</label>
                  <input
                    type="text"
                    value={newContact.salutation}
                    onChange={(e) => setNewContact({ ...newContact, salutation: e.target.value })}
                    placeholder="e.g. Dear Dean Pendelton,"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-amber-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Mailing Address</label>
                <textarea
                  rows={2}
                  value={newContact.address}
                  onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                  placeholder="e.g. 116th and Broadway, Low Memorial Library\nNew York, NY 10027"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-amber-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Notes & Context</label>
                <input
                  type="text"
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  placeholder="e.g. Values concise empirical data and academic titles"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-amber-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-neutral-300 text-xs text-neutral-700 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveContact}
                disabled={!newContact.name?.trim()}
                className="px-4 py-1.5 rounded-lg bg-amber-800 text-white text-xs font-medium hover:bg-amber-900 disabled:opacity-50"
              >
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Template Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-amber-800" />
                Create Custom Letter Template
              </h3>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Template Title *</label>
                <input
                  type="text"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  placeholder="e.g. Senior Faculty Appointment Pitch"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-amber-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Letter Type</label>
                  <select
                    value={newTemplate.letterType}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, letterType: e.target.value as LetterType })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                  >
                    <option value="Cover Letter">Cover Letter</option>
                    <option value="Recommendation Request">Recommendation Request</option>
                    <option value="Formal Email">Formal Email</option>
                    <option value="Formal Inquiry / Petition">Formal Inquiry / Petition</option>
                    <option value="Salary & Promotion Review">Salary & Promotion Review</option>
                    <option value="Formal Resignation">Formal Resignation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Default Tone</label>
                  <select
                    value={newTemplate.defaultTone}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, defaultTone: e.target.value as ToneOption })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                  >
                    <option value="Executive & Authoritative">Executive & Authoritative</option>
                    <option value="Warmly Professional">Warmly Professional</option>
                    <option value="Deferential & Respectful">Deferential & Respectful</option>
                    <option value="Direct & Concise">Direct & Concise</option>
                    <option value="Persuasive & Compelling">Persuasive & Compelling</option>
                    <option value="Diplomatic & Firm">Diplomatic & Firm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="e.g. Designed for tenured department chair inquiries"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-amber-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Sample Purpose</label>
                <input
                  type="text"
                  value={newTemplate.samplePurpose}
                  onChange={(e) => setNewTemplate({ ...newTemplate, samplePurpose: e.target.value })}
                  placeholder="e.g. Formal application for Department Chair in Bioengineering"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-amber-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Default Key Details / Bullets
                </label>
                <textarea
                  rows={3}
                  value={newTemplate.sampleKeyDetails}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, sampleKeyDetails: e.target.value })
                  }
                  placeholder="- Secured $4.2M NIH R01 grant funding.\n- Mentored 14 doctoral dissertations.\n- Authored 32 peer-reviewed journal papers."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-amber-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-neutral-300 text-xs text-neutral-700 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={!newTemplate.title?.trim()}
                className="px-4 py-1.5 rounded-lg bg-amber-800 text-white text-xs font-medium hover:bg-amber-900 disabled:opacity-50"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
