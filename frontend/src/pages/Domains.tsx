
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlinePlus } from "react-icons/hi";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { domainsApi } from "../api/endpoints";
import type { Domain, DomainForm } from "../types";

const Domains: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Domain | null>(null);
  const [form, setForm] = useState<DomainForm>({ domain_name: "" });

  const fetchData = async () => {
    try {
      const res = await domainsApi.getAll();
      setDomains(res.data);
    } catch {
      toast.error("Failed to load domains");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingDomain(null);
    setForm({ domain_name: "" });
    setShowModal(true);
  };

  const openEdit = (domain: Domain) => {
    setEditingDomain(domain);
    setForm({ domain_name: domain.domain_name });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDomain) {
        await domainsApi.update(editingDomain.id, form);
        toast.success("Domain updated");
      } else {
        await domainsApi.create(form);
        toast.success("Domain created");
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
      await domainsApi.delete(deleteTarget.id);
      toast.success("Domain deleted");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete domain. It may have associated tech leads.");
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "domain_name", label: "Domain Name" },
    {
      key: "created_at",
      label: "Created",
      render: (d: Domain) => new Date(d.created_at).toLocaleDateString(),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Service Delivery Domains</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" />
          New Domain
        </button>
      </div>

      <DataTable
        columns={columns}
        data={domains}
        onEdit={openEdit}
        onDelete={(d) => setDeleteTarget(d)}
      />

      <FormModal
        isOpen={showModal}
        title={editingDomain ? "Edit Domain" : "Create Domain"}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name *</label>
          <input
            className="input-field"
            value={form.domain_name}
            onChange={(e) => setForm({ domain_name: e.target.value })}
            placeholder="e.g., Cloud Services"
            required
          />
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Domain"
        message={`Are you sure you want to delete "${deleteTarget?.domain_name}"? All associated tech leads and their projects will also be deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Domains;

