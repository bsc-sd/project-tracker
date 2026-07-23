
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlinePlus } from "react-icons/hi";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { techLeadsApi, domainsApi } from "../api/endpoints";
import type { TechLead, TechLeadForm, Domain } from "../types";

const TechLeads: React.FC = () => {
  const [techLeads, setTechLeads] = useState<TechLead[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTechLead, setEditingTechLead] = useState<TechLead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TechLead | null>(null);
  const [form, setForm] = useState<TechLeadForm>({ domain_id: 0, tech_lead_name: "" });

  const fetchData = async () => {
    try {
      const [tlRes, domRes] = await Promise.all([
        techLeadsApi.getAll(),
        domainsApi.getAll(),
      ]);
      setTechLeads(tlRes.data);
      setDomains(domRes.data);
    } catch {
      toast.error("Failed to load tech leads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingTechLead(null);
    setForm({ domain_id: domains[0]?.id || 0, tech_lead_name: "" });
    setShowModal(true);
  };

  const openEdit = (tl: TechLead) => {
    setEditingTechLead(tl);
    setForm({ domain_id: tl.domain_id, tech_lead_name: tl.tech_lead_name });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTechLead) {
        await techLeadsApi.update(editingTechLead.id, form);
        toast.success("Tech lead updated");
      } else {
        await techLeadsApi.create(form);
        toast.success("Tech lead created");
      }
      setShowModal(false);
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await techLeadsApi.delete(deleteTarget.id);
      toast.success("Tech lead deleted");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete tech lead. They may have associated projects.");
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "tech_lead_name", label: "Name" },
    { key: "domain_name", label: "Domain" },
    {
      key: "created_at",
      label: "Created",
      render: (tl: TechLead) => new Date(tl.created_at).toLocaleDateString(),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Tech Leads</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" />
          New Tech Lead
        </button>
      </div>

      <DataTable
        columns={columns}
        data={techLeads}
        onEdit={openEdit}
        onDelete={(tl) => setDeleteTarget(tl)}
      />

      <FormModal
        isOpen={showModal}
        title={editingTechLead ? "Edit Tech Lead" : "Create Tech Lead"}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            className="input-field"
            value={form.tech_lead_name}
            onChange={(e) => setForm({ ...form, tech_lead_name: e.target.value })}
            placeholder="e.g., John Smith"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Domain *</label>
          <select
            className="select-field"
            value={form.domain_id}
            onChange={(e) => setForm({ ...form, domain_id: Number(e.target.value) })}
            required
          >
            <option value={0} disabled>Select domain</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>{d.domain_name}</option>
            ))}
          </select>
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Tech Lead"
        message={`Are you sure you want to delete "${deleteTarget?.tech_lead_name}"? All their projects will also be deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default TechLeads;

